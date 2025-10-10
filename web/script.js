// URL de tu backend en Render
const API_URL = "https://proyectodegradoapi.onrender.com";

// Función para obtener el contador y actualizar la web
async function actualizar() {
  try {
    const res = await fetch(`${API_URL}/get`);
    const data = await res.json();
    document.getElementById("contador").textContent = data.contador;
  } catch (err) {
    console.error("Error al obtener contador:", err);
  }
}

// Actualiza cada 3 segundos automáticamente
setInterval(actualizar, 3000);

// Primera actualización al cargar la página
actualizar();
r();
