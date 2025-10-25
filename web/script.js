// URL de tu backend en Render
const API_URL = "https://proyectodegradoapi.onrender.com";

// Función para actualizar el contador en el HTML
async function actualizar() {
  try {
    const res = await fetch(`${API_URL}/contador`);
    const data = await res.json();

    // Tomamos el último valor del contador
    if (data.length > 0) {
      const ultimo = data[data.length - 1];
      document.getElementById("contador").textContent = ultimo.pulsos;
    } else {
      document.getElementById("contador").textContent = 0;
    }
  } catch (err) {
    console.error("Error al obtener el contador:", err);
    document.getElementById("contador").textContent = "Error";
  }
}

// Actualizar automáticamente cada 3 segundos
setInterval(actualizar, 3000);

// Primera actualización al cargar la página
actualizar();
