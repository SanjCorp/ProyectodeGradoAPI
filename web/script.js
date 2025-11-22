const API = ""; // Si es mismo origen

async function sendPreset(type) {
  let litros = 0;
  if (type === "preparar") litros = 5000;
  else if (type === "aforar") litros = 2000;
  else if (type === "cip") litros = 450;
  else {
    litros = parseFloat(document.getElementById("litrosOtro").value);
    if (!litros || litros <= 0) {
      alert("Ingresa litros válidos");
      return;
    }
  }

  const operator = "usuario";

  const res = await fetch(API + "/place_order", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ litros, operator })
  });

  const data = await res.json();
  alert("Orden creada: " + data.id);
  document.getElementById("litrosOtro").style.display = type === "otro" ? "block" : "none";
}

// Función para actualizar EC y litros
async function fetchLatestData() {
  try {
    const res = await fetch(API + "/data");
    const datos = await res.json();
    if (datos.length > 0) {
      const latest = datos[0];
      document.getElementById("ecValue").innerText = latest.ec || "--";
      document.getElementById("litrosDispensados").innerText = latest.litros || 0;
      document.getElementById("motorStatus").innerText = latest.motor ? "ON" : "OFF";
    }
  } catch(e) {
    console.error(e);
  }
}

setInterval(fetchLatestData, 3000);
fetchLatestData();
