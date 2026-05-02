




function actualizarPerfil(nombreABuscar) {
    const usuarioDestino = nombreABuscar || window.currentUser;
    if (!usuarioDestino) return;

    navegar('page-perfil');

    // 1. Buscamos el h2 que acabamos de ver en tu HTML
    const titulo = document.getElementById('perf-nombre');
    if (titulo) {
        // 2. Le cambiamos el texto para que incluya el nombre de usuario
        titulo.innerText = (usuarioDestino === window.currentUser) 
            ? `Mi Perfil (${usuarioDestino})` 
            : `Perfil de ${usuarioDestino}`;
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.style.display = (usuarioDestino === window.currentUser) ? 'block' : 'none';
    }

    if (typeof datos !== 'undefined' && datos.length > 0) {
        const misJoyas = datos.filter(j => {
            const autorDeLaJoya = j.autor || j.user || j.usuario || "";
            return autorDeLaJoya.toLowerCase().trim() === usuarioDestino.toLowerCase().trim();
        });

        // 3. Pintamos la tarta y las barras de progreso
        dibujarTartaPerfil(misJoyas);
        
        // 4. Pintamos la lista de joyas (Aportaciones)
        renderizarListaPerfil(misJoyas);
        
        // 5. Pintamos las reseñas escritas
        renderizarResenasEscritas(misJoyas);
    }
}











function dibujarTartaPerfil(joyas) {
    const tarta = document.getElementById('tarta-grafico');
    const leyenda = document.getElementById('tarta-leyenda');
    if (!tarta || !leyenda) return;

    if (joyas.length === 0) {
        tarta.style.background = "#eee";
        leyenda.innerHTML = "<p style='color:gray; font-size:0.8rem; text-align:center; width:100%;'>Sin datos de categorías.</p>";
        return;
    }

    const conteo = {};
    joyas.forEach(j => {
        let cat = (j.categoria || j.cat || "OTROS").toUpperCase();
        conteo[cat] = (conteo[cat] || 0) + 1;
    });

    const colores = { 
        'COMIDA': '#FF9500', 
        'BAR/RESTAURANTE': '#FF3B30', 
        'LUGAR': '#34C759', 
        'PELICULA O SERIE': '#5856D6', 
        'MUSICA': '#007AFF', 
        'OTROS': '#8E8E93' 
    };

    let acumulado = 0;
    const partes = [];
    leyenda.innerHTML = ""; 
    
    Object.keys(conteo).forEach(cat => {
        const totalCat = conteo[cat];
        const porc = (totalCat / joyas.length) * 100;
        const col = colores[cat] || '#8E8E93';
        
        partes.push(`${col} ${acumulado}% ${acumulado + porc}%`);
        acumulado += porc;

        leyenda.innerHTML += `
            <div style="width: 100%; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 2px;">
                    <span>${cat}</span>
                    <span style="font-weight: bold;">${Math.round(porc)}%</span>
                </div>
                <div style="width: 100%; background: #E5E5EA; height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${porc}%; background: ${col}; height: 100%;"></div>
                </div>
            </div>
        `;
    });

    tarta.style.background = `conic-gradient(${partes.join(', ')})`;
}

function renderizarListaPerfil(joyas) {
    const listaAportaciones = document.getElementById('perf-lista');
    if (!listaAportaciones) return;

    listaAportaciones.innerHTML = "";

    if (!joyas || joyas.length === 0) {
        listaAportaciones.innerHTML = "<p style='color:gray; font-size:0.85rem;'>No has creado ninguna aportación todavía.</p>";
        return;
    }

    joyas.forEach(j => {
        const item = document.createElement('div');
        item.className = "card-simple";
        item.style.cursor = "pointer";
        
        // Hacemos que al pulsar te lleve al detalle de la joya
        item.onclick = () => {
            if (typeof verJoya === 'function') {
                verJoya(j.id);
            } else if (typeof verDetalle === 'function') {
                verDetalle(j.id);
            }
        };
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <b style="font-size: 1rem; color: #1C1C1E;">${j.real || "Sin título"}</b>
                <span style="color: #FF9500; font-weight: bold;">★ ${j.rating || 5}</span>
            </div>
            <div style="color: #8E8E93; font-size: 0.8rem; margin-top: 4px;">
                📍 ${j.poblacion || "Ubicación no especificada"}
            </div>
        `;
        listaAportaciones.appendChild(item);
    });
}