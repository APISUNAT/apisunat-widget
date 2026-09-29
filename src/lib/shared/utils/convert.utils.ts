import { CATALOGO02 } from '$lib/constants/catalagos' // ajusta la ruta según dónde lo tengas

const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
const DECENAS  = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
const ESPECIALES: Record<number, string> = {
  11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
  16: 'DIECISEIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
  21: 'VEINTIUN', 22: 'VEINTIDOS', 23: 'VEINTITRES', 24: 'VEINTICUATRO',
  25: 'VEINTICINCO', 26: 'VEINTISEIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE',
}
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

function centenasALetras(n: number): string {
  if (n === 100) return 'CIEN'
  const c = Math.floor(n / 100)
  const resto = n % 100
  const centena = CENTENAS[c]
  if (resto === 0) return centena
  if (ESPECIALES[resto]) return `${centena} ${ESPECIALES[resto]}`.trim()
  const d = Math.floor(resto / 10)
  const u = resto % 10
  const decena = DECENAS[d]
  const unidad = UNIDADES[u]
  return [centena, decena, unidad].filter(Boolean).join(' Y ').trim()
}

function seccionALetras(n: number, divisor: number, singular: string, plural: string): string {
  const cientos = Math.floor(n / divisor)
  if (cientos === 0) return ''
  if (cientos === 1) return singular
  return `${centenasALetras(cientos)} ${plural}`
}

function milesALetras(n: number): string {
  const resto = n % 1000
  const strMiles = seccionALetras(n, 1000, 'UN MIL', 'MIL')
  const strCentenas = centenasALetras(resto)
  if (!strMiles) return strCentenas
  return strCentenas ? `${strMiles} ${strCentenas}` : strMiles
}

function millonesALetras(n: number): string {
  const resto = n % 1000000
  const strMillones = seccionALetras(n, 1000000, 'UN MILLON', 'MILLONES')
  const strMiles = milesALetras(resto)
  if (!strMillones) return strMiles
  return strMiles ? `${strMillones} ${strMiles}` : strMillones
}

function enterosALetras(n: number): string {
  if (n === 0) return 'CERO'
  return millonesALetras(n)
}

export function numeroALetras(monto: number, currency: string): string {
  const entero = Math.floor(monto)
  const decimales = Math.round((monto - entero) * 100)
  const letras = enterosALetras(entero)
  const nombreMoneda = CATALOGO02.find(c => c.value === currency)?.name ?? 'SOLES'
  return `${letras} CON ${String(decimales).padStart(2, '0')}/100 ${nombreMoneda}`
}

export const DETRACCION_NOTE_CODE = '2006'
export const DETRACCION_NOTE_TEXT = 'OPERACIÓN SUJETA A DETRACCIÓN'

export function isDetraccionDocument(doc: Record<string, any> | null | undefined) {
  const listID = String(doc?.['cbc:InvoiceTypeCode']?._attributes?.listID ?? '')
  if (listID.startsWith('10')) return true

  const terms = doc?.['cac:PaymentTerms']
  return Array.isArray(terms) && terms.some((term: any) => term?.['cbc:ID']?._text === 'Detraccion')
}

/** Agrega o quita la leyenda SUNAT 2006 sin tocar el resto de notas. */
export function withDetraccionLegend(notes: any[] | undefined, include: boolean) {
  const current = notes ?? []
  const without2006 = current.filter(
    (note) => note._attributes?.languageLocaleID !== DETRACCION_NOTE_CODE,
  )

  if (!include) return without2006
  if (current.some((note) => note._attributes?.languageLocaleID === DETRACCION_NOTE_CODE)) {
    return current
  }

  return [
    {
      _attributes: { languageLocaleID: DETRACCION_NOTE_CODE },
      _text: DETRACCION_NOTE_TEXT,
    },
    ...without2006,
  ]
}

/** Reemplaza la nota SUNAT 1000 (importe en letras) preservando el resto de notas. */
export function withNoteInWords(notes: any[] | undefined, total: number, currency: string) {
  return [
    ...(notes ?? []).filter((note) => note._attributes?.languageLocaleID !== '1000'),
    { _text: numeroALetras(total, currency), _attributes: { languageLocaleID: '1000' } },
  ]
}