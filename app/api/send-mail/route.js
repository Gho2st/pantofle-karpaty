import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// === WALIDACJA POLA E-MAIL ===
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// === WALIDACJA PÓL ===
function validateFields(fields) {
  return Object.entries(fields).every(
    ([key, value]) => value && value.toString().trim() !== ""
  );
}

// === SZABLON E-MAILA ===
function createEmailTemplate({ name, text, email }) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #fa7070; text-align: center;">Wiadomość ze strony <br>Pantofle Karpaty</h2>
        <ul style="list-style-type: none; padding: 0; font-size: 16px; color: #333; line-height: 1.5;">
          <li><strong>Imię i Nazwisko:</strong> ${name}</li>
          <li><strong>Wiadomość:</strong> ${text}</li>
          <li><strong>Email:</strong> <a href="mailto:${email}" style="color: #fa7070;">${email}</a></li>
        </ul>
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #888; text-align: center;">
          Ta wiadomość została wysłana z formularza kontaktowego na stronie Pantofle Karpaty.
        </p>
      </div>
    </div>
  `;
}

// === GŁÓWNA FUNKCJA ===
export async function POST(request) {
  try {
    const { text, name, email } = await request.json();

    // === 1. Walidacja ===
    if (!validateFields({ name, email, text })) {
      return NextResponse.json(
        { message: "Uzupełnij wszystkie pola." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Podaj poprawny adres e-mail." },
        { status: 400 }
      );
    }

    // === 2. Konfiguracja Nodemailer z TESTEM POŁĄCZENIA ===
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === "true" || true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PW,
      },
      // DODAJ TIMEOUT I POOL
      pool: true,
      maxConnections: 1,
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // TEST POŁĄCZENIA
    try {
      await transporter.verify();
      console.log("SMTP: Połączenie udane");
    } catch (verifyError) {
      console.error("SMTP: Błąd połączenia:", verifyError.message);
      return NextResponse.json(
        { message: "Błąd serwera SMTP. Spróbuj później." },
        { status: 500 }
      );
    }

    // === 3. E-mail ===
    const mailOptions = {
      from: `"Kontakt KARPATY" <${process.env.NODEMAILER_EMAIL}>`,
      to: "jestemfajny1244@gmail.com", // ← docelowy
      subject: `Kontakt od ${name} – Pantofle Karpaty`,
      html: createEmailTemplate({ name, text, email }),
    };

    // === 4. Wysyłka ===
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Wiadomość wysłana prawidłowo!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd API /contact:", error.message || error);
    return NextResponse.json(
      {
        message: "Nie udało się wysłać wiadomości. Spróbuj później.",
        error: error.message || "Nieznany błąd",
      },
      { status: 500 }
    );
  }
}
