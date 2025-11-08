// Simulación de flujo en tiempo real
let flujoActual = 0;
setInterval(() => {
  flujoActual = (Math.random() * 10).toFixed(2); // Simulación de 0–10 L/min
  document.getElementById("flujo").textContent = flujoActual;
}, 1000);

document.getElementById("btnEnviar").addEventListener("click", async () => {
  const litros = document.getElementById("litros").value;
  const codigo = document.getElementById("codigo").value;

  if (!litros || !codigo) {
    alert("Por favor ingresa la cantidad de litros y el código del operador.");
    return;
  }

  const datos = {
    litros: parseFloat(litros),
    codigo: codigo
  };

  try {
    const res = await fetch("/enviar_agua", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    const result = await res.json();
    alert(result.message);

    document.getElementById("litros").value = "";
  } catch (error) {
    console.error("Error al enviar datos:", error);
  }
});
