const API_URL = ""; // vacía porque ahora HTML y API están en el mismo dominio

async function actualizar() {
  try {
    const res = await fetch("/contador");
    const data = await res.json();
    const ultimo = data.length > 0 ? data[data.length - 1].pulsos : 0;
    document.getElementById("contador").textContent = ultimo;
  } catch (err) {
    console.error(err);
    document.getElementById("contador").textContent = "Error";
  }
}

setInterval(actualizar, 3000);
actualizar();
