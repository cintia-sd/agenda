// ─────────────────────────────────────────────────────────────
// Módulos requeridos
// ─────────────────────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const port = 3000;

// Configurar destino y nombre de archivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });




// ─────────────────────────────────────────────────────────────
// Configuración de la base de datos (MAMP)
// ─────────────────────────────────────────────────────────────
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'agenda',
  port: 3306,
  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

// ─────────────────────────────────────────────────────────────
// Conexión a la base de datos MySQL
// ─────────────────────────────────────────────────────────────
db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('✅ Conexión a la base de datos establecida');
});

// ─────────────────────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));







// ─────────────────────────────────────────────────────────────
// Agregar un nuevo contacto
// ─────────────────────────────────────────────────────────────
app.post('/api/contactos', upload.single('avatar'), (req, res) => {
  const { nombre, apellidos, direccion, telefono, tipo } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : null;

  console.log('📦 Datos recibidos:', req.body);
  console.log('🖼️ Archivo recibido:', req.file);
  

  if (!nombre || !apellidos || !direccion || !telefono || !tipo) {
    return res
      .status(400)
      .json({ error: '❗ Todos los campos son obligatorios' });
  }

  const sql = `
    INSERT INTO contactos (nombre, apellidos, direccion, telefono, tipo, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [nombre, apellidos, direccion, telefono, tipo, avatar];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error al insertar contacto:', err.sqlMessage || err.message);
      return res.status(500).json({ error: '❌ Error al guardar el contacto', detalles: err.sqlMessage || err.message });
    }

    res.status(201).json({
      mensaje: '¡El contacto ha sido creado! ☺️',
      id: result.insertId,
      nombre,
      apellidos,
      direccion,
      telefono,
      tipo,
      avatar
    });
    
  });
});


// ─────────────────────────────────────────────────────────────
// Obtener todos los contactos
// ─────────────────────────────────────────────────────────────
app.get('/api/contactos', (req, res) => {
  console.log('Endpoint /api/contactos alcanzado');

  const query = 'SELECT * FROM contactos';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener los contactos:', err);
      return res.status(500).json({ message: 'Error al obtener los contactos', error: err });
    }

    console.log('Contactos:', results);
    res.status(200).json(results);
  });
});

// ─────────────────────────────────────────────────────────────
// Filtrar contactos
// ─────────────────────────────────────────────────────────────
app.get('/buscar', (req, res) => {
  const termino = req.query.termino;

  if (termino.length < 3) {
    return res.json([]);
  }

  const consulta = `SELECT * FROM contactos 
WHERE nombre LIKE ? OR telefono LIKE ? OR apellidos LIKE ?
ORDER BY apellidos ASC`;
  const valor = `%${termino}%`;

  db.query(consulta, [valor, valor, valor], (err, resultados) => {
    if (err) {
      console.error('Error en la búsqueda:', err);  // <-- imprime TODO el error
      return res.status(500).json({ error: 'Error en el servidor', detalle: err.sqlMessage || err.message || err });
    }
    console.log('Resultados:', resultados);
    res.json(resultados);
  });
});


// ─────────────────────────────────────────────────────────────
// Editar contacto
// ─────────────────────────────────────────────────────────────
app.put('/editar-contacto/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellidos, telefono, direccion, tipo } = req.body;

  console.log('📦 Datos recibidos para editar:', req.body);

  if (!nombre || !apellidos || !telefono || !direccion || !tipo) {
    return res.status(400).json({ error: '❗ Todos los campos son obligatorios' });
  }

  const sql = `
    UPDATE contactos
    SET nombre = ?, apellidos = ?, telefono = ?, direccion = ?, tipo = ?
    WHERE id = ?
  `;
  const values = [nombre, apellidos, telefono, direccion, tipo, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error al editar contacto:', err.sqlMessage || err.message);
      return res.status(500).json({ error: '❌ Error al editar el contacto', detalles: err.sqlMessage || err.message });
    }

    res.status(200).json({
      mensaje: '✅ Contacto editado correctamente',
      id,
      nombre,
      apellidos,
      telefono,
      direccion,
      tipo
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Eliminar un contacto
// ─────────────────────────────────────────────────────────────
app.delete('/api/contactos/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM contactos WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar contacto:', err.sqlMessage || err.message);
      return res.status(500).json({ mensaje: '❌ Error al eliminar contacto', error: err.sqlMessage || err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: '❗ No se encontró el contacto a eliminar' });
    }

    res.status(200).json({ mensaje: '✅ Contacto eliminado correctamente' });
  });
});

// ─────────────────────────────────────────────────────────────
// Iniciar la ventana modal de detalles de contacto
// ─────────────────────────────────────────────────────────────

app.get('/api/contacto/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM contactos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('Contacto no encontrado');
    res.json(results[0]);
  });
});


// ─────────────────────────────────────────────────────────────
// Subir imagen de contacto
// ─────────────────────────────────────────────────────────────
app.post('/api/subir-imagen/:id', upload.single('avatar'), (req, res) => {
  const contactId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ error: '❗ No se ha subido ninguna imagen' });
  }

  const imagePath = `/uploads/${req.file.filename}`;


  db.query('UPDATE contactos SET avatar = ? WHERE id = ?', [imagePath, contactId], (err) => {
    if (err) {
      console.error('❌ Error al actualizar imagen:', err);
      return res.status(500).json({ error: 'Error al guardar la imagen' });
    }

    res.json({ mensaje: 'Imagen subida correctamente', rutaImagen: imagePath });
  });
});

// ─────────────────────────────────────────────────────────────
// Eliminar imagen del modal
// ─────────────────────────────────────────────────────────────

app.post('/api/eliminar-imagen/:id', (req, res) => {
  const contactId = req.params.id;
  const defaultAvatar = '/uploads/default-avatar.png';

  db.query('UPDATE contactos SET avatar = ? WHERE id = ?', [defaultAvatar, contactId], (err) => {
    if (err) {
      console.error('❌ Error al eliminar imagen:', err);
      return res.status(500).json({ error: 'Error al eliminar la imagen' });
    }

    res.json({ mensaje: 'Imagen eliminada correctamente', rutaImagen: defaultAvatar });
  });
});


// ─────────────────────────────────────────────────────────────
// Exportar contactos a Excel
// ─────────────────────────────────────────────────────────────

app.get('/api/contactos/export', (req, res) => {
  // 1. Consulta los contactos de la base de datos
  db.query('SELECT nombre, apellidos, direccion, telefono, tipo FROM contactos', (err, results) => {
    if (err) {
      console.error('Error al obtener contactos para export:', err);
      return res.status(500).json({ error: 'Error interno al exportar' });
    }

    // 2. Crea una hoja de cálculo a partir del array de objetos
    const worksheet = XLSX.utils.json_to_sheet(results.map(c => ({
      Nombre: c.nombre,
      Apellidos: c.apellidos,
      Dirección: c.direccion,
      Teléfono: c.telefono,
      Tipo: c.tipo == 1 ? 'Personal' : 'Empresa'
    })));

    // 3. Crea un libro y añade la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contactos');

    // 4. Genera un buffer con el contenido XLSX
    const buffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer' 
    });

    // 5. Envía el fichero con cabeceras adecuadas
    res.setHeader('Content-Disposition', 'attachment; filename="contactos.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  });
});

// ─────────────────────────────────────────────────────────────
// Iniciar el servidor
// ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});