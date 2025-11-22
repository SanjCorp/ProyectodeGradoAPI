const API = ""; // Si sirve desde el mismo Flask, deja vacío

let motorStatus = document.getElementById("motorStatus");
let litrosDisp = document.getElementById("litrosDispensados");
let ecSpan = document.getElementById("ecValue");

// --- Gráfica EC ---
let ctx = document.getElementById("graficaEC").getContext("2d");
let chartEC = new Chart(ctx, {
  type:"line",
  data:{labels:[], datasets:[{label:"EC (µS/cm)", data:[], borderColor:"blue", fill:false}]}
});

// --- Obtener últimos datos y refrescar ---
async function fetchData() {
  try {
    let res = await fetch(API+"/data");
    let arr = await res.json();
    if(arr.length){
      let latest = arr[0];
      ecSpan.innerText = latest.ec || "--";
      litrosDisp.innerText = latest.litros || 0;
      motorStatus.innerText = latest.motor?"ON":"OFF";

      // Gráfica
      chartEC.data.labels.push(new Date(latest.timestamp).toLocaleTimeString());
      chartEC.data.datasets[0].data.push(latest.ec || 0);
      if(chartEC.data.labels.length>30){
        chartEC.data.labels.shift();
        chartEC.data.datasets[0].data.shift();
      }
      chartEC.update();
    }
  } catch(e){ console.error("Error fetchData", e); }
}
setInterval(fetchData, 2000);

// --- Enviar orden predefinida ---
async function sendPreset(tipo){
  let litros;
  if(tipo==="preparar") litros=5000;
  else if(tipo==="aforar") litros=2000;
  else if(tipo==="cip") litros=450;
  else{
    litros = parseFloat(document.getElementById("litrosOtro").value);
    if(!litros) return alert("Ingresa litros válidos");
  }

  try{
    let res = await fetch(API+"/place_order",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({litros:litros,operator:"web"})
    });
    let data = await res.json();
    alert("Orden enviada: "+data.id);
  } catch(e){ alert("Error enviando orden") }
}
