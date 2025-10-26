async function actualizar() {
  try {
    const res = await fetch("/data"); // ruta de tu API
    const data = await res.json();
    const ultimo = data.length > 0 ? data[data.length - 1].ec : 0;
    document.getElementById("contador").textContent = ultimo.toFixed(2) + " µS/cm";
  } catch (err) {
    console.error(err);
    document.getElementById("contador").textContent = "Error";
  }
}

setInterval(actualizar, 3000); // actualiza cada 3 segundos
actualizar(); // actualización inicial
