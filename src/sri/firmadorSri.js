import forge from 'node-forge'
import { SignedXml } from 'xml-crypto'
import { readFileSync } from 'fs'

export async function firmarXml(xml, p12Path, password) {
  const p12Buffer = readFileSync(p12Path)
  const p12Der = Buffer.from(p12Buffer, 'binary')
  const p12Asn1 = forge.asn1.fromDer(p12Der.toString('binary'))
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password) // ✅ corregido forge.pkcs12.pkcs12FromAsn1

  const keyObj = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
    forge.pki.oids.pkcs8ShroudedKeyBag
  ][0]
  const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[
    forge.pki.oids.certBag
  ][0]

  const privateKey = forge.pki.privateKeyToPem(keyObj.key)
  const certificate = forge.pki.certificateToPem(certObj.cert)

  const sig = new SignedXml({
    privateKey: privateKey,
    publicCert: certificate, // ✅ Agregado
    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
  })

  sig.addReference({
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    xpath: '//*[local-name()= "factura"]',
    transforms: ['http://www.w3.org/2001/10/xml-exc-c14n#'],
  })

  sig.computeSignature(xml)

  return sig.getSignedXml()
}
