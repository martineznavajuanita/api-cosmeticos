const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// 1. OBTENER TODOS LOS COSMÉTICOS
app.get('/api/cosmeticos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los cosméticos' });
  }
});

// 2. OBTENER UN COSMÉTICO POR ID
app.get('/api/cosmeticos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar el producto' });
  }
});

// 3. REGISTRAR UN NUEVO COSMÉTICO
app.post('/api/cosmeticos', async (req, res) => {
  const { nombre, marca, categoria, precio, stock, descripcion } = req.body;
  try {
    const query = `
      INSERT INTO productos (nombre, marca, categoria, precio, stock, descripcion)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [nombre, marca, categoria, precio, stock, descripcion];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el cosmético' });
  }
});

// 4. ACTUALIZAR UN COSMÉTICO
app.put('/api/cosmeticos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, marca, categoria, precio, stock, descripcion } = req.body;
  try {
    const query = `
      UPDATE productos 
      SET nombre = $1, marca = $2, categoria = $3, precio = $4, stock = $5, descripcion = $6
      WHERE id = $7 RETURNING *
    `;
    const values = [nombre, marca, categoria, precio, stock, descripcion, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// 5. ELIMINAR UN COSMÉTICO
app.delete('/api/cosmeticos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Cosmético eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API de Cosméticos corriendo en http://localhost:${PORT}`);
});