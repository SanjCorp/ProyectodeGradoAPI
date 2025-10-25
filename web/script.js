async function actualizar() {
  const contadorElem = document.getElementById("contador");
  contadorElem.textContent = "Cargando...";

  try {
    const res = await fetch("/contador");
    if (!res.ok) throw new Error("Error en la respuesta del servidor");
    const data = await res.json();
    const ultimo = data.length > 0 ? data[data.length - 1].pulsos : 0;
    contadorElem.textContent = ultimo;
  } catch (err) {
    console.error(err);
    contadorElem.textContent = "Error al cargar";
  }
}

setInterval(actualizar, 3000);
actualizar();
