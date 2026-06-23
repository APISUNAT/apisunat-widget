/** Campos propios del formulario de edición de ítem (sin id ni allowanceCharges). */
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

/**
 * Calcula op. gravada, IGV y total de la línea a partir del precio unitario
 * (con IGV) y la cantidad, ajustando la base imponible con el neto de
 * cargos/descuentos que la afectan (`baseNet`, códigos 00/47 del catálogo 53).
 *
 * El lado "no afecta la base" (códigos 01/48) NO entra aquí: por definición
 * no modifica la op. gravada ni el IGV de la línea.
 */
export function calcItemAmounts(
  quantity: string,
  precioUnitario: string,
  igvRate: number,
  baseNet: number = 0,
): ItemAmounts {
  const qty = parseFloat(quantity) || 0
  const precio = parseFloat(precioUnitario) || 0
  const rate = igvRate / 100

  const totalSinAjuste = qty * precio
  const subtotalBruto = totalSinAjuste / (1 + rate)

  const subtotal = subtotalBruto + baseNet
  const tax = subtotal * rate
  const total = subtotal + tax

  return {
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
  }
}

export function calcPrecioFromValor(valor: string, igvRate: number): string {
  if (valor === '') return ''
  const valorNum = parseFloat(valor) || 0
  return toCleanString(valorNum * (1 + igvRate / 100))
}

export function calcValorFromPrecio(precio: string, igvRate: number): string {
  if (precio === '') return ''
  const precioNum = parseFloat(precio) || 0
  return toCleanString(precioNum / (1 + igvRate / 100))
}

export function calcPrecioOnRateChange(valorUnitario: string, newRate: number): string {
  return calcPrecioFromValor(valorUnitario, newRate)
}

/** Redondea a 10 decimales y quita ceros de cola (evita "10.5000000000"). */
function toCleanString(value: number): string {
  return parseFloat(value.toFixed(10)).toString()
}