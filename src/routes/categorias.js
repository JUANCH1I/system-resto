import express from 'express'
import { pool } from '../config/db.js'

const categoriasRouter = express.Router()

// Listar todas las categorías
categoriasRouter.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM categorias ORDER BY id')
  res.json(result.rows)
})

// Crear una nueva categoría
categoriasRouter.post('/', async (req, res) => {
  const { nombre } = req.body
  const result = await pool.query(
    'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
    [nombre]
  )
  res.status(201).json(result.rows[0])
})

categoriasRouter.put('/:id', async (req, res) => {
  const { id } = req.params
  const { nombre } = req.body
  const result = await pool.query(
    'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *',
    [nombre, id]
  )
  res.json(result.rows[0])
})

categoriasRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  const result = await pool.query('DELETE FROM categorias WHERE id = $1', [id])
  res.json(result.rows[0])
})

export default categoriasRouter
