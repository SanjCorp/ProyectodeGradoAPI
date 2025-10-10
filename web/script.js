const API_URL = "https://ProyectodeGradoAPI.onrender.com"; // Cambia según tu Render

async function actualizar() {
  const res = await fetch(`${API_URL}/get`);
  const data = await res.json();
  document.getElementById("contador").textContent = data.contador;
}

setInterval(actualizar, 3000);
actualizar();
