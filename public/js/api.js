let datos = [];

// 1. CARGA INICIAL DE DATOS
async function cargar() {
    try {
        const r = await fetch('/api/joyas');
        datos = await r.json();
        renderMuro();
    } catch (e) { 
        console.error("Error API:", e); 
    }
}

// 2. FUNCIÓN PARA VER DETALLES (UNIFICADA)
// He llamado a las dos para que no importe cuál busque el HTML
async function verJoya(id) {
    const j = datos.find(item => String(item.id) === String(id));
    if (!j) return;

    // --- NUEVO: Resetear el scroll arriba del todo antes de mostrar la página ---
    const paginaVer = document.getElementById('page-ver-joya');
    if (paginaVer) {
        paginaVer.scrollTop = 0;
    }

    // --- SUMAR VISTA EN EL SERVIDOR ---
    try {
        const respuesta = await fetch(`/api/joyas/${id}/vista`, {
            method: 'POST'
        });
        if (respuesta.ok) {
            const joyaActualizada = await respuesta.json();
            // Actualizamos localmente el contador de vistas y las reseñas
            j.vistas = joyaActualizada.vistas;
            j.resenas = joyaActualizada.resenas;
        }
    } catch (error) {
        console.error("Error al actualizar vistas:", error);
    }
    // ----------------------------------------

    // Navegar a la página con el ID que pusiste en el HTML
    navegar('page-ver-joya');

    // NUEVO: Forzar el scroll arriba del todo una vez que la página ya está activa
    setTimeout(() => {
        const paginaVer = document.getElementById('page-ver-joya');
        if (paginaVer) {
            paginaVer.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, 50);

    // Guardamos el ID en el input oculto para las reseñas
    const inputId = document.getElementById('ver-id');
    if (inputId) inputId.value = id;

    // Pintar Título y Foto
    const contenedorTitulo = document.getElementById('detalle-titulo-container');
    if (contenedorTitulo) {
        const fotoUrl = j.foto || j.imagen || "";
        const inicial = (j.real || "J").charAt(0).toUpperCase();
        contenedorTitulo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                ${fotoUrl 
                    ? `<img src="${fotoUrl}" style="width:60px; height:60px; border-radius:12px; object-fit:cover;">`
                    : `<div style="width:60px; height:60px; border-radius:12px; background:#007AFF; color:white; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:bold;">${inicial}</div>`
                }
                <h2 style="margin:0;">${j.real || "Sin título"}</h2>
            </div>
        `;
    }

    // Pintar datos (Asegurando compatibilidad con 'gancho' y 'poblacion')
    if(document.getElementById('ver-donde')) {
        document.getElementById('ver-donde').innerText = j.poblacion || j.donde || "No especificado";
    }
    if(document.getElementById('ver-porque')) {
        document.getElementById('ver-porque').innerText = j.gancho || j.porque || "";
    }
    if(document.getElementById('ver-gancho')) {
        document.getElementById('ver-gancho').innerText = j.gancho || "";
    }

    // Pintar Estrellas
    const estrellasDisp = document.getElementById('det-stars-display');
    if(estrellasDisp) estrellasDisp.innerText = "⭐".repeat(j.rating || 5);

    // --- NUEVO: Mostrar el botón de borrar solo si soy el autor ---
    const btnBorrar = document.querySelector('#page-ver-joya button[onclick="borrarJoya()"]');
    if (btnBorrar) {
        const esMia = j.usuario === window.currentUser || j.autor === window.currentUser;
        btnBorrar.style.display = esMia ? 'block' : 'none';
    }

    // Pintar reseñas
    if (typeof pintarResenas === 'function') {
        pintarResenas(j.resenas);
    }
}// // 4. RENDERIZADO DEL MURO
function renderMuro() {
    const feed = document.getElementById('feed');
    if (!feed) return;

    const iconos = {
        'COMIDA': '🥘', 'BAR/RESTAURANTE': '🍴', 'LUGAR': '📍', 
        'PELICULA O SERIE': '🎬', 'MUSICA': '🎧', 'OTROS': '💎'
    };

    const textoBusqueda = document.getElementById('buscador')?.value.toLowerCase() || "";
    const catFiltro = typeof catActiva !== 'undefined' ? catActiva : 'TODO';
    
    // 1. Recuperamos la lista de joyas leídas desde el localStorage
    const leidas = JSON.parse(localStorage.getItem('joyasLeidas') || "[]");

    let lista = datos.filter(j => {
        const cumpleCat = (catFiltro === 'TODO' || j.cat === catFiltro);
        const cumpleTexto = (j.real && j.real.toLowerCase().includes(textoBusqueda));
        return cumpleCat && cumpleTexto;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    feed.innerHTML = lista.map(j => {
        const tiempoTxt = j.fecha ? formatearTiempo(j.fecha) : "---";
        const icono = iconos[j.cat] || iconos['OTROS'];
        const visualContent = j.foto 
            ? `<img src="${j.foto}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 12px; flex-shrink: 0;">`
            : `<span style="font-size: 2rem; width: 55px; text-align: center; flex-shrink: 0;">${icono}</span>`;

        // 2. Comprobamos si la joya NO ha sido leída todavía
        const esNueva = !leidas.includes(String(j.id));
        const etiquetaNuevo = esNueva 
            ? `<span style="background: #34C759; color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 6px; font-weight: bold; margin-left: 6px; vertical-align: middle; display: inline-block;">NUEVO</span>` 
            : '';

        // Obtenemos la valoración real buscando todas las posibles propiedades guardadas
        const valoracion = j.estrellas !== undefined ? j.estrellas : (j.rating !== undefined ? j.rating : 5);

        return `
            <div class="card-simple" onclick="
                let leidas = JSON.parse(localStorage.getItem('joyasLeidas') || '[]');
                if (!leidas.includes('${j.id}')) {
                    leidas.push('${j.id}');
                    localStorage.setItem('joyasLeidas', JSON.stringify(leidas));
                }
                verJoya('${j.id}');
            " style="padding: 16px; display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid #f2f2f7; background: #efcfa830; cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    ${visualContent}
                    <div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">
                        <b style="font-size: 1rem; color: #5a5a5f; display: flex; align-items: center; flex-wrap: wrap;">
                            ${j.real.toUpperCase()} ${etiquetaNuevo}
                        </b>
                        
                        <div style="font-size: 0.75rem; color: #666;">
                           <b style="color: #ff9500;">${j.autor || "Anónimo"}</b> • ${tiempoTxt}
                        </div>
                        
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 10px;">
                        <span>👁️ ${j.vistas || 0}</span>
                        <span>💬 ${j.resenas ? j.resenas.length : 0}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="font-size: 0.7rem; background: #E5F1FF; color: #007AFF; padding: 3px 8px; border-radius: 10px;">${j.cat}</span>
                        
                        <span style="color: #ff9500; font-weight: bold;">${valoracion}★</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
// 5. FUNCIONES DE APOYO (FECHAS, FOTOS, GUARDADO)
function formatearTiempo(fechaISO) {
    if (!fechaISO) return "---";

    const ahora = new Date();
    const fecha = new Date(fechaISO);
    
    // Normalizamos ambas fechas a las 00:00:00 para comparar solo días naturales
    const diaHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const diaJoya = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

    // Calculamos la diferencia exacta en días calendario
    const difMs = diaHoy - diaJoya;
    const difDias = Math.round(difMs / (1000 * 60 * 60 * 24));

    if (difDias === 0) {
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `publicado <b>hoy</b> a las ${horas}:${minutos}`;
    }
    
    if (difDias === 1) {
        return `publicado <b>ayer</b>`;
    }
    
    if (difDias < 7) {
        return `publicado <b>hace ${difDias} días</b>`;
    }
    
    // Para más de una semana
    return `publicado <b>${fecha.toLocaleDateString()}</b>`;
}


let fotoBase64 = null;
function hacerFoto() { document.getElementById('file-input')?.click(); }

function procesarArchivo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            fotoBase64 = e.target.result;
            const preview = document.getElementById('preview-foto');
            if (preview) preview.innerHTML = `<img src="${fotoBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function guardarJoya() {
    const inputNombre = document.getElementById('in-real');
    const inputGancho = document.getElementById('in-gancho');
    if (!inputNombre.value.trim() || !inputGancho.value.trim()) {
        alert("Faltan campos."); return;
    }

    const nuevaJoya = {
        autor: window.currentUser,
        real: inputNombre.value.trim(),
        cat: document.getElementById('in-cat').value,
        gancho: inputGancho.value.trim(),
        
        // ⬇️ MODIFICADO: Ahora lee el rating real que marcó el usuario
        rating: window.ratingSeleccionado || 5,
        
        fecha: new Date().toISOString(),
        vistas: 0,
        resenas: [],
        foto: fotoBase64,
        poblacion: document.getElementById('in-poblacion')?.value || ""
    };

    try {
        const r = await fetch('/api/joyas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaJoya)
        });
        if (r.ok) {
            navegar('main-view');
            cargar();
        }
    } catch (e) { console.error(e); }
}
// Iniciar
cargar();