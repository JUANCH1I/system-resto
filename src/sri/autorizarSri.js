import axios from 'axios'
import { parseStringPromise } from 'xml2js'

export async function autorizarComprobante(claveAcceso) {
  try {
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:aut="http://ec.gob.sri.ws.autorizacion">
        <soapenv:Header/>
        <soapenv:Body>
          <aut:autorizacionComprobante>
            <claveAccesoComprobante>${claveAcceso}</claveAccesoComprobante>
          </aut:autorizacionComprobante>
        </soapenv:Body>
      </soapenv:Envelope>
    `

    const response = await axios.post(
      process.env.URL_PRODUCCION_AUTORIZACION,
      soapBody,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          SOAPAction: '',
        },
      }
    )

    const parsed = await parseStringPromise(response.data)

    const respuesta =
      parsed['soap:Envelope']?.['soap:Body']?.[0]?.[
        'ns2:autorizacionComprobanteResponse'
      ]?.[0]?.['RespuestaAutorizacionComprobante']?.[0]

    if (!respuesta?.autorizaciones?.[0]?.autorizacion?.[0]) {
      throw new Error(
        'No se encontró una autorización en la respuesta del SRI.'
      )
    }

    const autorizacion = respuesta.autorizaciones[0].autorizacion[0]

    return {
      estado: autorizacion.estado?.[0] || null, // AUTORIZADO o NO AUTORIZADO
      numeroAutorizacion: autorizacion.numeroAutorizacion?.[0] || null,
      fechaAutorizacion: autorizacion.fechaAutorizacion?.[0] || null,
      xmlAutorizado: autorizacion.comprobante?.[0] || null,
      raw: parsed,
    }
  } catch (error) {
    console.error(
      '❌ Error al autorizar en el SRI:',
      error.response?.data || error.message
    )
    throw error
  }
}
