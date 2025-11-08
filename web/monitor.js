async function cargarDatos() {
  try {
    const respuesta = await fetch('/data');
    const datos = await respuesta.json();

    // Agrupar por hora
    const agrupado = {};
    datos.forEach(d => {
      const fecha = new Date(d.timestamp); // Usar timestamp guardado en Mongo
      const hora = fecha.toISOString().slice(0,13); // "YYYY-MM-DDTHH"
      if (!agrupado[hora]) agrupado[hora] = [];
      agrupado[hora].push(d.ec); // Suponiendo que el campo en Mongo es "ec"
    });

    // Obtener etiquetas y valores promedio
    const etiquetas = Object.keys(agrupado).sort();
    const promedios = etiquetas.map(h => {
      const valores = agrupado[h];
      return valores.reduce((a,b) => a+b, 0) / valores.length;
    });

    // Graficar
    const ctx = document.getElementById('grafica').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas.map(h => h.replace('T',' ')), // legible
        datasets: [{
          label: 'Conductividad promedio (µS/cm)',
          data: promedios,
          borderColor: '#0066cc',
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Hora' } },
          y: { title: { display: true, text: 'µS/cm' }, beginAtZero: true }
        }
      }
    });

  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// Ejecutar cada 5 segundos para actualizar la pantalla
cargarDatos();
setInterval(cargarDatos, 5000);
