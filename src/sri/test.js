import { DOMParser } from 'xmldom'
import { select } from 'xpath'

const xml = `<?xml version="1.0" encoding="UTF-8"?><factura id="comprobante" version="2.1.0"><infoTributaria>...</infoTributaria></factura>`

const doc = new DOMParser().parseFromString(xml, 'text/xml')
const node = select('//*[local-name(.)="factura"]', doc)[0]

console.log('Tiene cloneNode:', typeof node.cloneNode === 'function') // debería imprimir true
