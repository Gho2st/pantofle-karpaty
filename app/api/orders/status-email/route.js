import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// === WALIDACJA E-MAILA ===
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// === SZABLON E-MAILA DLA STATUSU ===
function createStatusEmailTemplate({
  orderId,
  status,
  customerName,
  customerEmail,
}) {
  const statusText = status === "wysłane" ? "wysłane" : "anulowane";
  const statusColor = status === "wysłane" ? "#4CAF50" : "#F44336";

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: ${statusColor}; text-align: center; margin-bottom: 20px;">
          Zamówienie #${orderId} – ${statusText.toUpperCase()}
        </h2>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Cześć <strong>${customerName}</strong>!
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Informujemy, że status Twojego zamówienia został zaktualizowany:
        </p>
        <div style="background-color: ${
          status === "wysłane" ? "#e8f5e9" : "#ffebee"
        }; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 18px; color: ${statusColor};">${statusText.toUpperCase()}</strong>
        </div>

        ${
          status === "wysłane"
            ? `
          <p>Twoja paczka jest już w drodze! Otrzymasz numer przesyłki w osobnej wiadomości.</p>
        `
            : `
          <p>Przepraszamy za niedogodności. W razie pytań – skontaktuj się z nami.</p>
        `
        }

        <hr style="border: 1px solid #eee; margin: 25px 0;">
        <p style="font-size: 14px; color: #777; text-align: center;">
          Dziękujemy za zakupy w <strong>Pantofle Karpaty</strong>!<br>
          <a href="https://sklep-pantofle-karpaty.pl" style="color: #fa7070; text-decoration: none;">sklep-pantofle-karpaty.pl</a>
        </p>
      </div>
    </div>
  `;
}

// === KONFIGURACJA NODEMAILER (TAK JAK W KONTAKCIE) ===
const createTransporter = () => {
  return nodemailer.createTransport({
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
};

// === GŁÓWNA FUNKCJA POST ===
export async function POST(request) {
  try {
    const { orderId, status, customerName, customerEmail } =
      await request.json();

    // === Walidacja danych ===
    if (!orderId || !status || !customerName || !customerEmail) {
      return NextResponse.json(
        { message: "Brak wymaganych danych." },
        { status: 400 }
      );
    }

    if (!["wysłane", "anulowane"].includes(status)) {
      return NextResponse.json(
        { message: "Nieprawidłowy status. Dozwolone: wysłane, anulowane." },
        { status: 400 }
      );
    }

    if (!isValidEmail(customerEmail)) {
      return NextResponse.json(
        { message: "Nieprawidłowy adres e-mail klienta." },
        { status: 400 }
      );
    }

    // === Test połączenia SMTP ===
    const transporter = createTransporter();
    try {
      await transporter.verify();
      console.log("✅ SMTP gotowy do wysyłki statusu");
    } catch (verifyError) {
      console.error("❌ Błąd SMTP:", verifyError.message);
      return NextResponse.json(
        { message: "Błąd serwera pocztowego." },
        { status: 500 }
      );
    }

    // === Wysyłka e-maila do klienta ===
    const mailOptions = {
      from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      replyTo: process.env.SMTP_USER,
      subject: `Zamówienie #${orderId} – ${
        status === "wysłane" ? "Wysłane" : "Anulowane"
      }`,
      html: createStatusEmailTemplate({
        orderId,
        status,
        customerName,
        customerEmail,
      }),
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ E-mail o statusie "${status}" wysłany do: ${customerEmail}`
    );

    return NextResponse.json(
      { message: "E-mail ze statusem wysłany!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd API /admin/order-status-email:", error);
    return NextResponse.json(
      { message: "Błąd wysyłki e-maila.", error: error.message },
      { status: 500 }
    );
  }
}
