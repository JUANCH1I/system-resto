// src/sri/enviarSri.js
import axios from 'axios'
import { parseStringPromise } from 'xml2js'

export async function enviarComprobanteRecepcion(xmlFirmado) {
  try {
    const soapEnvelope = `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <ns2:validarComprobante xmlns:ns2="http://ec.gob.sri.ws.recepcion">
          <xml>${Buffer.from(xmlFirmado).toString('base64')}</xml>
        </ns2:validarComprobante>
      </soap:Body>
    </soap:Envelope>
  `

    const response = await axios.post(
      process.env.URL_PRODUCCION_RECEPCION,
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          SOAPAction: '',
        },
      }
    )

    const parsed = await parseStringPromise(response.data)

    const estado =
      parsed['soap:Envelope']['soap:Body'][0][
        'ns2:validarComprobanteResponse'
      ][0]['RespuestaRecepcionComprobante'][0]['estado'][0]

    return {
      estado, // 'RECIBIDA' o 'DEVUELTA'
      raw: parsed,
    }
  } catch (error) {
    console.error(
      '❌ Error al enviar al SRI:',
      error.response?.data || error.message
    )
    throw error
  }
}
