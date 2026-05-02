// js/main.js

// 1. VARIABLE GLOBAL (Sincronizada para toda la app)
window.currentUser = localStorage.getItem('usuario') || "";

// 2. NAVEGACIÓN
// Array para registrar el historial de navegación
window.historialNavegacion = [];

function navegar(id, guardarEnHistorial = true) {
    // 1. Obtener la página actual antes de cambiar (para el historial)
    const paginaActual = document.querySelector('.page.active');
    
    // CORREGIDO: Guardamos la página previa siempre que sea válida
    if (paginaActual && guardarEnHistorial) {
        const idActual = paginaActual.id;
        
        // No guardamos duplicados ni el selector inicial ni la pantalla de confirmación
        const ultimoHistorial = window.historialNavegacion[window.historialNavegacion.length - 1];
        if (idActual !== ultimoHistorial && idActual !== 'user-selector' && idActual !== 'page-confirmar') {
            window.historialNavegacion.push(idActual);
        }
    }

    // 2. Cambiar de página visualmente
    const paginas = document.querySelectorAll('.page');
    paginas.forEach(p => p.classList.remove('active'));
    
    const destino = document.getElementById(id);
    if (destino) {
        destino.classList.add('active');
        window.scrollTo(0, 0);

        // --- GENERAL: Forzar el scroll arriba del todo en CUALQUIER página ---
        setTimeout(() => {
            if (destino) {
                destino.scrollTo({ top: 0, behavior: 'instant' });
            }
        }, 50);
    }

    // Visibilidad del menú de navegación inferior
    const menu = document.getElementById('menu');
    if (menu) {
        menu.style.display = (id === 'user-selector' || id === 'page-confirmar') ? 'none' : 'flex';
    }

    // Visibilidad del Submenú Global (Baúl y Top Mes)
    const submenuGlobal = document.getElementById('submenu-global');
    if (submenuGlobal) {
        submenuGlobal.style.display = (id === 'user-selector' || id === 'page-confirmar') ? 'none' : 'flex';
    }

    // Visibilidad de la barra superior (Top Bar / Header)
    const barraSuperior = document.getElementById('header') || document.getElementById('top-bar');
    if (barraSuperior) {
        barraSuperior.style.display = (id === 'user-selector' || id === 'page-confirmar') ? 'none' : 'flex';
    }

    // 👤 OCULTAR EL NOMBRE DE USUARIO (CAJA ENTERA) DE LA CABECERA
    const userInfoHeader = document.getElementById('header-user-info');
    if (userInfoHeader) {
        userInfoHeader.style.display = (id === 'user-selector' || id === 'page-confirmar') ? 'none' : 'flex';
    }

    // =================================================================
    // 3. GESTIONAR VISIBILIDAD DEL BOTÓN DE VOLVER (CORREGIDO)
    // =================================================================
    const btnVolver = document.getElementById('btn-volver-atras');
    if (btnVolver) {
        // CORRECCIÓN: Ahora tampoco se muestra en 'page-confirmar'
        if (id === 'user-selector' || id === 'main-view' || id === 'page-confirmar') {
            btnVolver.style.display = 'none';
        } else {
            btnVolver.style.display = 'flex';
        }
    }

    // 4. Lógica específica al entrar a agregar joya
    if (id === 'page-add') {
        const camara = document.getElementById('camara-container');
        if (camara) camara.style.display = 'block';

        if (typeof gestionarCamposDinamicos === 'function') {
            gestionarCamposDinamicos();
        }

        if (typeof inicializarSelectorEstrellas === 'function') {
            inicializarSelectorEstrellas();
        }
    }

    // 5. Limpieza automática al volver al muro
    if (id === 'main-view') {
        const inputsALimpiar = ['in-real', 'in-gancho', 'in-provincia', 'in-poblacion', 'in-nueva-resena'];
        inputsALimpiar.forEach(idInput => {
            const input = document.getElementById(idInput);
            if (input) input.value = '';
        });

        const selectCat = document.getElementById('in-cat');
        if (selectCat) selectCat.value = 'COMIDA';

        const preview = document.getElementById('preview-foto');
        if (preview) {
            preview.innerHTML = `<span style="color: #888;">Sin foto</span>`;
        }
        
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.value = '';
        }

        if (typeof window.fotoTemporal !== 'undefined') {
            window.fotoTemporal = null;
        }

        const camara = document.getElementById('camara-container');
        if (camara) camara.style.display = 'block';

        if (typeof renderMuro === 'function') {
            renderMuro();
        }
    }
}

// =================================================================
// NUEVA: FUNCIÓN VOLVER ATRÁS (Faltaba en tu archivo anterior)
// =================================================================
function volverAtras() {
    window.historialNavegacion = window.historialNavegacion || [];

    if (window.historialNavegacion.length > 0) {
        // Sacamos la última página del historial
        const paginaAnterior = window.historialNavegacion.pop();
        // Navegamos a ella sin volver a guardar la página en el historial
        navegar(paginaAnterior, false);
    } else {
        // Si el historial está vacío, volvemos al muro por seguridad
        navegar('main-view', false);
    }
}

