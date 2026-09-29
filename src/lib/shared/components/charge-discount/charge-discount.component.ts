// Catálogo 53 de SUNAT — Códigos de cargos, descuentos y otras deducciones.
// Filtrado solo a los códigos de nivel "Item" (aplican a una línea, no al
// documento completo). Se excluyen 07 y 54 (factores de compensación /
// aportación del Decreto de Urgencia N. 010-2004) por ser casos muy
// específicos; se pueden agregar después si se necesitan.
export const CATALOGO53_ITEM = [
  { value: '00', label: 'Descuento que afecta la base imponible del IGV/IVAP', isCharge: false, affectsBase: true },
  { value: '01', label: 'Descuento que no afecta la base imponible del IGV/IVAP', isCharge: false, affectsBase: false },
  { value: '47', label: 'Cargo que afecta la base imponible del IGV/IVAP', isCharge: true, affectsBase: true },
  { value: '48', label: 'Cargo que no afecta la base imponible del IGV/IVAP', isCharge: true, affectsBase: false },
] as const

export type AllowanceChargeReasonCode = (typeof CATALOGO53_ITEM)[number]['value']

export type AllowanceChargeSide = {
  chargeIndicator: boolean // true = cargo, false = descuento
  amount: string // '' significa que esta sub-entrada no se usa
}

export type EditableAllowanceCharge = {
  base: AllowanceChargeSide // afecta la base imponible (código 00 / 47)
  noBase: AllowanceChargeSide // no afecta la base imponible (código 01 / 48)
}

export function resolveCatalogo53Entry(code: string) {
  return CATALOGO53_ITEM.find((entry) => entry.value === code)
}

export function resolveCodeFromFlags(isCharge: boolean, affectsBase: boolean): AllowanceChargeReasonCode {
  const entry = CATALOGO53_ITEM.find((c) => c.isCharge === isCharge && c.affectsBase === affectsBase)
  return (entry?.value ?? '00') as AllowanceChargeReasonCode
}

export function createEditableAllowanceCharge(
  source: Partial<EditableAllowanceCharge> = {},
): EditableAllowanceCharge {
  return {
    base: {
      chargeIndicator: source.base?.chargeIndicator ?? false,
      amount: source.base?.amount ?? '',
    },
    noBase: {
      chargeIndicator: source.noBase?.chargeIndicator ?? false,
      amount: source.noBase?.amount ?? '',
    },
  }
}

/**
 * Construye un nodo UBL `cac:AllowanceCharge` a partir de un lado
 * (base o noBase) de una fila editable.
 */
function buildAllowanceChargeNode(side: AllowanceChargeSide, code: AllowanceChargeReasonCode, currency: string) {
  return {
    'cbc:ChargeIndicator': { _text: side.chargeIndicator },
    'cbc:AllowanceChargeReasonCode': { _text: code },
    'cbc:Amount': {
      _attributes: { currencyID: currency },
      _text: parseFloat(side.amount) || 0,
    },
  }
}

/**
 * Convierte las filas editables en la lista de nodos UBL `cac:AllowanceCharge`
 * que se persisten en la línea. Una fila puede generar 0, 1 o 2 nodos
 * (uno por lado con monto no vacío). Devuelve `undefined` si no hay
 * ningún cargo/descuento activo, para poder omitir la propiedad al
 * serializar el JSON → XML.
 */
export function buildAllowanceChargeList(
  items: EditableAllowanceCharge[],
  currency: string,
): ReturnType<typeof buildAllowanceChargeNode>[] | undefined {
  const nodes: ReturnType<typeof buildAllowanceChargeNode>[] = []

  for (const item of items) {
    if (item.base.amount.trim() !== '') {
      const code = resolveCodeFromFlags(item.base.chargeIndicator, true)
      nodes.push(buildAllowanceChargeNode(item.base, code, currency))
    }
    if (item.noBase.amount.trim() !== '') {
      const code = resolveCodeFromFlags(item.noBase.chargeIndicator, false)
      nodes.push(buildAllowanceChargeNode(item.noBase, code, currency))
    }
  }

  return nodes.length ? nodes : undefined
}

/**
 * Reconstruye las filas editables a partir de los nodos `cac:AllowanceCharge`
 * de una línea ya persistida (modo edición). Por ahora el editor solo
 * soporta una fila visual, así que se colapsan todos los nodos en una
 * única `EditableAllowanceCharge`, tomando el primer monto encontrado
 * para cada lado (base / noBase).
 */
export function hydrateAllowanceCharges(line: any): EditableAllowanceCharge[] {
  const rawNodes = line?.['cac:AllowanceCharge']
  if (!rawNodes) return []

  const nodes = Array.isArray(rawNodes) ? rawNodes : [rawNodes]
  const row = createEditableAllowanceCharge()

  for (const node of nodes) {
    const code = node['cbc:AllowanceChargeReasonCode']?._text
    const entry = resolveCatalogo53Entry(code)
    if (!entry) continue

    const side: AllowanceChargeSide = {
      chargeIndicator: node['cbc:ChargeIndicator']?._text === true,
      amount: String(node['cbc:Amount']?._text ?? ''),
    }

    const target = entry.affectsBase ? 'base' : 'noBase'
    if (row[target].amount === '') row[target] = side
  }

  const hasAnyAmount = row.base.amount !== '' || row.noBase.amount !== ''
  return hasAnyAmount ? [row] : []
}

/**
 * Suma neta de TODOS los cargos/descuentos (base + noBase). Cargos suman,
 * descuentos restan. Útil para reportes generales, no para el cálculo de
 * IGV de la línea (usa `netBaseAllowanceChargeAmount` para eso).
 */
export function netAllowanceChargeAmount(items: EditableAllowanceCharge[]): number {
  return items.reduce((sum, item) => sum + signedAmount(item.base) + signedAmount(item.noBase), 0)
}

/**
 * Suma neta SOLO de los cargos/descuentos que afectan la base imponible
 * (códigos 00/47, campo `base` de cada fila). Este es el único monto que
 * debe sumarse/restarse a la op. gravada antes de calcular el IGV de la
 * línea, ya que el lado `noBase` por definición no toca la base del IGV.
 */
export function netBaseAllowanceChargeAmount(items: EditableAllowanceCharge[]): number {
  return items.reduce((sum, item) => sum + signedAmount(item.base), 0)
}

/** Monto con signo: positivo si es cargo, negativo si es descuento. */
function signedAmount(side: AllowanceChargeSide): number {
  const amount = parseFloat(side.amount) || 0
  return side.chargeIndicator ? amount : -amount
}