import express from 'express'
import { pool } from '../config/db.js'
import { generarFactura } from '../sri/main.js'
import { autorizarComprobante } from '../sri/autorizarSri.js'
import { enviarComprobanteRecepcion } from '../sri/enviarComprobanteRecepcion.js'
import path from 'path'
import fs from 'fs'

const facturasRouter = express.Router()

function generarClaveAcceso({
  fecha,
  tipoComprobante = '01',
  ruc,
  ambiente = '1',
  estab = '001',
  ptoEmi = '001',
  secuencial = '1',
  codigoNumerico= Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
  tipoEmision = '1',
}) {
  const fechaObj = new Date()
  const dia = fechaObj.getDate().toString().padStart(2, '0')
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0')
  const anio = fechaObj.getFullYear()
  console.log('fechaObj:', fechaObj)
  const fechaStr = `${dia}${mes}${anio}`

  const serie = estab.padStart(3, '0') + ptoEmi.padStart(3, '0')
  const secuencialStr = secuencial.toString().padStart(9, '0')
  const codigoNumericoStr = codigoNumerico.toString().padStart(8, '0')

  const base = `${fechaStr}${tipoComprobante}${ruc}${ambiente}${serie}${secuencialStr}${codigoNumericoStr}${tipoEmision}`
  if (base.length !== 48) {
    throw new Error(`Clave base incorrecta: tiene ${base.length} caracteres`)
  }
  const digitoVerificador = calcularModulo11(base)
  console.log('digitoVerificador', digitoVerificador)

  return base + digitoVerificador
}

function calcularModulo11(numero) {
  const pesos = [2, 3, 4, 5, 6, 7]
  let suma = 0
  let pesoIndex = 0

  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero[i], 10) * pesos[pesoIndex]
    pesoIndex = (pesoIndex + 1) % pesos.length
  }

  const residuo = suma % 11
  if (residuo === 0) return '0'

  const resultado = 11 - residuo
  if (resultado === 10) return '1'
  if (resultado === 11) return '0'

  return resultado.toString()
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

    const estab = '001'
    const pto_emi = '001'

    // Buscar último secuencial
    const { rows } = await client.query(
      `SELECT secuencial FROM facturas 
       WHERE estab = $1 AND pto_emi = $2 
       ORDER BY secuencial DESC 
       LIMIT 1`,
      [estab, pto_emi]
    )

    let nuevoSecuencial = '000000001'
    if (rows.length > 0 && rows[0].secuencial) {
      const ultimo = parseInt(rows[0].secuencial, 10)
      nuevoSecuencial = (ultimo + 1).toString().padStart(9, '0')
    }

    // Inyectar estab, pto_emi y secuencial a datosFactura
    datosFactura.valores.secuencial = nuevoSecuencial
    datosFactura.emisor.estab = estab
    datosFactura.emisor.ptoEmi = pto_emi

    // Regenerar clave de acceso con secuencial correcto
    datosFactura.emisor.claveAcceso = generarClaveAcceso({
      fecha: datosFactura.valores.fechaEmision,
      tipoComprobante: '01',
      ruc: datosFactura.emisor.ruc,
      ambiente: datosFactura.emisor.ambiente,
      estab,
      ptoEmi: pto_emi,
      secuencial: nuevoSecuencial,
      codigoNumerico: '12345678', // o uno generado aleatoriamente
      tipoEmision: datosFactura.emisor.tipoEmision,
    })

    // Generar factura XML firmada
    const facturaXmlFirmada = await generarFactura(datosFactura)

    // Guardar XML temporalmente
    const tempPath = path.join(
      process.cwd(),
      'facturas_xml',
      `temp-${Date.now()}.xml`
    )
    fs.writeFileSync(tempPath, facturaXmlFirmada, 'utf-8')

    // Enviar a SRI (recepción)
    const respuestaSri = await enviarComprobanteRecepcion(facturaXmlFirmada)
    console.log('respuestaSri:', respuestaSri.estado)

    if (respuestaSri.estado !== 'RECIBIDA') {
      console.error('❌ Error en recepción:', JSON.stringify(respuestaSri.raw, null, 2))
      throw new Error('El SRI no aceptó la factura (estado diferente a RECIBIDA)')
    }

    // Autorizar comprobante
    const resultado = await autorizarComprobante(datosFactura.emisor.claveAcceso, 5, 3000)
    console.log('Autorización:', resultado.estado)
    if (resultado.estado === 'AUTORIZADO') {
      console.log('✅ Autorización exitosa')
    }else{
    console.error('❌ Error en recepción:', JSON.stringify(resultado.raw, null, 2))}


    const estadoFinal =
      resultado.estado === 'AUTORIZADO' ? 'autorizado' : 'no_autorizado'

    // Guardar en base de datos
    const insertResult = await client.query(
      `
        INSERT INTO facturas (
          comanda_id, cliente_id, subtotal, iva, servicio, propina, total,
          metodo_pago, caja_id, estado_sri, clave_acceso, auth,
          estab, pto_emi, secuencial
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
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
        estab,
        pto_emi,
        nuevoSecuencial,
      ]
    )

    const facturaDb = insertResult.rows[0]

    // Guardar XML definitivo
    const outputPath = path.join(
      process.cwd(),
      'facturas_xml',
      `factura-${facturaDb.id}.xml`
    )
    fs.writeFileSync(outputPath, facturaXmlFirmada, 'utf-8')

    // Cerrar comanda
    await client.query(`UPDATE comandas SET estado = 'cerrada' WHERE id = $1`, [
      comanda_id,
    ])

    // Liberar mesa
    await client.query(
      `
        UPDATE mesas 
        SET estado = 'libre', orden_actual_id = NULL
        WHERE id = (SELECT mesa_id FROM comandas WHERE id = $1)
      `,
      [comanda_id]
    )

    await client.query('COMMIT')
    res.status(201).json({ factura_id: facturaDb.id, autorizacionSRI: resultadoAutorizacion.numeroAutorizacion })
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