function inicializarSelectorEstrellas() {
    const contenedor = document.getElementById('star-input');
    if (!contenedor) return;

    window.ratingSeleccionado = 5;

    contenedor.innerHTML = `
        <div style="font-size: 1.8rem; cursor: pointer; display: inline-flex; gap: 8px; user-select: none;">
            <span class="star-btn" onclick="fijarEstrellas(1)" style="color: #FF9500;">⭐</span>
            <span class="star-btn" onclick="fijarEstrellas(2)" style="color: #FF9500;">⭐</span>
            <span class="star-btn" onclick="fijarEstrellas(3)" style="color: #FF9500;">⭐</span>
            <span class="star-btn" onclick="fijarEstrellas(4)" style="color: #FF9500;">⭐</span>
            <span class="star-btn" onclick="fijarEstrellas(5)" style="color: #FF9500;">⭐</span>
        </div>
        <div id="rating-texto" style="font-size: 0.85rem; color: #666; margin-top: 4px; font-weight: bold;">
            5 de 5 estrellas
        </div>
    `;
}

window.fijarEstrellas = function(valor) {
    window.ratingSeleccionado = valor;
    const estrellas = document.querySelectorAll('#star-input .star-btn');
    
    estrellas.forEach((estrella, index) => {
        if (index < valor) {
            estrella.style.color = '#FF9500'; 
            estrella.style.opacity = '1';
        } else {
            estrella.style.color = '#C7C7CC'; 
            estrella.style.opacity = '0.4';
        }
    });

    const texto = document.getElementById('rating-texto');
    if (texto) {
        texto.innerText = `${valor} de 5 estrellas`;
    }
};

// 3. ENTRAR (LOGIN)
function saveUser() {
    const input = document.getElementById('user-input');
    if (!input) return;
    const nombre = input.value.trim();

    if (nombre.length > 1) {
        localStorage.setItem('usuario', nombre);
        window.currentUser = nombre;
        
        const headerName = document.getElementById('header-username');
        if (headerName) headerName.innerText = nombre;
        
        if (typeof cargar === 'function') cargar();
        navegar('main-view');
    } else {
        alert("Introduce un nombre.");
    }
}

// 4. ARRANCAR
window.onload = () => {
    if (window.currentUser) {
        const headerName = document.getElementById('header-username');
        if (headerName) headerName.innerText = window.currentUser;
        if (typeof cargar === 'function') cargar();
        navegar('main-view');
    } else {
        navegar('user-selector');
    }
};

// 5. CERRAR SESIÓN (LOGOUT)
function logout() {
    localStorage.removeItem('usuario'); 
    window.historialNavegacion = [];
    location.reload(); 
}

function pedirConfirmacion(titulo, mensaje, accionSi, textoBtnSi = "SÍ, CONTINUAR") {
    const tituloElem = document.getElementById('conf-titulo');
    const mensajeElem = document.getElementById('conf-mensaje');
    const btnSi = document.getElementById('btn-conf-si');

    if (tituloElem) tituloElem.innerText = titulo;
    if (mensajeElem) mensajeElem.innerText = mensaje;
    if (btnSi) {
        btnSi.innerText = textoBtnSi;
        btnSi.onclick = function() {
            accionSi();
        };
    }
    
    navegar('page-confirmar');
}

function mostrarToast(mensaje, duracion = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.innerText = mensaje;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, duracion);
}

function confirmarYBorrar() {
    const idElem = document.getElementById('ver-id');
    const id = idElem ? idElem.value : null;
    if (!id) return;

    pedirConfirmacion(
        "¿Borrar esta joyita?", 
        "Se eliminará para siempre del mapa y no podrás recuperarla.", 
        async () => {
            try {
                const respuesta = await fetch(`/api/joyas/${id}`, { method: 'DELETE' });
                if (respuesta.ok) {
                    if (typeof cargar === 'function') await cargar();
                    mostrarToast("🗑️ Joyita eliminada correctamente");
                    navegar('main-view');
                } else {
                    mostrarToast("❌ Error al intentar borrar la joya");
                }
            } catch (error) {
                console.error("Error al borrar:", error);
                mostrarToast("❌ Error de conexión al borrar");
            }
        },
        "SÍ, BORRAR"
    );
}

function confirmarLogout() {
    pedirConfirmacion(
        "¿Cerrar sesión?", 
        "Tendrás que volver a introducir tu nombre de usuario para entrar.", 
        () => {
            logout();
        },
        "SÍ, SALIR"
    );
}

// REGISTRO DE LA PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA lista y registrada con éxito', reg))
            .catch(err => console.error('Error al registrar la PWA', err));
    });
}