let chart = null;

async function cargarDatos() {
  try {
    const respuesta = await fetch('/data');
    const datos = await respuesta.json();

    // Agrupar por hora
    const agrupado = {};
    datos.forEach(d => {
      const fecha = new Date(d.timestamp || d.fechaHora);
      const hora = fecha.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
      if (!agrupado[hora]) agrupado[hora] = [];
      agrupado[hora].push(d.ec);
    });

    // Calcular promedio por hora
    const etiquetas = Object.keys(agrupado).sort();
    const promedios = etiquetas.map(hora => {
      const valores = agrupado[hora];
      return valores.reduce((a, b) => a + b, 0) / valores.length;
    });

    // Si la gráfica ya existe, actualizarla
    if (chart) {
      chart.data.labels = etiquetas.map(h => h.replace("T", " "));
      chart.data.datasets[0].data = promedios;
      chart.update();
    } else {
      const ctx = document.getElementById('grafica').getContext('2d');
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: etiquetas.map(h => h.replace("T", " ")),
          datasets: [{
            label: 'Conductividad (µS/cm)',
            data: promedios,
            borderColor: "#0066cc",
            backgroundColor: "#0066cc33",
            fill: true,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: { title: { display: true, text: "Hora" } },
            y: { title: { display: true, text: "µS/cm" }, beginAtZero: true }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// Actualizar cada 5 segundos
setInterval(cargarDatos, 5000);
cargarDatos();
