const API_URL = "/data";  // endpoint del servidor Flask

async function actualizar() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Tomamos el último dato recibido
    const ultimo = data.length > 0 ? data[data.length - 1].ECValue : 0;

    // Mostramos en el HTML con la unidad µS/cm
    document.getElementById("contador").textContent = `${ultimo} µS/cm`;
  } catch (err) {
    console.error(err);
    document.getElementById("contador").textContent = "Error";
  }
}

// Actualizamos cada 3 segundos
setInterval(actualizar, 3000);
actualizar();
