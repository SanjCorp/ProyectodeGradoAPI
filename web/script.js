const API_URL = "https://proyectodegradoapi.onrender.com/data";

async function actualizar() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error en la conexión");
    const datos = await response.json();

    // Mostrar el último valor recibido
    if (datos.length > 0) {
      const ultimoDato = datos[datos.length - 1];
      document.getElementById("contador").textContent = ultimoDato.valor || "0";
    } else {
      document.getElementById("contador").textContent = "0";
    }
  } catch (error) {
    document.getElementById("contador").textContent = "Error";
    console.error("Error al obtener datos:", error);
  }
}

// Actualiza automáticamente cada 5 segundos
setInterval(actualizar, 5000);
actualizar();
