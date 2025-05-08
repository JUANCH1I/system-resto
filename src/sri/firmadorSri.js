import { DOMParser, XMLSerializer } from 'xmldom'
import { Crypto } from '@peculiar/webcrypto'
import * as xadesjs from 'xadesjs'
import * as p12 from 'p12-pem'
import forge from 'node-forge'

function limpiarCertificadoPem(pem) {
  return pem
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\r?\n|\r/g, '')
}

xadesjs.Application.setEngine('NodeJS', new Crypto())

export async function firmarFactura(xmlPath) {
  const p12Path = './src/certs/1013252787118662625022153733.p12'
  const p12Pass = process.env.PASSWORD_SIGNATURE // ← tu contraseña real

  const { pemKey, pemCertificate, commonName } = p12.getPemFromP12(
    p12Path,
    p12Pass
  )

  // 1. Convertir PEM a clave privada de forge
  const privateKey = forge.pki.privateKeyFromPem(pemKey)

  // 2. Obtener ASN.1 en formato PKCS#1 (RSAPrivateKey)
  const rsaPrivateKey = forge.pki.privateKeyToAsn1(privateKey)

  // 3. Empaquetar en un PrivateKeyInfo PKCS#8
  const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey) // ✅ Correcto uso

  // 4. Codificar como DER para usar en WebCrypto
  const derBytes = forge.asn1.toDer(privateKeyInfo).getBytes()

  // 5. Convertir a ArrayBuffer para usar con crypto.subtle.importKey
  const keyBuffer = new Uint8Array([...derBytes].map((c) => c.charCodeAt(0)))
    .buffer

  // Importar clave privada a formato WebCrypto (pkcs8)

  const subtle = new Crypto().subtle // Usa la misma instancia usada por xadesjs

  const cryptoKey = await subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-1',
    },
    false,
    ['sign']
  )

  const dom = new DOMParser().parseFromString(xmlPath, 'text/xml')

  const xmlToSign = dom.documentElement

  const signedXml = new xadesjs.SignedXml()

  const pemCertificateLimpio = limpiarCertificadoPem(pemCertificate)

  await signedXml.Sign(
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-1',
    },
    cryptoKey,
    xmlToSign,
    {
      references: [
        {
          uri: '#comprobante', // firma el nodo raíz (debe tener id="comprobante")
          transforms: ['enveloped'],
          hash: 'SHA-1',
        },
      ],
      signingCertificate: pemCertificateLimpio,
      x509: [pemCertificateLimpio],
      signingTime: new Date(),

      productionPlace: {
        countryName: 'Ecuador',
      },
    }
  )

  xmlToSign.appendChild(signedXml.XmlSignature.GetXml())

  xmlToSign.appendChild(signedXml.XmlSignature.GetXml())
  const signedXmlString = new XMLSerializer().serializeToString(dom)

  console.log(
    '✅ XML firmado correctamente y guardado como factura-firmada.xml'
  )
  return signedXmlString
}
