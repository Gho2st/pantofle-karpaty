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
        <ul style="list-style-type: none; padding: 0; font-size: 16px; color: #333; line-height: 1.8;">
          <li><strong>Imię i Nazwisko:</strong> ${name}</li>
          <li><strong>Wiadomość:</strong> ${text.replace(/\n/g, "<br>")}</li>
          <li><strong>Email:</strong> <a href="mailto:${email}" style="color: #fa7070; text-decoration: none;">${email}</a></li>
        </ul>
        <hr style="border: 1px solid #ddd; margin: 25px 0;">
        <p style="font-size: 14px; color: #888; text-align: center;">
          Wiadomość wysłana z formularza kontaktowego na stronie <strong>Pantofle Karpaty</strong>.
        </p>
      </div>
    </div>
  `;
}

// === GŁÓWNA FUNKCJA POST ===
export async function POST(request) {
  try {
    const { text, name, email } = await request.json();

    // === 1. Walidacja pól ===
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

    // === 2. Konfiguracja Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // === 3. Test połączenia SMTP ===
    try {
      await transporter.verify();
      console.log("✅ SMTP działa – gotowy do wysyłki");
    } catch (verifyError) {
      console.error("❌ Błąd połączenia SMTP:", verifyError.message);
      return NextResponse.json(
        { message: "Błąd serwera pocztowego. Spróbuj później." },
        { status: 500 }
      );
    }

    // === 4. Opcje e-maila ===
    const mailOptions = {
      from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`, // Poprawny nadawca
      replyTo: email, // Odpowiedź trafi do klienta
      to: "mwidel@pantofle-karpaty.pl", // Twój e-mail
      subject: `Kontakt: ${name} – Pantofle Karpaty`,
      html: createEmailTemplate({ name, text, email }),
    };

    // === 5. Wysyłka ===
    await transporter.sendMail(mailOptions);
    console.log(`✅ Mail wysłany do: jestemfajny1244@gmail.com od: ${name}`);

    return NextResponse.json(
      { message: "Wiadomość wysłana prawidłowo!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd API /contact:", error.message || error);
    return NextResponse.json(
      {
        message: "Nie udało się wysłać wiadomości.",
        error: error.message || "Nieznany błąd",
      },
      { status: 500 }
    );
  }
}
