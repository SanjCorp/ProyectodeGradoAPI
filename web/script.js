let chart;

async function actualizar() {
  const res = await fetch('/data');
  const datos = await res.json();
  if(datos.length==0) return;

  const ultimo = datos[datos.length-1];
  document.getElementById('contador').textContent = ultimo.ec.toFixed(2);
  document.getElementById('nivel1').textContent = ultimo.tk100 || 0;
  document.getElementById('nivel2').textContent = ultimo.tk101 || 0;
  document.getElementById('nivel3').textContent = ultimo.tk900 || 0;

  // Grafica por hora
  const agrupado = {};
  datos.forEach(d => {
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

  if(!chart){
    const ctx = document.getElementById('grafica').getContext('2d');
    chart = new Chart(ctx, {
      type:'line',
      data:{ labels: labels.map(h=>h.replace("T"," ")), datasets:[{ label:'Conductividad (µS/cm)', data: valores, borderColor:'#0066cc', fill:false, tension:0.2 }]},
      options:{ scales:{ x:{ title:{display:true,text:'Hora'} }, y:{ title:{display:true,text:'µS/cm'} } } }
    });
  } else {
    chart.data.labels = labels.map(h=>h.replace("T"," "));
    chart.data.datasets[0].data = valores;
    chart.update();
  }
}

// Función de envío de agua
async function enviarAgua(){
  const cantidad = prompt("Ingrese cantidad de agua a enviar (litros):");
  if(!cantidad) return;

  // Activar LED
  const led = document.getElementById('led');
  led.classList.remove('led-off');
  led.classList.add('led-on');

  // Enviar comando al ESP32 (simulado con POST)
  const res = await fetch('/data', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ comando:'enviar_agua', cantidad: Number(cantidad) })
  });
  const result = await res.json();
  console.log(result);

  // Simulación de llegada de agua
  setTimeout(()=>{ 
    led.classList.remove('led-on'); 
    led.classList.add('led-off');
    alert("Agua enviada");
    actualizar();
  }, 3000); // 3 seg solo para demo, reemplazar con dato real del flujometro
}

// Auto-refresco cada 5s
setInterval(actualizar,5000);
actualizar();
