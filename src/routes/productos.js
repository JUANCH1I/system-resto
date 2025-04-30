import express from 'express'
import { pool } from '../config/db.js'

const productosRouter = express.Router()

// Listar productos con categoría
productosRouter.get('/', async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, c.nombre AS categoria
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.id
  `)
  res.json(result.rows)
})

productosRouter.get('/actives', async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, c.nombre AS categoria
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.active = $1
ORDER BY p.id
`,
    [true]
  )
  res.json(result.rows)
})

// Crear nuevo producto
productosRouter.post('/', async (req, res) => {
  const { nombre, precio, iva, categoria_id, imagen, iva_incluido, codigo } =
    req.body
  const result = await pool.query(
    'INSERT INTO productos (nombre, precio, iva, categoria_id, imagen, iva_incluido, codigo) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [nombre, precio, iva, categoria_id, imagen, iva_incluido, codigo]
  )
  res.status(201).json(result.rows[0])
})

productosRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  const result = await pool.query('DELETE FROM productos WHERE id = $1', [id])
  res.json(result.rows[0])
})

productosRouter.put('/:id', async (req, res) => {
  const { id } = req.params
  const { nombre, precio, iva, categoria_id, imagen, iva_incluido, active } =
    req.body
  console.log(id)
  console.log(req.body)
  const result = await pool.query(
    'UPDATE productos SET nombre = $1, precio = $2, iva = $3, categoria_id = $4, imagen = $5, iva_incluido = $6, active = $7 WHERE id = $8 RETURNING *',
    [nombre, precio, iva, categoria_id, imagen, iva_incluido, active, id]
  )

  console.log(result.rows[0])
  res.json(result.rows[0])
})

export default productosRouter
