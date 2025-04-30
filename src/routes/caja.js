import { pool } from '../config/db.js'
import express from 'express'

const cajasRouter = express.Router()

cajasRouter.post('/abrir', async (req, res) => {
  const { usuario_id, monto_inicial, observaciones } = req.body
  try {
    const cajaAbierta = await pool.query(
      'SELECT * FROM cajas WHERE estado = $1',
      ['abierta']
    )
    if (cajaAbierta.rows.length > 0) {
      return res.status(400).json({ error: 'Ya hay una caja abierta.' })
    }

    console.log(usuario_id, monto_inicial, observaciones)
    const result = await pool.query(
      'INSERT INTO cajas (usuario_id, monto_inicial, observaciones) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, monto_inicial, observaciones || '']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al abrir caja' })
  }
})

// Endpoint para cerrar caja
cajasRouter.post('/cerrar', async (req, res) => {
  const { observaciones } = req.body

  try {
    // Buscar la caja abierta más reciente
    const caja = await pool.query(
      'SELECT * FROM cajas WHERE estado = $1 ORDER BY id DESC LIMIT 1',
      ['abierta']
    )

    if (caja.rows.length === 0) {
      return res.status(400).json({ error: 'No hay caja abierta' })
    }

    const cajaId = caja.rows[0].id
    const montoInicial = parseFloat(caja.rows[0].monto_inicial) || 0

    // Sumar TODAS las ventas (no solo efectivo)
    const ventas = await pool.query(
      `SELECT 
         COALESCE(SUM(total), 0) AS total_facturado
       FROM facturas
       WHERE caja_id = $1
         AND estado_sri = 'no_autorizado'`,
      [cajaId]
    )

    const totalFacturado = parseFloat(ventas.rows[0].total_facturado) || 0

    // Calcular monto final = monto_inicial + todas las ventas
    const montoFinal = montoInicial + totalFacturado

    // Cerrar la caja
    const result = await pool.query(
      'UPDATE cajas SET estado = $1, fecha_cierre = NOW(), monto_final = $2, observaciones = $3 WHERE id = $4 RETURNING *',
      ['cerrada', montoFinal, observaciones || '', cajaId]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error('Error al cerrar caja:', err)
    res.status(500).json({ error: 'Error al cerrar caja' })
  }
})

cajasRouter.get('/abierta/:id', async (req, res) => {
  const { id } = req.params
  const result = await pool.query(
    'SELECT * FROM cajas WHERE usuario_id = $1 AND estado = $2',
    [id, 'abierta']
  )
  console.log(id)
  console.log(result.rows[0])
  res.json(result.rows[0])
})

cajasRouter.get('/abierta', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cajas WHERE estado = $1 ORDER BY id DESC LIMIT 1',
      ['abierta']
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No hay caja abierta' })
    }

    const caja = result.rows[0]

    const ventas = await pool.query(
      `SELECT 
         COALESCE(SUM(total), 0) AS total,
         COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END), 0) AS efectivo,
         COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END), 0) AS tarjeta,
         COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END), 0) AS transferencia
       FROM facturas
       WHERE caja_id = $1
         AND estado_sri = 'no_autorizado'`,
      [caja.id]
    )

    res.json({
      ...caja,
      ventas: ventas.rows[0],
    })
  } catch (error) {
    console.error('Error al obtener caja abierta:', error)
    res.status(500).json({ error: 'Error al obtener caja abierta' })
  }
})

cajasRouter.get('/historial/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params

  try {
    const result = await pool.query(
      `SELECT * FROM cajas 
       WHERE usuario_id = $1 
       ORDER BY fecha_apertura DESC`,
      [usuario_id]
    )

    res.json(result.rows)
  } catch (err) {
    console.error('Error al obtener historial de cajas:', err)
    res.status(500).json({ error: 'Error al obtener historial de cajas' })
  }
})

export default cajasRouter
