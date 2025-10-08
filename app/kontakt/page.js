import React from "react";
// Usunięto import 'Image' - nie jest potrzebny dla <iframe>

export default function Contact() {
  const przykladowyEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2582.088888881821!2d20.551295377773386!3d49.67146427145392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473df7636e6b839d%3A0xb1c45e9e205c29cf!2sKarpaty%20-%20Maciej%20Wide%C5%82%20Producent%20Pantofli%2C%20Klapek%2C%20Drewniak%C3%B3w!5e0!3m2!1spl!2spl!4v1759937002824!5m2!1spl!2spl";
  return (
    <>
      <div className="my-24">FORMULARZ</div>
      <iframe
        src={przykladowyEmbedUrl} // Użyj poprawnego URL-a embed
        width="100%" // To zapewnia pełną szerokość kontenera
        height="650" // Stała wysokość w pikselach
        style={{ border: "0" }} 
        allowFullScreen={true} 
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </>
  );
}
