const API_URL = "/data"; // Ruta de tu Flask backend

async function actualizar() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Tomamos el último valor enviado por el ESP32
    const ultimo = data.length > 0 ? data[data.length - 1].pulsos : 0;
    document.getElementById("contador").textContent = ultimo;
  } catch (err) {
    console.error(err);
    document.getElementById("contador").textContent = "Error";
  }
}

// Actualizamos automáticamente cada 3 segundos
setInterval(actualizar, 3000);
actualizar();
