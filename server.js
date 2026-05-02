const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'joyas.json');

const leerJoyas = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '[]');
    } catch (e) { return []; }
};

const guardarJoyas = (data) => {
    try { 
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); 
    } catch (e) { console.error("Error en disco", e); }
};

// GET: Leer todas las joyas
app.get('/api/joyas', (req, res) => res.json(leerJoyas()));

// POST: Nueva Joya
app.post('/api/joyas', (req, res) => {
    const joyas = leerJoyas();
    const nueva = req.body;
    nueva.id = String(Date.now());
    nueva.resenas = nueva.resenas || []; 
    joyas.unshift(nueva); 
    guardarJoyas(joyas);
    res.json({ success: true });
});

// POST: Añadir Reseña (LA CLAVE)
// POST: Añadir Reseña (CON DIAGNÓSTICO)
app.post('/api/joyas/:id/resena', (req, res) => {
    console.log("--> Petición de reseña recibida para ID:", req.params.id);
    console.log("--> Datos recibidos en el body:", req.body);

    let joyas = leerJoyas();
    
    // Convertimos ambos a String y les quitamos los espacios en blanco
    const idBuscado = String(req.params.id).trim();
    const idx = joyas.findIndex(j => String(j.id).trim() === idBuscado);
    
    if (idx !== -1) {
        const nuevaResena = {
            autor: req.body.autor || "Anónimo",
            texto: req.body.texto,
            fecha: req.body.fecha || new Date().toISOString()
        };
        
        if (!joyas[idx].resenas) joyas[idx].resenas = [];
        joyas[idx].resenas.push(nuevaResena);
        
        guardarJoyas(joyas);
        console.log("✅ Reseña guardada con éxito en joyas.json");
        res.json(joyas[idx]); 
    } else { 
        console.error("❌ Error: No se encontró la joya con ID:", idBuscado);
        res.status(404).json({ error: "Joya no encontrada" }); 
    }
});
// DELETE: Borrar joya
app.delete('/api/joyas/:id', (req, res) => {
    const filtradas = leerJoyas().filter(j => String(j.id) !== String(req.params.id));
    guardarJoyas(filtradas);
    res.json({ success: true });
});
// POST: Sumar una visualización
app.post('/api/joyas/:id/vista', (req, res) => {
    let joyas = leerJoyas();
    const idx = joyas.findIndex(j => String(j.id) === String(req.params.id));
    
    if (idx !== -1) {
        // Si la propiedad 'vistas' no existe, la inicializamos a 0
        if (typeof joyas[idx].vistas === 'undefined') {
            joyas[idx].vistas = 0;
        }
        
        // Sumamos 1 visualización
        joyas[idx].vistas += 1;
        
        guardarJoyas(joyas);
        res.json(joyas[idx]); // Devolvemos la joya actualizada al frontend
    } else { 
        res.status(404).json({ error: "Joya no encontrada" }); 
    }
});
app.listen(3000, '0.0.0.0', () => console.log("🚀 Servidor limpio en puerto 3000"));