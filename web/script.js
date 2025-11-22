const API = "" // usa mismo origen (si sirves con Flask) o pon la URL completa si es remota (ej: "https://proyectodegradoapi.onrender.com")

// Gráfica
let ctx = document.getElementById("chart") ? document.getElementById("chart").getContext("2d") : null;
let chart;
if (ctx) {
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Conductividad (uS/cm)",
        data: [],
        fill: false,
        borderColor: "rgb(75,192,192)"
      }]
    }
  });
}

async function fetchLatestData() {
  try {
    const res = await fetch(API + "/data");
    const arr = await res.json();
    // data devuelve lista ordenada descendente, usamos el más reciente
    const latest = Array.isArray(arr) && arr.length ? arr[0] : null;
    if (latest) {
      document.getElementById("ec").innerText = latest.ec || "--";
      document.getElementById("flujo").innerText = latest.litros_acumulados || (latest.flujo || "--");
      document.getElementById("nivel1").innerText = latest.nivel1 ? "Lleno" : "Vacío";
      document.getElementById("nivel2").innerText = latest.nivel2 ? "Lleno" : "Vacío";
      document.getElementById("nivel3").innerText = latest.nivel3 ? "Lleno" : "Vacío";

      if (chart) {
        chart.data.labels.push("");
        chart.data.datasets[0].data.push(latest.ec || 0);
        if (chart.data.labels.length > 30) {
          chart.data.labels.shift();
          chart.data.datasets[0].data.shift();
        }
        chart.update();
      }
    }
  } catch (e) {
    console.log("Error fetchLatestData", e);
  }
}

// Llamada para crear orden de envío
async function placeOrder(){
  const litros = parseFloat(document.getElementById("litrosInput").value);
  const operator = document.getElementById("operatorInput").value || "operator";

  if (!litros || litros <= 0) {
    alert("Ingresa litros válidos");
    return;
  }

  try {
    const res = await fetch(API + "/place_order", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ litros: litros, operator: operator })
    });

    const data = await res.json();
    alert("Orden creada: " + (data.id || ""));
    document.getElementById("litrosInput").value = "";
  } catch (e) {
    alert("Error creando orden");
  }
}

// auto-refresh
setInterval(fetchLatestData, 3000);
fetchLatestData();
