async function actualizar() {
  try {
    const res = await fetch("/data");
    const data = await res.json();

    if (data.length > 0) {
      const ultimo = data[data.length - 1].EC; // nombre de la propiedad que envía el ESP32
      document.getElementById("contador").textContent = `${ultimo} µS/cm`;
    } else {
      document.getElementById("contador").textContent = "0 µS/cm";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("contador").textContent = "Error";
  }
}

// Actualiza cada 3 segundos
setInterval(actualizar, 3000);
actualizar();
