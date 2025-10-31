import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// === WALIDACJA POLA E-MAIL ===
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// === WALIDACJA WSZYSTKICH PÓL ===
function validateReturnFields(fields) {
  const required = ["name", "email", "orderNumber", "product", "reason"];
  return required.every((key) => fields[key] && fields[key].trim() !== "");
}

// === SZABLON E-MAILA DLA SKLEPU (zgłoszenie zwrotu) ===
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
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; font-size: 14px;">
          <p style="margin: 0; color: #92400e;">
            <strong>Uwaga:</strong> Przygotuj etykietę zwrotną InPost i wyślij ją na e-mail klienta: <strong>${data.email}</strong>
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

// === SZABLON E-MAILA DLA KLIENTA (potwierdzenie zgłoszenia) ===
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
        </ul>

        <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #a7f3d0;">
          <p style="margin: 0; color: #065f46; font-size: 15px;">
            <strong>W ciągu 24h</strong> prześlemy Ci <strong>gotową etykietę zwrotną</strong> na adres: <strong>${data.email}</strong>
          </p>
        </div>

        <p><strong>Co dalej?</strong><br />
        1. Wydrukuj etykietę<br />
        2. Spakuj produkt z paragonem<br />
        3. Nadaj w Paczkomacie<br />
        4. Otrzymasz zwrot pieniędzy (minus 13,99 zł za przesyłkę zwrotną)</p>

        <p style="font-size: 14px; color: #6b7280;">
          W razie pytań – pisz: <a href="mailto:mwidel@pantofle-karpaty.pl" style="color: #1e40af;">mwidel@pantofle-karpaty.pl</a>
        </p>
      </div>
    </div>
  `;
}

// === GŁÓWNY ENDPOINT ===
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, orderNumber, product, reason, acceptPolicy } = body;

    // === 1. Walidacja danych ===
    if (!acceptPolicy) {
      return NextResponse.json(
        { message: "Musisz zaakceptować politykę zwrotów" },
        { status: 400 }
      );
    }

    const fields = { name, email, orderNumber, product, reason };
    if (!validateReturnFields(fields)) {
      return NextResponse.json(
        { message: "Wypełnij wszystkie wymagane pola" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Podaj poprawny adres e-mail" },
        { status: 400 }
      );
    }

    // === 2. Konfiguracja Nodemailer ===
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PW,
      },
    });

    // === 3. E-mail do sklepu ===
    const shopMailOptions = {
      from: `"Zwroty KARPATY" <${process.env.NODEMAILER_EMAIL}>`,
      //   to: "mwidel@pantofle-karpaty.pl", // lub inna skrzynka
      to: "dominik.jojczyk@gmail.com",
      subject: `ZWROT #${orderNumber} – ${name}`,
      html: createReturnEmailTemplate(fields),
    };

    // === 4. E-mail do klienta (potwierdzenie) ===
    const clientMailOptions = {
      from: `"Pantofle KARPATY" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "Potwierdzenie zgłoszenia zwrotu – dziękujemy!",
      html: createClientConfirmationTemplate({
        ...fields,
        name,
        email,
        orderNumber,
      }),
    };

    // === 5. Wysyłka obu e-maili ===
    await Promise.all([
      transporter.sendMail(shopMailOptions),
      transporter.sendMail(clientMailOptions),
    ]);

    // === 6. Sukces ===
    return NextResponse.json(
      {
        message: "Zgłoszenie zwrotu przyjęte! Otrzymasz etykietę w ciągu 24h.",
        data: { orderNumber, email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd API /zwrot:", error);
    return NextResponse.json(
      {
        message: "Nie udało się przesłać zgłoszenia. Spróbuj później.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
