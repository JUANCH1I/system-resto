import { Router } from 'express'
import { pool } from '../config/db.js' // ajusta según cómo importás pool en tu proyecto

const reportesRouter = Router()

// 📦 Reporte resumen de ventas
reportesRouter.get('/ventas', async (req, res) => {
  try {
    const { desde, hasta } = req.query

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Faltan fechas' })
    }

    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(total), 0) AS total,
        COALESCE(SUM(iva), 0) AS iva,
        COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END), 0) AS efectivo,
        COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END), 0) AS tarjeta,
        COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END), 0) AS transferencia
      FROM facturas
      WHERE fecha BETWEEN $1 AND $2
        AND estado_sri = 'pendiente'`, // (opcional: solo facturas autorizadas)
      [desde, hasta]
    )
    console.log(result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error en /reportes/ventas:', error)
    res.status(500).json({ error: 'Error al obtener resumen de ventas' })
  }
})

// 📦 Reporte productos más vendidos
reportesRouter.get('/productos-mas-vendidos', async (req, res) => {
  try {
    const { desde, hasta } = req.query

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Faltan fechas' })
    }

    const result = await pool.query(
      `SELECT 
        p.id, 
        p.nombre, 
        SUM(dp.cantidad) AS cantidad
      FROM detalle_factura dp
      JOIN productos p ON dp.producto_id = p.id
      JOIN facturas f ON dp.factura_id = f.id
      WHERE f.fecha_emision BETWEEN $1 AND $2
        AND f.estado = 'AUTORIZADO'
      GROUP BY p.id, p.nombre
      ORDER BY cantidad DESC
      LIMIT 10`,
      [desde, hasta]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error en /reportes/productos-mas-vendidos:', error)
    res.status(500).json({ error: 'Error al obtener productos más vendidos' })
  }
})

export default reportesRouter
