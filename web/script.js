const API_URL = "/data"; // ruta del servidor Flask

async function actualizar() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const ultimo = data.length > 0 ? data[data.length - 1].ECValue : 0;
    document.getElementById("contador").textContent = `${ultimo} µS/cm`;
  } catch (err) {
    console.error(err);
    document.getElementById("contador").textContent = "Error";
  }
}

setInterval(actualizar, 3000);
actualizar();
