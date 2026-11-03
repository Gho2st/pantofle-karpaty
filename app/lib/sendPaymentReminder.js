// app/lib/sendPaymentReminder.js
// Jeden mail z przypomnieniem o niedokończonej płatności Stripe — wysyłany,
// gdy wygaśnie pierwsza (godzinna) sesja płatności. Zawiera link do nowej,
// dobowej sesji. Po jej wygaśnięciu zamówienie wygasa normalnie.
import crypto from "crypto";
import nodemailer from "nodemailer";
import prisma from "@/app/lib/prisma";
import { escapeHtml } from "@/app/lib/escapeHtml";
import { createCheckoutSession } from "@/app/lib/stripeCheckout";

// Zwraca true, jeśli przypomnienie przejęło zamówienie (nowa sesja płatności)
export async function sendPaymentReminder(orderId, expiredSessionId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  // Tylko oczekujące zamówienie, którego aktualną sesją jest ta wygasła
  // (ponowne dostarczenie webhooka albo nowsza sesja = nic nie robimy)
  if (
    !order ||
    order.status !== "PENDING" ||
    order.paymentId !== expiredSessionId
  ) {
    return false;
  }

  const guestToken = order.isGuest
    ? crypto.randomBytes(20).toString("hex")
    : null;
  const session = await createCheckoutSession({
    order,
    guestToken,
    reminderSent: true,
  });
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentId: session.id, ...(guestToken && { guestToken }) },
  });

  try {
    await sendReminderEmail(order, session.url);
    console.log(`Przypomnienie o płatności wysłane – zamówienie #${order.id}`);
  } catch (error) {
    console.error(`Błąd wysyłania przypomnienia dla #${order.id}:`, error);
  }
  return true;
}

async function sendReminderEmail(order, paymentUrl) {
  const items = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">• ${escapeHtml(
            i.name,
          )} <small style="color:#888;">(rozmiar ${escapeHtml(i.size)})</small></td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${
            i.quantity
          } szt.</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${(
            (i.promoPrice || i.price) * i.quantity
          ).toFixed(2)} zł</td>
        </tr>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Twoje zamówienie czeka na płatność</title></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f9f9f9;color:#333;margin:0;padding:20px;line-height:1.6;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
    <div style="background:#fa7070;padding:35px 20px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:26px;">Twoje zamówienie czeka</h1>
      <p style="margin:10px 0 0;font-size:17px;">Zamówienie nr <strong>#${order.id}</strong></p>
    </div>
    <div style="padding:35px;">
      <p>Cześć ${escapeHtml(order.firstName)}!</p>
      <p>Zauważyliśmy, że płatność za Twoje zamówienie nie została dokończona. Odłożyliśmy dla Ciebie te produkty — możesz zapłacić jednym kliknięciem:</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        ${items}
        <tr>
          <td colspan="2" style="padding:10px 0 0;text-align:right;color:#666;">Dostawa:</td>
          <td style="padding:10px 0 0;text-align:right;white-space:nowrap;color:#666;">${
            order.deliveryCost > 0 ? `${order.deliveryCost.toFixed(2)} zł` : "gratis"
          }</td>
        </tr>
        ${
          order.discountAmount > 0
            ? `<tr>
          <td colspan="2" style="padding:6px 0 0;text-align:right;color:#2e7d32;">Rabat${
            order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ""
          }:</td>
          <td style="padding:6px 0 0;text-align:right;white-space:nowrap;color:#2e7d32;">−${order.discountAmount.toFixed(2)} zł</td>
        </tr>`
            : ""
        }
        <tr>
          <td colspan="2" style="padding:14px 0;text-align:right;"><strong>Do zapłaty:</strong></td>
          <td style="padding:14px 0;text-align:right;white-space:nowrap;color:#fa7070;font-size:18px;"><strong>${order.totalAmount.toFixed(2)} zł</strong></td>
        </tr>
      </table>

      <div style="text-align:center;margin:30px 0;">
        <a href="${paymentUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:15px 40px;border-radius:8px;">Dokończ płatność</a>
        <p style="font-size:13px;color:#888;margin:12px 0 0;">BLIK, karta, Apple Pay lub Google Pay</p>
      </div>

      <p style="font-size:14px;color:#666;">Link do płatności jest ważny przez 24 godziny. Jeśli się rozmyśliłeś, po prostu zignoruj tę wiadomość — zamówienie anuluje się automatycznie.</p>
      <p style="font-size:14px;color:#666;">Masz problem z płatnością? Napisz: <a href="mailto:mwidel@pantofle-karpaty.pl" style="color:#fa7070;font-weight:bold;text-decoration:none;">mwidel@pantofle-karpaty.pl</a> lub zadzwoń: <strong>535 479 000</strong></p>
    </div>
    <div style="background:#333;color:#ccc;padding:25px;text-align:center;font-size:13px;">
      <strong>Pantofle Karpaty</strong>
    </div>
  </div>
</body>
</html>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
    to: order.email,
    subject: `Twoje zamówienie #${order.id} czeka na płatność`,
    html,
  });
}
