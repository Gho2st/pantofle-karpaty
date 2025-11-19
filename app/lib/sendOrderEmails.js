// app/lib/sendOrderEmails.js
import nodemailer from "nodemailer";

export async function sendOrderEmails(order, isPaid = false) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const isCompany = !!order.companyName && !!order.nip;
  const totalWithoutDelivery = order.totalAmount - order.deliveryCost;
  const needsInvoice = isCompany && totalWithoutDelivery >= 450;

  const invoiceInfo = needsInvoice
    ? `<div style="background:#e8f5e8;padding:15px;border-radius:8px;border-left:4px solid #4CAF50;margin:20px 0;">Faktura VAT zostanie wysłana na <strong>${order.email}</strong> w ciągu 1-2 dni.</div>`
    : `<div style="background:#f0f0f0;padding:15px;border-radius:8px;margin:20px 0;">Paragon fiskalny będzie w paczce.</div>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.verify();

  // === MAIL DO KLIENTA ===
  const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${
    isPaid ? "Zamówienie opłacone!" : "Dziękujemy za zamówienie!"
  }</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f9f9f9; color:#333; margin:0; padding:20px; }
    .container { max-width: 640px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .header { background: #fa7070; padding: 30px 20px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px 0; text-align: left; border-bottom: 1px solid #eee; }
    .total-row { font-weight: bold; font-size: 18px; color: #fa7070; }
    .info-box { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fa7070; }
    .footer { background: #333; color: #ccc; padding: 30px; text-align: center; font-size: 14px; }
    a { color: #fa7070; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isPaid ? "Płatność przyjęta!" : "Dziękujemy za zamówienie!"}</h1>
      <p style="margin:10px 0 0;font-size:16px;">Zamówienie nr #${order.id}</p>
    </div>
    <div class="content">
      <p>Cześć ${order.firstName},</p>
      <p>${
        isPaid
          ? "Płatność za Twoje zamówienie została pomyślnie przyjęta! Już zabieramy się za pakowanie ❤️"
          : "Dziękujemy serdecznie za zaufanie i zakup w <strong>Pantofle Karpaty</strong>! Twoje zamówienie zostało przyjęte i zaraz zabieramy się do pakowania"
      }</p>

      <div class="info-box">
        <strong>Adres dostawy:</strong><br>
        ${order.firstName} ${order.lastName}<br>
        ${order.street}<br>
        ${order.postalCode} ${order.city}<br>
        ${order.phone}<br>
        ${
          order.paczkomat
            ? `<br><strong>Paczkomat:</strong> ${order.paczkomat}`
            : ""
        }
        ${
          order.companyName
            ? `<br><br><strong>Dane do faktury:</strong><br>${order.companyName} (NIP: ${order.nip})`
            : ""
        }
      </div>

      <h3 style="color:#fa7070;">Twoje zamówienie:</h3>
      <table>
        <tbody>
          ${order.items
            .map(
              (i) => `
            <tr>
              <td>${i.name} <small style="color:#888;">(rozmiar ${
                i.size
              })</small></td>
              <td style="text-align:center;">${i.quantity} szt.</td>
              <td style="text-align:right;">${(
                (i.promoPrice || i.price) * i.quantity
              ).toFixed(2)} zł</td>
            </tr>`
            )
            .join("")}
          <tr>
            <td colspan="2" style="text-align:right;"><strong>Dostawa (${
              order.deliveryMethod
            })</strong></td>
            <td style="text-align:right;">${order.deliveryCost.toFixed(
              2
            )} zł</td>
          </tr>
          ${
            order.discountAmount > 0
              ? `
          <tr style="color:#4CAF50;">
            <td colspan="2" style="text-align:right;"><strong>Rabat (${
              order.discountCode
            })</strong></td>
            <td style="text-align:right;">-${order.discountAmount.toFixed(
              2
            )} zł</td>
          </tr>`
              : ""
          }
          <tr class="total-row">
            <td colspan="2" style="text-align:right;"><strong>Do zapłaty:</strong></td>
            <td style="text-align:right;"><strong>${order.totalAmount.toFixed(
              2
            )} zł</strong></td>
          </tr>
        </tbody>
      </table>

      ${invoiceInfo}

      <p>Pytania? Pisz: <a href="mailto:mwidel@pantofle-karpaty.pl">mwidel@pantofle-karpaty.pl</a> lub dzwoń: <strong>535 479 000</strong></p>
      <p>Do zobaczenia przy następnych zakupach! ✨</p>
    </div>
    <div class="footer">
      <p><strong>Pantofle Karpaty</strong></p>
      <p style="margin-top:20px; font-size:12px; color:#999;">© ${new Date().getFullYear()} Pantofle Karpaty</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
    to: order.email,
    subject: `${
      isPaid ? "Zamówienie opłacone!" : "Dziękujemy za zamówienie!"
    } #${order.id} – Pantofle Karpaty`,
    html: clientEmailHtml,
  });

  // === MAIL DO ADMINA ===
  const adminItems = order.items
    .map((i) => `${i.name} – rozmiar: ${i.size} – ${i.quantity} szt.`)
    .join("\n");

  const adminEmailHtml = `
    <h2>${isPaid ? "OPŁACONE" : "NOWE ZAMÓWIENIE"} #${order.id}</h2>
    <p><strong>Klient:</strong> ${order.firstName} ${order.lastName} (${
    order.email
  })</p>
    <p><strong>Telefon:</strong> ${order.phone}</p>
    <p><strong>Adres:</strong> ${order.street}, ${order.postalCode} ${
    order.city
  }</p>
    ${
      order.paczkomat
        ? `<p><strong>Paczkomat:</strong> ${order.paczkomat}</p>`
        : ""
    }
    ${
      order.companyName
        ? `<p><strong>Firma:</strong> ${order.companyName} (NIP: ${order.nip})</p>`
        : ""
    }
    <hr>
    <h3>Produkty:</h3>
    <pre style="background:#f4f4f4;padding:15px;border-radius:8px;">${adminItems}</pre>
    <p><strong>Dostawa:</strong> ${
      order.deliveryMethod
    } – ${order.deliveryCost.toFixed(2)} zł</p>
    ${
      order.discountAmount > 0
        ? `<p><strong>Rabat:</strong> -${order.discountAmount.toFixed(2)} zł (${
            order.discountCode
          })</p>`
        : ""
    }
    <p><strong>Wartość:</strong> <strong style="font-size:18px;color:#fa7070;">${order.totalAmount.toFixed(
      2
    )} zł</strong></p>
    <p style="padding:10px;background:${
      isPaid ? "#d4edda" : "#fff3cd"
    };border-left:4px solid ${isPaid ? "#28a745" : "#ffc107"};">
      <strong>Płatność: ${
        isPaid ? "OPŁACONA (Stripe)" : "Przelew tradycyjny – czeka na wpłatę"
      }</strong>
    </p>
    <p><strong>Faktura?</strong> ${
      needsInvoice ? "TAK (firma + ≥450 zł)" : "Nie – paragon"
    }</p>
  `;

  await transporter.sendMail({
    from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
    // to: "mwidel@pantofle-karpaty.pl",
    to: "dominik.jojczyk@gmail.com",
    subject: `${isPaid ? "OPŁACONE" : "NOWE"} #${
      order.id
    } – ${order.totalAmount.toFixed(2)} zł`,
    html: adminEmailHtml,
  });
}
