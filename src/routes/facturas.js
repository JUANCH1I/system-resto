import express from 'express'
import { pool } from '../config/db.js'
import { generarFactura } from '../sri/main.js'
import { autorizarComprobante } from '../sri/autorizarSri.js'
import { enviarComprobanteRecepcion } from '../sri/enviarComprobanteRecepcion.js'
import path from 'path'
import fs from 'fs'

const facturasRouter = express.Router()

facturasRouter.post('/', async (req, res) => {
  const {
    comanda_id,
    cliente_id,
    subtotal,
    iva,
    servicio,
    propina,
    total,
    metodo_pago,
    caja_id,
    datosFactura, // Agregamos datosFactura para construir el XML
  } = req.body

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `
      INSERT INTO facturas (
        comanda_id, cliente_id, subtotal, iva, servicio, propina, total, metodo_pago, caja_id, estado_sri
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9,'pendiente') RETURNING *
    `,
      [
        comanda_id,
        cliente_id,
        subtotal,
        iva,
        servicio,
        propina,
        total,
        metodo_pago,
        caja_id,
      ]
    )

    const facturaDb = result.rows[0]

    console.log('datosFactura', datosFactura)
    // 🔥 Nueva parte: generar XML de la factura
    const facturaXmlFirmada = await generarFactura(datosFactura)

    // 🔥 Opcional: guardar el XML en disco temporalmente
    const outputPath = path.join(
      process.cwd(),
      'facturas_xml',
      `factura-${facturaDb.id}.xml`
    )
    fs.writeFileSync(outputPath, facturaXmlFirmada, 'utf-8')

    // 🔥 Más adelante: enviar al SRI desde aquí
    const respuestaSri = await enviarComprobanteRecepcion(facturaXmlFirmada)
    console.log('respuestaSri', respuestaSri)
    console.log(
      JSON.stringify(respuestaSri.raw['soap:Envelope']['soap:Body'], null, 2)
    )

    if (respuestaSri.estado === 'RECIBIDA') {
      console.log('✅ Factura recibida en el SRI')

      // Ahora intentar autorizar
      const resultadoAutorizacion = await autorizarComprobante(
        datosFactura.emisor.claveAcceso
      )
      console.log(JSON.stringify(resultadoAutorizacion, null, 2))

      if (resultadoAutorizacion.estado === 'AUTORIZADO') {
        console.log('✅ Factura AUTORIZADA')

        await client.query(
          `UPDATE facturas SET estado_sri = 'autorizado' WHERE id = $1`,
          [facturaDb.id]
        )
      } else {
        console.log('❌ Factura NO AUTORIZADA')

        await client.query(
          `UPDATE facturas SET estado_sri = 'no_autorizado' WHERE id = $1`,
          [facturaDb.id]
        )
      }
    }

    // 🔥 Marcar comanda y mesa
    await client.query(`UPDATE comandas SET estado = 'cerrada' WHERE id = $1`, [
      comanda_id,
    ])

    await client.query(
      `
      UPDATE mesas 
      SET estado = 'libre', orden_actual_id = NULL
      WHERE id = (SELECT mesa_id FROM comandas WHERE id = $1)
    `,
      [comanda_id]
    )

    await client.query('COMMIT')

    res.status(201).json({ factura_id: facturaDb.id })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al crear factura:', error)
    res.status(500).json({ error: 'Error al crear factura' })
  } finally {
    client.release()
  }
})

facturasRouter.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT *,f.id, c.cedula_ruc FROM facturas f JOIN clientes c ON f.cliente_id = c.id ORDER BY f.fecha DESC'
  )
  res.json(result.rows)
})

export default facturasRouter
