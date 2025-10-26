async function actualizar() {
  try {
    const response = await fetch("https://proyectodegradoapi.onrender.com/data");
    const data = await response.json();

    if (data.length > 0) {
      const ultimo = data[data.length - 1];
      document.getElementById("contador").textContent = ultimo.ec.toFixed(2);
      document.getElementById("timestamp").textContent = ultimo.timestamp;
    }
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

// Actualiza cada 5 segundos automáticamente
setInterval(actualizar, 5000);
