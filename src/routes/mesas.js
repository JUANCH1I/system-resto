import express from 'express'
import { pool } from '../config/db.js'

const mesasRouter = express.Router()

// Obtener todas las mesas
mesasRouter.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM mesas ORDER BY id')
  res.json(result.rows)
})

// Obtener la comanda activa de una mesa
mesasRouter.get('/:id/comanda-activa', async (req, res) => {
  const { id } = req.params
  const result = await pool.query(
    `
    SELECT c.id FROM comandas c
    WHERE c.mesa_id = $1 AND c.estado IN ('pendiente', 'servida')
    ORDER BY c.id DESC LIMIT 1
  `,
    [id]
  )

  if (result.rows.length > 0) {
    res.json({ comanda_id: result.rows[0].id })
  } else {
    res.status(404).json({ error: 'No hay comanda activa' })
  }
})

// Crear nueva mesa
mesasRouter.post('/', async (req, res) => {
  const { nombre, sector } = req.body
  const result = await pool.query(
    'INSERT INTO mesas (nombre, sector, estado) VALUES ($1, $2, $3) RETURNING *',
    [nombre, sector, 'libre']
  )
  res.status(201).json(result.rows[0])
})

// Cambiar estado de mesa
mesasRouter.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body
  const { id } = req.params
  const result = await pool.query(
    'UPDATE mesas SET estado = $1 WHERE id = $2 RETURNING *',
    [estado, id]
  )
  res.json(result.rows[0])
})

mesasRouter.put('/:id', async (req, res) => {
  const { id } = req.params
  const { nombre, sector } = req.body
  const result = await pool.query(
    'UPDATE mesas SET nombre = $1, sector = $2,  WHERE id = $3 RETURNING *',
    [nombre, sector, id]
  )
  res.json(result.rows[0])
})

mesasRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  const result = await pool.query('DELETE FROM mesas WHERE id = $1', [id])
  res.json(result.rows[0])
})

export default mesasRouter
