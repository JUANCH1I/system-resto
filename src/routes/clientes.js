import express from 'express'
import { pool } from '../config/db.js'

const clientesRouter = express.Router()

// Crear cliente (solo si es con datos)
clientesRouter.post('/', async (req, res) => {
  const { tipo, nombre, cedula_ruc, correo, telefono, direccion } = req.body

  // Buscar cliente existente
  const existente = await pool.query(
    'SELECT id FROM clientes WHERE cedula_ruc = $1',
    [cedula_ruc]
  )

  if (existente.rows.length > 0) {
    return res.status(200).json({ id: existente.rows[0].id })
  }

  // Crear nuevo
  const result = await pool.query(
    `
      INSERT INTO clientes (tipo, nombre, cedula_ruc, correo, telefono, direccion)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `,
    [tipo, nombre, cedula_ruc, correo, telefono, direccion]
  )

  res.status(201).json({ id: result.rows[0].id })
})

clientesRouter.get('/:cedula_ruc', async (req, res) => {
  const { cedula_ruc } = req.params
  const result = await pool.query(
    'SELECT * FROM clientes WHERE cedula_ruc = $1',
    [cedula_ruc]
  )
  if (result.rows.length > 0) {
    res.json(result.rows[0])
  } else {
    res.status(404).json({ error: 'No encontrado' })
  }
})

clientesRouter.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM clientes ORDER BY id')
  res.json(result.rows)
})

clientesRouter.get('/:id', async (req, res) => {
  const { id } = req.params
  const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id])
  res.json(result.rows[0])
})

clientesRouter.delete('/:id', async (req, res) => {
  const { id } = req.params
  const result = await pool.query('DELETE FROM clientes WHERE id = $1', [id])
  res.json(result.rows[0])
})

clientesRouter.put('/:id', async (req, res) => {
  const { id } = req.params
  const { nombre, cedula_ruc, correo, telefono, direccion } = req.body
  const result = await pool.query(
    'UPDATE clientes SET nombre = $1, cedula_ruc = $2, correo = $3, telefono = $4, direccion = $5 WHERE id = $6 RETURNING *',
    [nombre, cedula_ruc, correo, telefono, direccion, id]
  )
  res.json(result.rows[0])
})

export default clientesRouter
