// app/lib/sendOrderEmails.js
import nodemailer from "nodemailer";

export async function sendOrderEmails(order, isPaid = false) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const isCompany = !!order.companyName && !!order.nip;
  const totalWithoutDelivery = order.totalAmount - order.deliveryCost;
  const needsInvoice = isCompany && totalWithoutDelivery >= 450;

  // PRECYZYJNA INFORMACJA DLA KLIENTA – dokładnie tak, jak chciałeś
  let fiscalDocumentInfo = "";

  if (isCompany) {
    if (needsInvoice) {
      fiscalDocumentInfo = `
        <div style="background:#e8f5e8;padding:18px;border-radius:8px;border-left:5px solid #4CAF50;margin:25px 0;font-size:15px;">
          <strong>Faktura VAT</strong> zostanie wystawiona i wysłana na adres e-mail:<br>
          <strong>${order.email}</strong><br>
          <small>(w ciągu 1-2 dni roboczych od realizacji zamówienia)</small>
        </div>`;
    } else {
      fiscalDocumentInfo = `
        <div style="background:#fff8e1;padding:18px;border-radius:8px;border-left:5px solid #ffb300;margin:25px 0;font-size:15px;">
          <strong>Paragon fiskalny z NIP</strong> będzie dołączony do paczki<br>
          <small>(dla firm przy zamówieniach poniżej 450 zł netto)</small>
        </div>`;
    }
  } else {
    fiscalDocumentInfo = `
      <div style="background:#f0f0f0;padding:18px;border-radius:8px;border-left:5px solid #999;margin:25px 0;font-size:15px;">
        <strong>Paragon fiskalny</strong> będzie dołączony do paczki
      </div>`;
  }

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
  } ❤️</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f9f9f9; color:#333; margin:0; padding:20px; line-height:1.6; }
    .container { max-width: 640px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .header { background: #fa7070; padding: 35px 20px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 35px; }
    table { width: 100%; border-collapse: collapse; margin: 25px 0; }
    td { padding: 12px 0; border-bottom: 1px solid #eee; }
    .total-row { font-weight: bold; font-size: 18px; color: #fa7070; background: #fdf2f2; }
    .info-box { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #fa7070; }
    .footer { background: #333; color: #ccc; padding: 30px; text-align: center; font-size: 14px; }
    a { color: #fa7070; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isPaid ? "Płatność przyjęta!" : "Dziękujemy za zamówienie!"}</h1>
      <p style="margin:10px 0 0;font-size:17px;">Zamówienie nr <strong>#${
        order.id
      }</strong></p>
    </div>

    <div class="content">
      <p>Cześć ${order.firstName}!</p>
      <p>
        ${
          isPaid
            ? "Płatność za Twoje zamówienie została pomyślnie przyjęta! Już zabieramy się za pakowanie ❤️"
            : "Dziękujemy serdecznie za zakup w <strong>Pantofle Karpaty</strong>! Twoje zamówienie zostało przyjęte i zaraz zabieramy się za pakowanie"
        }
      </p>

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
            ? `<br><br><strong>Dane firmy:</strong><br>${order.companyName} (NIP: ${order.nip})`
            : ""
        }
      </div>

      <h3 style="color:#fa7070;">Twoje zamówienie:</h3>
      <table>
        ${order.items
          .map(
            (i) => `
          <tr>
            <td>• ${i.name} <small style="color:#888;">(rozmiar ${
              i.size
            })</small></td>
            <td style="text-align:center;">${i.quantity} szt.</td>
            <td style="text-align:right;white-space:nowrap;">${(
              (i.promoPrice || i.price) * i.quantity
            ).toFixed(2)} zł</td>
          </tr>`
          )
          .join("")}
        <tr>
          <td colspan="2" style="text-align:right;padding-top:12px;"><strong>Dostawa (${
            order.deliveryMethod
          })</strong></td>
          <td style="text-align:right;padding-top:12px;">${order.deliveryCost.toFixed(
            2
          )} zł</td>
        </tr>
        ${
          order.discountAmount > 0
            ? `
        <tr style="color:#2e7d32;">
          <td colspan="2" style="text-align:right;"><strong>Rabat ${
            order.discountCode ? `(${order.discountCode})` : ""
          }</strong></td>
          <td style="text-align:right;">−${order.discountAmount.toFixed(
            2
          )} zł</td>
        </tr>`
            : ""
        }
        <tr class="total-row">
          <td colspan="2" style="text-align:right;padding:15px 0;"><strong>Do zapłaty:</strong></td>
          <td style="text-align:right;padding:15px 0;"><strong>${order.totalAmount.toFixed(
            2
          )} zł</strong></td>
        </tr>
      </table>

      <!-- TU JEST NOWA, JASNA INFORMACJA O PARAGONIE/FAKTURZE -->
      ${fiscalDocumentInfo}

      <p>Masz pytania? Pisz śmiało: <a href="mailto:mwidel@pantofle-karpaty.pl">mwidel@pantofle-karpaty.pl</a> lub dzwoń: <strong>535 479 000</strong></p>
      <p>Do zobaczenia przy następnych zakupach!</p>
    </div>

    <div class="footer">
      <p><strong>Pantofle Karpaty</strong></p>
      <p style="margin-top:20px; font-size:12px; color:#999;">
        © ${new Date().getFullYear()} Pantofle Karpaty. Wszystkie prawa zastrzeżone.
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
    to: order.email,
    subject: `${isPaid ? "Opłacone" : "Dziękujemy"} – Zamówienie #${
      order.id
    } ❤️`,
    html: clientEmailHtml,
  });

  // === MAIL DO SIEBIE (ADMIN) ===
  const adminItems = order.items
    .map((i) => `${i.name} – rozmiar: ${i.size} – ${i.quantity} szt.`)
    .join("\n");

  const adminEmailHtml = `
    <h2 style="color:${isPaid ? "#2e7d32" : "#d97706"};">${
    isPaid ? "OPŁACONE" : "NOWE ZAMÓWIENIE"
  } #${order.id}</h2>
    <p><strong>Klient:</strong> ${order.firstName} ${order.lastName} (${
    order.email
  })<br>
    <strong>Telefon:</strong> ${order.phone}<br>
    <strong>Adres:</strong> ${order.street}, ${order.postalCode} ${
    order.city
  }<br>
    ${
      order.paczkomat
        ? `<strong>Paczkomat:</strong> ${order.paczkomat}<br>`
        : ""
    }
    ${
      order.companyName
        ? `<br><strong>Firma:</strong> ${order.companyName} (NIP: ${order.nip})`
        : ""
    }

    <hr>
    <h3>Produkty:</h3>
    <pre style="background:#f8f9fa;padding:15px;border-radius:8px;">${adminItems}</pre>

    <p><strong>Dostawa:</strong> ${
      order.deliveryMethod
    } – ${order.deliveryCost.toFixed(2)} zł</p>
    ${
      order.discountAmount > 0
        ? `<p><strong>Rabat:</strong> −${order.discountAmount.toFixed(2)} zł (${
            order.discountCode
          })</p>`
        : ""
    }
    <p><strong>Wartość:</strong> <strong style="font-size:20px;color:#fa7070;">${order.totalAmount.toFixed(
      2
    )} zł</strong></p>

    <p style="padding:12px;background:${
      isPaid ? "#d4edda" : "#fff3cd"
    };border-left:5px solid ${
    isPaid ? "#28a745" : "#ffc107"
  };border-radius:4px;">
      <strong>${
        isPaid ? "OPŁACONE (Stripe)" : "Przelew tradycyjny – czeka na wpłatę"
      }</strong>
    </p>

    <p><strong>Dokument fiskalny:</strong><br>
      ${
        isCompany
          ? needsInvoice
            ? "Faktura VAT (wysłana mailem)"
            : "Paragon z NIP-em (w paczce)"
          : "Paragon zwykły (w paczce)"
      }
    </p>
  `;

  await transporter.sendMail({
    from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
    to: "mwidel@pantofle-karpaty.pl", // zmień na docelowy jak będziesz gotowy
    subject: `${isPaid ? "OPŁACONE" : "NOWE"} #${
      order.id
    } – ${order.totalAmount.toFixed(2)} zł`,
    html: adminEmailHtml,
  });

  console.log(
    `Maile wysłane dla zamówienia #${order.id} (${
      isPaid ? "Stripe" : "przelew"
    })`
  );
}
