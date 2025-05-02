// ─────────────────────────────────────────────────────────────
// Módulos requeridos
// ─────────────────────────────────────────────────────────────
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3000;

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

// ─────────────────────────────────────────────────────────────
// Agregar un nuevo contacto
// ─────────────────────────────────────────────────────────────
app.post('/api/contactos', (req, res) => {
  const { nombre, apellidos, direccion, telefono, tipo } = req.body;
  console.log('📦 Datos recibidos:', req.body);

  if (!nombre || !apellidos || !direccion || !telefono || !tipo) {
    return res.status(400).json({ error: '❗ Todos los campos son obligatorios' });
  }

  const sql = `
    INSERT INTO contactos (nombre, apellidos, direccion, telefono, tipo)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [nombre, apellidos, direccion, telefono, tipo];

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
      tipo
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
// Iniciar el servidor
// ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});
