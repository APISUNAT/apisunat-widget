/** Campos propios del formulario de edición de ítem (sin id ni allowanceCharges). */
import { convertDecimalToInt, convertIntToDecimal, roundToTwoDecimals } from '$lib/shared/utils/convertnumber.utils'

export type ItemFormFields = {
  description: string
  quantity: string
  unitCode: string
  valorUnitario: string
  precioUnitario: string
  igvRate: number
  taxSchemeValue: string
}

export type ItemAmounts = {
  subtotal: string
  tax: string
  total: string
}

/**
 * Normaliza la tasa de IGV a porcentaje entero (18, no 0.18).
 * Acepta documentos viejos que pudieran haber guardado la tasa como fracción.
 */
export function normalizeIgvRate(raw: any): number {
  const rate = Number(raw)
  if (isNaN(rate)) return 18
  return rate < 1 ? Math.round(rate * 100) : rate
}

export function createEditableItem(source: Partial<ItemFormFields> = {}): ItemFormFields {
  return {
    description: source.description ?? '',
    quantity: source.quantity ?? '1',
    unitCode: source.unitCode ?? 'NIU',
    valorUnitario: source.valorUnitario ?? '',
    precioUnitario: source.precioUnitario ?? '',
    igvRate: normalizeIgvRate(source.igvRate ?? 18),
    taxSchemeValue: source.taxSchemeValue ?? '1000',
  }
}

export function calcItemAmounts(
  quantity: string,
  precioUnitario: string,
  igvRate: number,
): ItemAmounts {
  const qty = parseFloat(quantity) || 0
  const precio = parseFloat(precioUnitario) || 0
  const rate = igvRate / 100

  // Escalar a enteros (×100000)
  const qtyInt = convertDecimalToInt(qty)
  const precioInt = convertDecimalToInt(precio)
  const rateInt = convertDecimalToInt(rate)

  // Operaciones con enteros
  const subtotalInt = (qtyInt * precioInt) / (100000 + rateInt)
  const taxInt = (subtotalInt * rateInt) / 100000
  const totalInt = subtotalInt + taxInt

  // Desescalar y redondear
  const subtotal = roundToTwoDecimals(convertIntToDecimal(subtotalInt), 2)
  const tax = roundToTwoDecimals(convertIntToDecimal(taxInt), 2)
  const total = roundToTwoDecimals(convertIntToDecimal(totalInt), 2)

  return {
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
  }
}

export function calcPrecioFromValor(valor: string, igvRate: number): string {
  if (valor === '') return ''
  const valorNum = parseFloat(valor) || 0
  const rate = igvRate / 100

  // Escalar a enteros
  const valorInt = convertDecimalToInt(valorNum)
  const rateInt = convertDecimalToInt(rate)

  // Operación con enteros: precio = valor × (1 + rate)
  const precioInt = (valorInt * (100000 + rateInt)) / 100000

  // Desescalar y limpiar
  return toCleanString(convertIntToDecimal(precioInt))
}

export function calcValorFromPrecio(precio: string, igvRate: number): string {
  if (precio === '') return ''
  const precioNum = parseFloat(precio) || 0
  const rate = igvRate / 100

  // Escalar a enteros
  const precioInt = convertDecimalToInt(precioNum)
  const rateInt = convertDecimalToInt(rate)

  // Operación con enteros: valor = precio / (1 + rate)
  const valorInt = (precioInt * 100000) / (100000 + rateInt)

  // Desescalar y limpiar
  return toCleanString(convertIntToDecimal(valorInt))
}

export function calcPrecioOnRateChange(valorUnitario: string, newRate: number): string {
  return calcPrecioFromValor(valorUnitario, newRate)
}

/** Redondea a 10 decimales y quita ceros de cola (evita "10.5000000000"). */
function toCleanString(value: number): string {
  return parseFloat(value.toFixed(10)).toString()
}