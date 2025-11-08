let chart;
let ecData = [];
let ecLabels = [];

const userMap = {
  300: "ARIEL VALDIVIA",
  1175: "CHRISTOFER",
  984: "MARCOS JUSTINIANO",
  116: "RICARDO SANJINES",
  215: "BRAYAN CHOQUE"
};

// Función para obtener datos del ESP32
async function obtenerDatos() {
  try {
    const res = await fetch('/data');
    const datos = await res.json();

    // Última conductividad
    const ultimo = datos[datos.length - 1];
    if (ultimo) {
      document.getElementById('ecValue').textContent = ultimo.ec.toFixed(2);
      document.getElementById('nivel1').textContent = ultimo.nivel1 || 0;
      document.getElementById('nivel2').textContent = ultimo.nivel2 || 0;
      document.getElementById('nivel3').textContent = ultimo.nivel3 || 0;

      // Agregar al gráfico
      const ahora = new Date();
      ecData.push(ultimo.ec);
      ecLabels.push(ahora.toLocaleTimeString());
      if (ecData.length > 60) { // últimos 5 minutos aprox
        ecData.shift();
        ecLabels.shift();
      }

      if (!chart) {
        const ctx = document.getElementById('grafica').getContext('2d');
        chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ecLabels,
            datasets: [{
              label: 'Conductividad (µS/cm)',
              data: ecData,
              borderColor: '#0066cc',
              fill: false,
              tension: 0.2
            }]
          },
          options: {
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      } else {
        chart.data.labels = ecLabels;
        chart.data.datasets[0].data = ecData;
        chart.update();
      }
    }

  } catch (error) {
    console.error("Error obteniendo datos:", error);
  }
}

// Registrar usuario
function registrarUsuario() {
  const codigo = parseInt(document.getElementById('codigo').value);
  const nombre = userMap[codigo] || "Desconocido";
  document.getElementById('nombreUsuario').textContent = nombre;

  // Guardar en MongoDB
  fetch('/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'registro', codigo, nombre, timestamp: new Date() })
  });
}

// Enviar agua
function enviarAgua() {
  const cantidad = parseFloat(document.getElementById('cantidad').value);
  if (!cantidad || cantidad <= 0) return alert("Ingrese cantidad válida");

  document.getElementById('estadoAgua').textContent = "Enviando Agua";

  // Mandar orden al ESP32
  fetch('/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'envio', cantidad, timestamp: new Date() })
  });
}

// Actualiza datos cada 5 segundos
setInterval(obtenerDatos, 5000);
