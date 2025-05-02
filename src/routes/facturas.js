import express from 'express'
import { pool } from '../config/db.js'
import { generarFactura } from '../sri/main.js'
import { autorizarComprobante } from '../sri/autorizarSri.js'
import { enviarComprobanteRecepcion } from '../sri/enviarComprobanteRecepcion.js'
import path from 'path'
import fs from 'fs'

const facturasRouter = express.Router()

async function obtenerProximoSecuencial(client, ambiente, estab, ptoEmi) {
  const res = await client.query(
    `SELECT ultimo_secuencial FROM secuenciales WHERE ambiente = $1 AND establecimiento = $2 AND punto_emision = $3`,
    [ambiente, estab, ptoEmi]
  )

  let nuevoSecuencial = 1
  if (res.rowCount > 0) {
    nuevoSecuencial = res.rows[0].ultimo_secuencial + 1
    await client.query(
      `UPDATE secuenciales SET ultimo_secuencial = $1 WHERE ambiente = $2 AND establecimiento = $3 AND punto_emision = $4`,
      [nuevoSecuencial, ambiente, estab, ptoEmi]
    )
  } else {
    await client.query(
      `INSERT INTO secuenciales (ambiente, establecimiento, punto_emision, ultimo_secuencial) VALUES ($1, $2, $3, $4)`,
      [ambiente, estab, ptoEmi, nuevoSecuencial]
    )
  }

  return nuevoSecuencial
}

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
    datosFactura,
  } = req.body

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Generar factura XML firmada
    const facturaXmlFirmada = await generarFactura(datosFactura)

    // 2. Guardar XML temporalmente (opcional)
    const tempPath = path.join(
      process.cwd(),
      'facturas_xml',
      `temp-${Date.now()}.xml`
    )
    fs.writeFileSync(tempPath, facturaXmlFirmada, 'utf-8')

    // 3. Enviar a SRI (recepción)
    const respuestaSri = await enviarComprobanteRecepcion(facturaXmlFirmada)
    console.log('respuestaSri:', respuestaSri.estado)

    if (respuestaSri.estado !== 'RECIBIDA') {
      console.error(
        '❌ Error en recepción:',
        JSON.stringify(respuestaSri.raw, null, 2)
      )
      throw new Error(
        'El SRI no aceptó la factura (estado diferente a RECIBIDA)'
      )
    }

    // 4. Autorizar comprobante
    const resultadoAutorizacion = await autorizarComprobante(
      datosFactura.emisor.claveAcceso
    )
    console.log('Autorización:', resultadoAutorizacion.estado)

    // 5. Insertar en la base de datos solo si pasó la validación
    const estadoFinal =
      resultadoAutorizacion.estado === 'AUTORIZADO'
        ? 'autorizado'
        : 'no_autorizado'

    const insertResult = await client.query(
      `
        INSERT INTO facturas (
          comanda_id, cliente_id, subtotal, iva, servicio, propina, total,
          metodo_pago, caja_id, estado_sri, clave_acceso, auth
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *
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
        estadoFinal,
        resultadoAutorizacion.claveAccesoConsultada,
        resultadoAutorizacion.numeroAutorizacion,
      ]
    )

    const facturaDb = insertResult.rows[0]

    // 6. Guardar XML firmado definitivo con ID
    const outputPath = path.join(
      process.cwd(),
      'facturas_xml',
      `factura-${facturaDb.id}.xml`
    )
    fs.writeFileSync(outputPath, facturaXmlFirmada, 'utf-8')

    // 7. Marcar comanda como cerrada
    await client.query(`UPDATE comandas SET estado = 'cerrada' WHERE id = $1`, [
      comanda_id,
    ])

    // 8. Liberar mesa
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
    console.error('❌ Error al crear factura:', error)
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
