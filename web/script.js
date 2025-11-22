async function sendPreset(tipo) {
  let litros = 0;
  if(tipo === "preparar") litros = 5000;
  else if(tipo === "aforar") litros = 2000;
  else if(tipo === "cip") litros = 450;
  else {
    litros = parseFloat(document.getElementById('litrosOtro').value);
    if(isNaN(litros) || litros <= 0){
      alert("Ingrese un valor válido");
      return;
    }
  }

  const data = { litros };
  await fetch("/place_order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  alert("Orden enviada: " + litros + " L");
}

document.getElementById('litrosOtro').style.display = "none";
document.querySelector('button[onclick="sendPreset(\'otro\')"]').addEventListener('click',()=>{
  document.getElementById('litrosOtro').style.display = "block";
});

// Actualizar datos en tiempo real
async function actualizarEstado() {
  try {
    const res = await fetch('/data');
    const datos = await res.json();
    if(!datos) return;

    document.getElementById('litrosDispensados').textContent = datos.flujo.toFixed(2);
    document.getElementById('ecValue').textContent = datos.ec.toFixed(2);
    document.getElementById('motorStatus').textContent = datos.flujo > 0 ? "ON" : "OFF";
  } catch(e){
    console.error("Error actualizando estado:", e);
  }
}

setInterval(actualizarEstado, 1000);
