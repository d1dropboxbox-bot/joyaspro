// js/ranking.js
function actualizarRanking() {
    const listaRanking = document.getElementById('ranking-lista');
    if (!listaRanking) return;

    listaRanking.innerHTML = "";

    if (typeof datos === 'undefined' || datos.length === 0) {
        listaRanking.innerHTML = "<p style='text-align:center; color:gray;'>No hay datos para el ranking.</p>";
        return;
    }

    // 1. Inicializamos el objeto de conteo para todos los autores
    const conteo = {};

    // Primero: Contamos las joyas creadas por cada autor
    datos.forEach(j => {
        const autor = j.autor || j.user || j.usuario || "Anónimo";
        if (!conteo[autor]) {
            conteo[autor] = { joyas: 0, resenas: 0 };
        }
        conteo[autor].joyas += 1;
    });

    // Segundo: Recorremos las joyas una sola vez para contar las reseñas
    datos.forEach(joya => {
        if (joya.resenas && joya.resenas.length > 0) {
            joya.resenas.forEach(r => {
                const autorResena = r.autor || r.usuario || "";
                
                // Si el autor de la reseña existe en nuestra lista, le sumamos la reseña
                if (autorResena) {
                    const autorNormalizado = autorResena.toLowerCase().trim();
                    
                    // Buscamos si este autor ya está en nuestro objeto de conteo
                    const autorEncontrado = Object.keys(conteo).find(
                        key => key.toLowerCase().trim() === autorNormalizado
                    );

                    if (autorEncontrado) {
                        conteo[autorEncontrado].resenas += 1;
                    } else {
                        // Por si ha escrito reseñas pero no ha creado joyas aún
                        conteo[autorResena] = { joyas: 0, resenas: 1 };
                    }
                }
            });
        }
    });

    // 2. Convertir a array y ordenar por joyas creadas de mayor a menor
    const rankingOrdenado = Object.keys(conteo).map(nombre => {
        return { 
            nombre: nombre, 
            total: conteo[nombre].joyas,
            resenas: conteo[nombre].resenas
        };
    }).sort((a, b) => b.total - a.total);

    // 3. Obtener los máximos para calcular los porcentajes de las barras
    const maxJoyas = rankingOrdenado[0].total || 1;
    const maxResenas = Math.max(...rankingOrdenado.map(u => u.resenas)) || 1;

    // 4. Dibujar el ranking con barras de progreso
    rankingOrdenado.forEach((usuario, index) => {
        const puesto = index + 1;
        const porcJoyas = (usuario.total / maxJoyas) * 100;
        const porcResenas = (usuario.resenas / maxResenas) * 100;
        
        let icono = "💎";
        if (puesto === 1) icono = "🥇";
        if (puesto === 2) icono = "🥈";
        if (puesto === 3) icono = "🥉";

        const card = document.createElement('div');
        card.style = `
            background: white; 
            padding: 15px; 
            border-radius: 16px; 
            margin-bottom: 12px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            cursor: pointer;
        `;
        
        card.onclick = () => actualizarPerfil(usuario.nombre);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: bold; color: #8e8e93; width: 20px;">${puesto}</span>
                    <span style="font-size: 1.2rem;">${icono}</span>
                    <span style="font-weight: 600;">${usuario.nombre}</span>
                </div>
                <span style="font-size: 0.8rem; color: #8E8E93;">
                    ${usuario.total} joyas · ${usuario.resenas} reseñas
                </span>
            </div>
            
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #8E8E93; margin-bottom: 3px;">
                    <span>Joyas creadas</span>
                    <span style="font-weight: bold; color: ${puesto === 1 ? '#FF9500' : '#007AFF'};">
                        ${usuario.total}
                    </span>
                </div>
                <div style="width: 100%; background: #F2F2F7; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="
                        width: ${porcJoyas}%; 
                        background: ${puesto === 1 ? '#FFD700' : '#007AFF'}; 
                        height: 100%; 
                        border-radius: 3px;
                        transition: width 0.5s ease-out;
                    "></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #8E8E93; margin-bottom: 3px;">
                    <span>Reseñas escritas</span>
                    <span style="font-weight: bold; color: #34C759;">${usuario.resenas}</span>
                </div>
                <div style="width: 100%; background: #F2F2F7; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="
                        width: ${porcResenas}%; 
                        background: #34C759; 
                        height: 100%; 
                        border-radius: 3px;
                        transition: width 0.5s ease-out;
                    "></div>
                </div>
            </div>
        `;
        
        listaRanking.appendChild(card);
    });
}