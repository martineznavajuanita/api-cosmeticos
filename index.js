require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configuración de conexión a la base de datos PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('API de Cosméticos funcionando correctamente');
});

// Ruta para obtener todos los productos
app.get('/api/cosmeticos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cosmeticos');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
    res.status(500).json({ error: 'Error al obtener los cosméticos' });
  }
});

// Ruta para obtener un producto por ID
app.get('/api/cosmeticos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cosmeticos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});