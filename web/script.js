const url = "https://proyectodegradoapi.onrender.com/data";

async function actualizar() {
  try {
    const response = await fetch(url);
    const datos = await response.json();

    if (datos.length > 0) {
      // Tomamos el último registro
      const ultimo = datos[datos.length - 1];
      document.getElementById("contador").textContent = ultimo.ec.toFixed(2);
      document.getElementById("timestamp").textContent = ultimo.timestamp;
    } else {
      document.getElementById("contador").textContent = "0";
      document.getElementById("timestamp").textContent = "--:--:--";
    }
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

// Opcional: actualizar automáticamente cada 5 segundos
setInterval(actualizar, 5000);

// Primera carga
actualizar();
