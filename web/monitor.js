async function cargarDatos() {
  const response = await fetch("/data");
  const datos = await response.json();

  // Ordenar por fecha si es necesario
  datos.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const etiquetas = datos.map(d => d.timestamp);
  const valores = datos.map(d => d.ec);

  const ctx = document.getElementById("grafico").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [{
        label: "Conductividad (µS/cm)",
        data: valores,
        borderWidth: 2,
        fill: false,
        tension: 0.2
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Hora" } },
        y: { title: { display: true, text: "µS/cm" } }
      }
    }
  });
}

// Actualiza la gráfica cada 10 segundos
cargarDatos();
setInterval(cargarDatos, 10000);
