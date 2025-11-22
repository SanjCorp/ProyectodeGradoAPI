const API = ""; // Misma URL si es el mismo origen

let motorRunning = false;
let litros = 0;
let chartEC;

// --- Mostrar datos en tiempo real ---
async function fetchRealtime() {
  try {
    const res = await fetch(API + "/data");
    const datos = await res.json();
    if (!Array.isArray(datos) || !datos.length) return;

    const latest = datos[0];
    litros = latest.litros_acumulados || 0;
    motorRunning = latest.motor || false;

    document.getElementById("litrosDispensados").innerText = litros.toFixed(2);
    document.getElementById("motorStatus").innerText = motorRunning ? "ON" : "OFF";
    document.getElementById("ecValue").innerText = latest.ec ? latest.ec.toFixed(1) : "--";
  } catch(e) {
    console.error("Error fetchRealtime", e);
  }
}

// --- Gráfico EC ---
async function cargarEC() {
  try {
    const res = await fetch(API + "/data");
    const datos = await res.json();

    const agrupado = {};
    datos.forEach(d => {
      if (d.ec && d.timestamp) {
        const hora = new Date(d.timestamp).toISOString().slice(0,13);
        if (!agrupado[hora]) agrupado[hora] = [];
        agrupado[hora].push(d.ec);
      }
    });

    const labels = Object.keys(agrupado).sort();
    const valores = labels.map(h => {
      const arr = agrupado[h];
      return arr.reduce((a,b)=>a+b,0)/arr.length;
    });

    const ctx = document.getElementById('graficaEC').getContext('2d');
    if (chartEC) chartEC.destroy();

    chartEC = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.map(l=>l.replace("T"," ")),
        datasets: [{
          label: 'EC promedio (µS/cm)',
          data: valores,
          borderColor: '#0066cc',
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        scales: {
          x: { title: { display:true, text:"Hora" } },
          y: { title: { display:true, text:"µS/cm" }, beginAtZero:true }
        }
      }
    });
  } catch(e) {
    console.error("Error cargarEC", e);
  }
}

// --- Enviar orden predeterminada ---
async function sendPreset(tipo) {
  let litrosEnviar = 0;

  if (tipo === "preparar") litrosEnviar = 5000;
  else if (tipo === "aforar") litrosEnviar = 2000;
  else if (tipo === "cip") litrosEnviar = 450;
  else if (tipo === "otro") {
    document.getElementById("litrosOtro").style.display = "inline-block";
    litrosEnviar = parseFloat(document.getElementById("litrosOtro").value);
    if (!litrosEnviar || litrosEnviar <= 0) {
      alert("Ingresa litros válidos en 'Otro'");
      return;
    }
  }

  if (motorRunning) {
    alert("Motor actualmente activo, espera a que termine la orden.");
    return;
  }

  try {
    const res = await fetch(API + "/place_order", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ litros: litrosEnviar, operator: "web" })
    });
    const data = await res.json();
    alert("Orden enviada: " + (data.id || ""));
  } catch(e) {
    alert("Error enviando orden al servidor");
  }
}

// --- Auto-refresh ---
setInterval(fetchRealtime, 1000);
setInterval(cargarEC, 60000);
fetchRealtime();
cargarEC();
