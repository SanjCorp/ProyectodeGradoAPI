async function cargarDatos() {
  try {
    const respuesta = await fetch('/data');
    const datos = await respuesta.json();

    // Agrupar por hora
    const agrupado = {};
    datos.forEach(d => {
      const fecha = new Date(d.timestamp || d.fechaHora);
      const hora = fecha.toLocaleString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (!agrupado[hora]) agrupado[hora] = [];
      agrupado[hora].push(d.valor);
    });

    const etiquetas = Object.keys(agrupado);
    const promedios = etiquetas.map(h => {
      const valores = agrupado[h];
      return valores.reduce((a, b) => a + b, 0) / valores.length;
    });

    const ctx = document.getElementById('grafica').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Conductividad Promedio por Hora (µS/cm)',
          data: promedios,
          borderWidth: 2,
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

window.onload = cargarDatos;
