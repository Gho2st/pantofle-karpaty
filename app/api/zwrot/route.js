import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// === WALIDACJA E-MAIL ===
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// === WALIDACJA PÓL ZWROTU ===
function validateReturnFields(data) {
  const required = ["name", "email", "orderNumber", "product", "reason"];
  const paczkomatOk =
    data.paczkomat &&
    data.paczkomat.name &&
    data.paczkomat.pointId &&
    data.paczkomat.address;

  return (
    required.every((key) => data[key] && data[key].toString().trim() !== "") &&
    paczkomatOk
  );
}

// === SZABLON: MAIL DO SKLEPU ===
function createReturnEmailTemplate(data) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="background: #1e40af; color: white; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Zgłoszenie Zwrotu – Pantofle Karpaty</h1>
      </div>
      <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px;"><strong>Klient zgłosił zwrot towaru.</strong></p>
        <table style="width: 100%; border-collapse: collapse; font-size: 15px; color: #374151;">
          <tr><td style="padding: 8px 0;"><strong>Imię i nazwisko:</strong></td><td>${data.name}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>E-mail:</strong></td><td><a href="mailto:${data.email}" style="color: #1e40af;">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0;"><strong>Numer zamówienia:</strong></td><td><strong>#${data.orderNumber}</strong></td></tr>
          <tr><td style="padding: 8px 0;"><strong>Produkt do zwrotu:</strong></td><td>${data.product}</td></tr>
          <tr><td style="padding: 8px 0;"><strong>Powód zwrotu:</strong></td><td>${data.reason}</td></tr>
          <tr><td style="padding: 8px 0; vertical-align: top;"><strong>Paczkomat zwrotny:</strong></td>
              <td><strong>${data.paczkomat.name}</strong> (${data.paczkomat.pointId})<br />
                  <small style="color: #6b7280;">${data.paczkomat.address}</small></td></tr>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; font-size: 14px;">
          <p style="margin: 0; color: #92400e;">
            <strong>Uwaga:</strong> Przygotuj etykietę zwrotną InPost na paczkomat: <strong>${data.paczkomat.pointId}</strong><br />
            Wyślij ją na e-mail klienta: <strong>${data.email}</strong>
          </p>
        </div>
        <hr style="border: 1px dashed #d1d5db; margin: 24px 0;">
        <p style="font-size: 13px; color: #6b7280; text-align: center;">
          Zgłoszenie wysłane z formularza zwrotów na stronie <strong>sklep-pantofle-karpaty.pl</strong>
        </p>
      </div>
    </div>
  `;
}

// === SZABLON: POTWIERDZENIE DO KLIENTA ===
function createClientConfirmationTemplate(data) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
      <div style="background: #10b981; color: white; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">Dziękujemy za zgłoszenie zwrotu!</h1>
      </div>
      <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; color: #374151;">
        <p>Cześć <strong>${data.name}</strong>,</p>
        <p>Otrzymaliśmy Twoje zgłoszenie zwrotu dla zamówienia <strong>#${data.orderNumber}</strong>.</p>
        <ul style="font-size: 15px; line-height: 1.6;">
          <li><strong>Produkt:</strong> ${data.product}</li>
          <li><strong>Powód:</strong> ${data.reason}</li>
          <li><strong>Paczkomat zwrotny:</strong> <strong>${data.paczkomat.name}</strong> (${data.paczkomat.pointId})</li>
        </ul>
        <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #a7f3d0;">
          <p style="margin: 0; color: #065f46; font-size: 15px;">
            <strong>W ciągu 24h</strong> prześlemy Ci <strong>gotową etykietę zwrotną</strong> na adres: <strong>${data.email}</strong><br />
            Etykieta będzie adresowana na paczkomat: <strong>${data.paczkomat.pointId}</strong>
          </p>
        </div>
        <p><strong>Co dalej?</strong><br />
        1. Oczekuj etykiety na maila<br />
        2. Wydrukuj etykietę<br />
        3. Spakuj produkt z paragonem<br />
        4. Nadaj w paczkomacie <strong>${data.paczkomat.pointId}</strong><br />
        5. Otrzymasz zwrot pieniędzy (minus 9,99 zł za przesyłkę)</p>
        <p style="font-size: 14px; color: #6b7280;">
          W razie pytań – pisz: <a href="mailto:mwidel@pantofle-karpaty.pl" style="color: #1e40af;">mwidel@pantofle-karpaty.pl</a>
        </p>
      </div>
    </div>
  `;
}

// === GŁÓWNA FUNKCJA POST ===
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      orderNumber,
      product,
      reason,
      acceptPolicy,
      paczkomat,
    } = body;

    // === 1. Walidacja polityki ===
    if (!acceptPolicy) {
      return NextResponse.json(
        { message: "Musisz zaakceptować politykę zwrotów." },
        { status: 400 }
      );
    }

    // === 2. Walidacja paczkomatu ===
    if (
      !paczkomat ||
      !paczkomat.name ||
      !paczkomat.pointId ||
      !paczkomat.address
    ) {
      return NextResponse.json(
        { message: "Proszę wybrać paczkomat do zwrotu." },
        { status: 400 }
      );
    }

    const data = { name, email, orderNumber, product, reason, paczkomat };

    // === 3. Walidacja pól ===
    if (!validateReturnFields(data)) {
      return NextResponse.json(
        { message: "Wypełnij wszystkie wymagane pola." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Podaj poprawny adres e-mail." },
        { status: 400 }
      );
    }

    // === 4. KONFIGURACJA NODemailer (SEOHost) ===
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // h24.seohost.pl
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // SSL
      auth: {
        user: process.env.SMTP_USER, // robert@domiweb.pl
        pass: process.env.SMTP_PASS, // Minisiek1!
      },
      pool: true,
      maxConnections: 1,
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // === 5. TEST POŁĄCZENIA SMTP ===
    try {
      await transporter.verify();
      console.log("SMTP: Połączenie udane – gotowy do wysyłki");
    } catch (verifyError) {
      console.error("SMTP: Błąd połączenia:", verifyError.message);
      return NextResponse.json(
        { message: "Błąd serwera pocztowego. Spróbuj później." },
        { status: 500 }
      );
    }

    // === 6. OPCJE E-MAILI ===
    const shopMail = {
      from: `"Zwroty KARPATY" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: "dominik.jojczyk@gmail.com", // ← testowy
      // to: "mwidel@pantofle-karpaty.pl", // ← docelowy
      subject: `ZWROT #${orderNumber} – ${name} – ${paczkomat.pointId}`,
      html: createReturnEmailTemplate(data),
    };

    const clientMail = {
      from: `"Pantofle KARPATY" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Potwierdzenie zwrotu #${orderNumber}`,
      html: createClientConfirmationTemplate(data),
    };

    // === 7. WYSYŁKA (równolegle) ===
    await Promise.all([
      transporter.sendMail(shopMail),
      transporter.sendMail(clientMail),
    ]);

    console.log(`Zwrot #${orderNumber}: maile wysłane do sklepu i klienta`);

    return NextResponse.json(
      {
        message: "Zgłoszenie zwrotu przyjęte! Etykieta w ciągu 24h.",
        data: { orderNumber, email, paczkomat: paczkomat.pointId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd API /zwrot:", error.message || error);
    return NextResponse.json(
      {
        message: "Nie udało się przesłać zgłoszenia.",
        error: error.message || "Nieznany błąd",
      },
      { status: 500 }
    );
  }
}
