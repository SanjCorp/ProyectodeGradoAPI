async function cargarDatos() {
  try {
    const res = await fetch('/data');
    const datos = await res.json();

    // Filtrar solo los que tengan EC y timestamp
    const filtrados = datos.filter(d => d.ec !== undefined && d.timestamp);

    // Agrupar por hora
    const agrupado = {};
    filtrados.forEach(d => {
      const fecha = new Date(d.timestamp);
      const hora = fecha.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      if (!agrupado[hora]) agrupado[hora] = [];
      agrupado[hora].push(d.ec);
    });

    // Promediar por hora
    const labels = Object.keys(agrupado).sort();
    const valores = labels.map(h => {
      const arr = agrupado[h];
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    });

    // Dibujar gráfica
    const ctx = document.getElementById('grafica').getContext('2d');
    if (window.chart) window.chart.destroy(); // borrar gráfica anterior
    window.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.map(h => h.replace("T", " ")),
        datasets: [{
          label: 'Conductividad promedio (µS/cm)',
          data: valores,
          borderColor: '#0066cc',
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: "Hora" } },
          y: { title: { display: true, text: "µS/cm" }, beginAtZero: true }
        }
      }
    });

  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// Cargar datos cada 5 segundos
cargarDatos();
setInterval(cargarDatos, 5000);
