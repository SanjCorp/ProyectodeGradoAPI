const API = ""; // Misma URL si es mismo origen

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

// --- Mostrar órdenes pendientes ---
async function fetchOrders() {
  try {
    const res = await fetch(API + "/enviar");
    const data = await res.json();
    const tbody = document.querySelector("#ordenesTable tbody");
    tbody.innerHTML = "";

    if (Array.isArray(data)) {
      data.forEach(order => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${order.id || ""}</td>
          <td>${order.litros || 0}</td>
          <td>${order.status || ""}</td>
          <td>${order.operator || ""}</td>
          <td>${order.timestamp || ""}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch(e) {
    console.error("Error fetchOrders", e);
  }
}

// --- Mostrar historial de envíos ---
async function fetchHistorial() {
  try {
    const res = await fetch(API + "/historial_agua/data");
    const data = await res.json();
    const tbody = document.querySelector("#historialTable tbody");
    tbody.innerHTML = "";

    if (Array.isArray(data)) {
      data.forEach(entry => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${entry.order_id || ""}</td>
          <td>${entry.litros || 0}</td>
          <td>${entry.device || ""}</td>
          <td>${entry.start || ""}</td>
          <td>${entry.end || ""}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch(e) {
    console.error("Error fetchHistorial", e);
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

// --- Auto-refresh ---
setInterval(fetchRealtime, 1000);
setInterval(fetchOrders, 5000);
setInterval(fetchHistorial, 5000);
setInterval(cargarEC, 60000);

fetchRealtime();
fetchOrders();
fetchHistorial();
cargarEC();
