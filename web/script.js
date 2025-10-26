const API_URL = "/data"; // La misma ruta que tu Flask

async function actualizar() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    // Tomamos el último dato recibido
    const ultimo = data.length > 0 ? data[data.length - 1].pulsos : 0;
    document.getElementById("contador").textContent = `${ultimo} µS/cm`;
  } catch (err) {
    console.error(err);
    document.getElementById("contador").textContent = "Error";
  }
}

// Actualizar cada 3 segundos
setInterval(actualizar, 3000);
actualizar();
