const MEDALLAS_CONFIG = [
    { id: 'pionero', nombre: 'Pionero', icono: '🚀', desc: 'Subir la primera joya', requisito: (u) => u.joyas >= 1 },
    { id: 'coleccionista', nombre: 'Coleccionista', icono: '💎', desc: 'Más de 10 joyas', requisito: (u) => u.joyas >= 10 },
    { id: 'critico', nombre: 'Crítico de Élite', icono: '✍️', desc: 'Más de 5 reseñas escritas', requisito: (u) => u.resenas >= 5 },
    { id: 'explorador', nombre: 'Explorador', icono: '🗺️', desc: 'Joyas en 3 provincias distintas', requisito: (u) => u.provincias >= 3 },
    { id: 'influencer', nombre: 'Influencer', icono: '🔥', desc: 'Recibir 10 reseñas en total', requisito: (u) => u.resenasRecibidas >= 10 }
];

function calcularMedallas(stats) {
    return MEDALLAS_CONFIG.filter(m => m.requisito(stats));
}

