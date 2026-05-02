// js/ui.js

const datosGeo = {
    "Barcelona": [
        "Barcelona ciudad", "Badalona", "Castelldefels", "Cornellà de Llobregat", 
        "Granollers", "L'Hospitalet de Llobregat", "Mataró", "Sabadell", 
        "Sant Cugat del Vallès", "Sitges", "Terrassa", "Vilanova i la Geltrú",
        "Vilafranca del Penedès"
    ],
    "Tarragona": [
        "Tarragona ciudad", "Reus", "Salou", "Vila-seca", "Cambrils", 
        "Torredembarra", "Altafulla", "Calafell", "Segur de Calafell", 
        "Cunit", "El Vendrell", "Roda de Berà", "Valls", "Tortosa", "Amposta"
    ],
    "Lleida": [
        "Lleida ciudad", "Balaguer", "Tàrrega", "Mollerussa", "Cervera", "Vielha"
    ],
    "Girona": [
        "Girona ciudad", "Figueres", "Blanes", "Lloret de Mar", "Olot", 
        "Salt", "Palafrugell", "Palamós", "Sant Feliu de Guíxols"
    ]
};




// --- ACTUALIZACIÓN DE LA FUNCIÓN NAVEGAR ---

// Variable para saber qué perfil mostrar
window.perfilTemporal = null;

// --- LÓGICA DINÁMICA DE FORMULARIO (REVISADA) ---

function gestionarCamposDinamicos() {
    // Aseguramos que los elementos existen antes de tocarlos
    const inCat = document.getElementById('in-cat');
    const geo = document.getElementById('geo-container');
    const camara = document.getElementById('camara-container');

    if (!inCat || !geo || !camara) return;

    const cat = inCat.value;

    // 1. Lógica para Provincias/Poblaciones (solo sitios físicos)
    if (cat === 'BAR/RESTAURANTE' || cat === 'LUGAR') {
        geo.style.display = 'block';
    } else {
        geo.style.display = 'none';
    }

    // 2. Lógica para la CÁMARA
    // COMIDA ahora activará el contenedor correctamente desde el inicio
    const categoriasConFoto = ['COMIDA', 'BAR/RESTAURANTE', 'LUGAR', 'OTROS'];
    
    if (categoriasConFoto.includes(cat)) {
        camara.style.display = 'block';
    } else {
        camara.style.display = 'none';
    }
}

// ... Resto de tus funciones (actualizarPoblaciones, verDetalle, etc.) se mantienen igual
function actualizarPoblaciones() {
    const prov = document.getElementById('in-provincia').value;
    const selectPob = document.getElementById('in-poblacion');
    
    selectPob.innerHTML = '<option value="">Selecciona Población...</option>';
    
    if (datosGeo[prov]) {
        const ordenadas = [...datosGeo[prov]].sort();
        ordenadas.forEach(pob => {
            const opt = document.createElement('option');
            opt.value = pob;
            opt.textContent = pob;
            selectPob.appendChild(opt);
        });
    }
}
function verPerfilAjeno(nombreUsuario) {
    // 1. Cambiar de pantalla
    navegar('page-perfil');

    // 2. Llamar a la función MAESTRA de perfil.js pasándole el nombre
    // Esta función ya se encarga de filtrar, poner el título, la tarta y la lista
    actualizarPerfil(nombreUsuario);

    // 3. Gestionar botón de salir
    const miNombre = localStorage.getItem('usuario');
    const btnLogout = document.querySelector('#page-perfil button[onclick="logout()"]');
    if (btnLogout) {
        btnLogout.style.display = (nombreUsuario === miNombre) ? 'block' : 'none';
    }
}

// --- GESTIÓN DE DETALLES Y VISTAS ---

// --- GESTIÓN DE DETALLES Y VISTAS ---

function pintarResenas(resenas) {
    const listaResenas = document.getElementById('ver-resenas-lista');
    if (!listaResenas) return;

    if (resenas && resenas.length > 0) {
        listaResenas.innerHTML = resenas.map(r => `
            <div style="background: #2C2C2E; border-left: 4px solid #FF9500; padding: 12px 16px; border-radius: 0 12px 12px 0; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                <div style="font-weight: bold; color: #FF9500; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 4px;">
                    ${r.autor || "Anónimo"}
                </div>
                <div style="font-style: italic; color: #FFFFFF; font-size: 0.85rem; line-height: 1.4;">
                    "${r.texto}"
                </div>
                <div style="font-size: 0.65rem; color: #8e8e93; margin-top: 6px; text-align: right;">
                    ${r.fecha ? new Date(r.fecha).toLocaleDateString() : ''}
                </div>
            </div>
        `).join('');
    } else {
        listaResenas.innerHTML = `<p style="color: #8e8e93; font-size: 0.9rem; text-align: center; padding: 10px;">No hay reseñas aún. ¡Sé el primero!</p>`;
    }
}

async function enviarResena() {
    const idInput = document.getElementById('ver-id')?.value;
    const idDataset = document.getElementById('page-ver-joya')?.dataset.currentId;
    const id = idInput || idDataset;

    const input = document.getElementById('in-nueva-resena');
    
    if (!id || !input) return;
    
    const texto = input.value.trim();
    if (!texto) return alert("Escribe algo primero, colega");

    const autor = typeof currentUser !== 'undefined' ? currentUser : "Anónimo";

    try {
        const r = await fetch(`/api/joyas/${id}/resena`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                autor: autor, 
                texto: texto,
                fecha: new Date().toISOString()
            })
        });

        if (r.ok) {
            const joyaActualizada = await r.json();
            
            const idx = datos.findIndex(j => String(j.id) === String(id));
            if (idx !== -1) {
                datos[idx] = joyaActualizada;
            }

            input.value = ""; 

            // Llamamos a la misma función pintarResenas con el estilo unificado
            pintarResenas(joyaActualizada.resenas);

            if (typeof renderMuro === 'function') {
                renderMuro();
            }

        } else {
            alert("No se pudo guardar la reseña en el servidor.");
        }
    } catch (e) {
        console.error("Error al enviar reseña:", e);
    }
}

// Variable global para que renderMuro sepa qué categoría filtrar
window.catActiva = 'TODO';

// Función para cambiar de categoría
window.setCat = function(categoria) {
    window.catActiva = categoria;

    const botones = document.querySelectorAll('.btn-cat');
    botones.forEach(btn => {
        btn.classList.remove('active-cat');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${categoria}'`)) {
            btn.classList.add('active-cat');
        }
    });

    if (typeof renderMuro === 'function') {
        renderMuro();
    }
};



// 2. VER DETALLE DE LA JOYA


function compartirJoya() {
    const titulo = document.getElementById('det-title').innerText;
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({ title: 'Joyita: ' + titulo, url: url });
    } else {
        alert("Copiado al portapapeles");
    }
}
function borrarJoya() {
    const id = document.getElementById('ver-id').value;
    
    pedirConfirmacion(
        "¿Borrar esta joyita?", 
        "Se eliminará para siempre y no podrás recuperarla.", 
        async () => {
            try {
                const respuesta = await fetch(`/api/joyas/${id}`, { method: 'DELETE' });
                if (respuesta.ok) {
                    // Refrescamos los datos y volvemos al muro
                    if (typeof cargar === 'function') await cargar();
                    navegar('main-view');
                }
            } catch (error) {
                console.error("Error al borrar:", error);
            }
        }
    );
}

