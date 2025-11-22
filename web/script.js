const API_BASE = ""; // mismo origen

// Enviar orden preset
async function sendPreset(tipo) {
  let litros = 0;
  if(tipo === "preparar") litros = 5000;
  else if(tipo === "aforar") litros = 2000;
  else if(tipo === "cip") litros = 450;
  else {
    // Otro
    const input = document.getElementById("litrosOtro");
    litros = parseFloat(input.value);
    if(isNaN(litros) || litros <= 0){
      alert("Ingresa un valor válido para 'Otro'");
      return;
    }
  }

  const payload = { litros: litros, operator: "web", tipo: tipo };
  const res = await fetch(API_BASE + "/place_order", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  alert("Orden creada: " + data.id);
  document.getElementById("litrosOtro").style.display = "none";
}

// Mostrar input si es "Otro"
document.querySelector("button[onclick=\"sendPreset('otro')\"]").addEventListener("click", ()=>{
  document.getElementById("litrosOtro").style.display = "inline-block";
});

// Consultar datos en tiempo real (litros y motor)
async function fetchRealTime() {
  try {
    const res = await fetch(API_BASE + "/enviar");
    const data = await res.json();
    const litros = data.litros || 0;
    const motor = litros > 0 ? "ON" : "OFF";

    document.getElementById("motorStatus").innerText = motor;
    document.getElementById("litrosDispensados").innerText = litros.toFixed(2);

  } catch(e) {
    console.error("Error fetchRealTime", e);
  }
  setTimeout(fetchRealTime, 2000); // cada 2 segundos
}
fetchRealTime();

// Mostrar histórico EC por hora
async function fetchECData() {
  try {
    const res = await fetch(API_BASE + "/data");
    const datos = await res.json();

    // Filtrar solo los que tengan EC
    const filtrados = datos.filter(d => d.ec !== undefined && d.timestamp);

    // Agrupar por hora
    const agrupado = {};
    filtrados.forEach(d => {
      const fecha = new Date(d.timestamp);
      const hora = fecha.toISOString().slice(0,13);
      if(!agrupado[hora]) agrupado[hora] = [];
      agrupado[hora].push(d.ec);
    });

    const labels = Object.keys(agrupado).sort();
    const valores = labels.map(h => {
      const arr = agrupado[h];
      return arr.reduce((a,b)=>a+b,0)/arr.length;
    });

    const ctx = document.getElementById("graficaEC").getContext("2d");
    if(window.ecChart) window.ecChart.destroy();
    window.ecChart = new Chart(ctx, {
      type:"line",
      data: {
        labels: labels.map(h=>h.replace("T"," ")),
        datasets:[{
          label:"Conductividad promedio (µS/cm)",
          data: valores,
          borderColor: "#0066cc",
          fill:false,
          tension:0.2
        }]
      },
      options: {
        scales:{
          x:{ title:{ display:true, text:"Hora" } },
          y:{ title:{ display:true, text:"µS/cm" }, beginAtZero:true }
        }
      }
    });

  } catch(e){
    console.error("Error fetchECData", e);
  }
  setTimeout(fetchECData, 5000); // cada 5 segundos
}
fetchECData();
