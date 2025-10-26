async function actualizar() {
    try {
        const response = await fetch('https://proyectodegradoapi.onrender.com/data');
        const datos = await response.json();

        if (datos.length > 0) {
            const ultimo = datos[datos.length - 1]; // tomar último dato
            document.getElementById('contador').textContent = `${ultimo.ec} µS/cm`;
            document.getElementById('hora').textContent = `Registrado: ${ultimo.timestamp}`;
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

// Actualizar automáticamente cada 5 segundos
setInterval(actualizar, 5000);

// Actualizar al cargar la página
window.onload = actualizar;
