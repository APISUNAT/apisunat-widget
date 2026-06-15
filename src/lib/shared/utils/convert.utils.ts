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

function enterosALetras(n: number): string {
  if (n === 0) return 'CERO'
  if (n === 1000000) return 'UN MILLON'
  if (n > 1000000) return String(n) // fuera de rango

  if (n >= 1000) {
    const miles = Math.floor(n / 1000)
    const resto = n % 1000
    const prefijo = miles === 1 ? 'MIL' : `${centenasALetras(miles)} MIL`
    return resto === 0 ? prefijo : `${prefijo} ${centenasALetras(resto)}`
  }

  return centenasALetras(n)
}

export function numeroALetras(monto: number): string {
  const entero   = Math.floor(monto)
  const decimales = Math.round((monto - entero) * 100)
  const letras   = enterosALetras(entero)
  return `${letras} CON ${String(decimales).padStart(2, '0')}/100 SOLES`
}