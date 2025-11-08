<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Monitor Conductividad</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  body{font-family:Arial,sans-serif;text-align:center;padding:20px;background:#f0f2f5;}
  canvas{max-width:800px;margin:20px auto;background:white;border-radius:10px;padding:10px;box-shadow:0 0 10px rgba(0,0,0,0.1);}
  button{padding:10px 20px;margin:10px;background:#0066cc;color:white;border:none;border-radius:8px;cursor:pointer;}
  button:hover{background:#004d99;}
</style>
</head>
<body>
<h1>Gráfica Conductividad por Hora</h1>
<canvas id="grafica"></canvas>
<br>
<button onclick="window.location.href='/'">Volver al inicio</button>

<script>
let chartMonitor;
async function cargarDatos(){
  const res = await fetch('/data');
  const datos = await res.json();
  const agrupado = {};
  datos.forEach(d=>{
    const fecha = new Date(d.timestamp);
    const hora = fecha.toISOString().slice(0,13);
    if(!agrupado[hora]) agrupado[hora]=[];
    agrupado[hora].push(d.ec);
  });
  const labels = Object.keys(agrupado).sort();
  const valores = labels.map(h=>{
    const arr = agrupado[h];
    return arr.reduce((a,b)=>a+b,0)/arr.length;
  });

  if(!chartMonitor){
    const ctx = document.getElementById('grafica').getContext('2d');
    chartMonitor = new Chart(ctx,{type:'line',data:{labels:labels.map(h=>h.replace('T',' ')),datasets:[{label:'Conductividad (µS/cm)',data:valores,borderColor:'#0066cc',fill:false,tension:0.2}]},options:{scales:{x:{title:{display:true,text:'Hora'}},y:{title:{display:true,text:'µS/cm'}}}}});
  } else {
    chartMonitor.data.labels = labels.map(h=>h.replace('T',' '));
    chartMonitor.data.datasets[0].data = valores;
    chartMonitor.update();
  }
}

setInterval(cargarDatos,5000);
cargarDatos();
</script>
</body>
</html>
