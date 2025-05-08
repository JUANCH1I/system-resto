import express from 'express'
import { pool } from '../config/db.js'

const comandasRouter = express.Router()

// Crear nueva comanda
comandasRouter.post('/', async (req, res) => {
  const { mesa_id, usuario_id, productos, con_servicio = true } = req.body
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Validar que todos los productos existen
    const ids = productos.map((p) => p.producto_id)
    const result = await client.query(
      'SELECT id FROM productos WHERE id = ANY($1)',
      [ids]
    )
    const existentes = result.rows.map((r) => r.id)
    const faltantes = ids.filter((id) => !existentes.includes(id))

    if (faltantes.length > 0) {
      await client.query('ROLLBACK')
      return res
        .status(400)
        .json({ error: `Productos no válidos: ${faltantes.join(', ')}` })
    }

    // Crear comanda
    const comandaResult = await client.query(
      'INSERT INTO comandas (mesa_id, usuario_id, estado, con_servicio) VALUES ($1, $2, $3, $4) RETURNING *',
      [mesa_id, usuario_id, 'pendiente', con_servicio]
    )

    const comanda = comandaResult.rows[0]

    // Insertar productos
    for (const item of productos) {
      await client.query(
        `INSERT INTO comanda_detalle (comanda_id, producto_id, cantidad, comentario, descuento, precio_unitario, codigo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          comanda.id,
          item.producto_id,
          item.cantidad,
          item.comentario || '',
          item.descuento || 0,
          item.precio_unitario,
          item.codigo,
        ]
      )
    }

    // Cambiar estado de la mesa
    await client.query(
      'UPDATE mesas SET estado = $1, orden_actual_id = $2 WHERE id = $3',
      ['ocupada', comanda.id, mesa_id]
    )

    await client.query('COMMIT')
    res.status(201).json({ comanda_id: comanda.id })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error al crear comanda:', err)
    res.status(500).json({ error: 'Error al crear la comanda' })
  } finally {
    client.release()
  }
})

// En `routes/comandas.js`
comandasRouter.put('/:id', async (req, res) => {
  const { id } = req.params
  const { productos, con_servicio } = req.body

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Validar que los producto_id existen
    const ids = productos.map((p) => p.producto_id)
    const result = await client.query(
      'SELECT id FROM productos WHERE id = ANY($1)',
      [ids]
    )
    const existentes = result.rows.map((r) => r.id)

    const faltantes = ids.filter((id) => !existentes.includes(id))
    if (faltantes.length > 0) {
      await client.query('ROLLBACK')
      return res
        .status(400)
        .json({ error: `Productos no encontrados: ${faltantes.join(', ')}` })
    }

    // Eliminar los productos actuales de la comanda
    await client.query('DELETE FROM comanda_detalle WHERE comanda_id = $1', [
      id,
    ])

    // Insertar los nuevos
    for (const item of productos) {
      await client.query(
        `INSERT INTO comanda_detalle (comanda_id, producto_id, cantidad, comentario, descuento, precio_unitario, codigo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id,
          item.producto_id,
          item.cantidad,
          item.comentario,
          item.descuento,
          item.precio_unitario,
          item.codigo,
        ]
      )
    }

    if (typeof con_servicio === 'boolean') {
      await client.query(
        'UPDATE comandas SET con_servicio = $1 WHERE id = $2',
        [con_servicio, id]
      )
    }

    await client.query('COMMIT')
    res.json({ mensaje: 'Comanda actualizada' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error al actualizar comanda:', err)
    res.status(500).json({ error: 'Error al actualizar la comanda' })
  } finally {
    client.release()
  }
})

comandasRouter.patch('/:id/cerrar', async (req, res) => {
  const { id } = req.params

  await pool.query('UPDATE comandas SET estado = $1 WHERE id = $2', [
    'cerrada',
    id,
  ])

  await pool.query(
    `
    UPDATE mesas SET estado = 'libre', orden_actual_id = NULL
    WHERE id = (SELECT mesa_id FROM comandas WHERE id = $1)
  `,
    [id]
  )

  res.json({ mensaje: 'Comanda cerrada y mesa liberada' })
})

// Obtener detalles de una comanda
comandasRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  const comanda = await pool.query('SELECT * FROM comandas WHERE id = $1', [id])
  const detalles = await pool.query(
    `SELECT cd.*, p.nombre 
     FROM comanda_detalle cd 
     JOIN productos p ON cd.producto_id = p.id 
     WHERE comanda_id = $1`,
    [id]
  )

  res.json({
    comanda: comanda.rows[0],
    productos: detalles.rows,
  })
})

export default comandasRouter
