const API = ""; // mismo origen si sirves con Flask

// Mostrar input "otro" si se selecciona
function sendPreset(type) {
  let litros = 0;
  if (type === 'preparar') litros = 5000;
  else if (type === 'aforar') litros = 2000;
  else if (type === 'cip') litros = 450;
  else {
    document.getElementById("litrosOtro").style.display = "inline";
    litros = parseFloat(document.getElementById("litrosOtro").value) || 0;
    if (!litros) return alert("Ingresa litros válidos");
  }

  fetch(API + "/place_order", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ litros: litros, operator: "web" })
  })
  .then(res => res.json())
  .then(data => alert("Orden creada: " + data.id))
  .catch(err => alert("Error creando orden: " + err));
}

// Mostrar EC y litros en tiempo real
async function fetchRealtime() {
  try {
    const res = await fetch(API + "/data");
    const arr = await res.json();
    if (!arr.length) return;

    const latest = arr[0];
    document.getElementById("ecValue").innerText = latest.ec || "--";
    document.getElementById("litrosDispensados").innerText = latest.litros_acumulados || 0;
    document.getElementById("motorStatus").innerText = latest.motor ? "ON" : "OFF";
  } catch(e) {
    console.error(e);
  }
}

setInterval(fetchRealtime, 1000);
fetchRealtime();

// Graficar histórico EC por hora
async function drawECGraph() {
  try {
    const res = await fetch(API + "/data");
    const datos = await res.json();
    const agrupado = {};
    datos.forEach(d => {
      if (!d.ec || !d.timestamp) return;
      const hora = new Date(d.timestamp).toISOString().slice(0,13);
      if (!agrupado[hora]) agrupado[hora]=[];
      agrupado[hora].push(d.ec);
    });

    const labels = Object.keys(agrupado).sort();
    const valores = labels.map(h => {
      const arr = agrupado[h];
      return arr.reduce((a,b)=>a+b,0)/arr.length;
    });

    const ctx = document.getElementById('graficaEC').getContext('2d');
    if(window.ecChart) window.ecChart.destroy();
    window.ecChart = new Chart(ctx, {
      type:'line',
      data:{
        labels: labels.map(l=>l.replace("T"," ")),
        datasets:[{label:'EC promedio (µS/cm)', data:valores, borderColor:'#0066cc', fill:false}]
      }
    });
  } catch(e){console.error(e);}
}

drawECGraph();
setInterval(drawECGraph,60000);
