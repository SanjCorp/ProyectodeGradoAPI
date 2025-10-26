const ctx = document.getElementById('conductivityChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Conductividad (µS/cm)',
            data: [],
            borderWidth: 2,
            borderColor: 'blue',
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            y: { beginAtZero: true },
            x: { title: { display: true, text: 'Hora' } }
        }
    }
});

async function fetchData() {
    const res = await fetch('/data');
    const data = await res.json();

    const labels = data.map(d => d.timestamp);
    const values = data.map(d => d.ec);

    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
}

// Actualiza cada 5 segundos
setInterval(fetchData, 5000);
fetchData();
