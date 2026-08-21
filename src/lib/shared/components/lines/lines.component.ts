import { get } from 'svelte/store'
import { documentStore, documentTypeStore } from '$lib/store/document.store'
import { numeroALetras } from '$lib/shared/utils/convert.utils'
import { buildTotalsActions } from '$lib/shared/components/summary/summary-panel.component'
import {
  buildAllowanceChargeList,
  hydrateAllowanceCharges,
  netBaseAllowanceChargeAmount,
  type EditableAllowanceCharge,
} from '$lib/shared/components/charge-discount/charge-discount.component'

// Mapeo de línea/cantidad por tipo de documento UBL (factura, NC, ND, guía)
const LINE_KEY: Record<string, string> = {
  '07': 'cac:CreditNoteLine',
  '08': 'cac:DebitNoteLine',
  '09': 'cac:DespatchLine',
  '31': 'cac:DespatchLine',
}

const QUANTITY_KEY: Record<string, string> = {
  '07': 'cbc:CreditedQuantity',
  '08': 'cbc:DebitedQuantity',
  '09': 'cbc:DeliveredQuantity',
  '31': 'cbc:DeliveredQuantity',
}

const ALL_LINE_KEYS = [...new Set(Object.values(LINE_KEY)), 'cac:InvoiceLine']
const ALL_QUANTITY_KEYS = [...new Set(Object.values(QUANTITY_KEY)), 'cbc:InvoicedQuantity']

export type EditableItem = {
  description: string
  quantity: string
  unitCode: string
  valorUnitario: string
  precioUnitario: string
  igvRate: number
  itemCode?: string
  allowanceCharges: EditableAllowanceCharge[]
}

export type LineItem = EditableItem & { id: number }

function getCurrency(): string {
  return get(documentStore)['cbc:DocumentCurrencyCode']?._text ?? 'PEN'
}

export function getLineKey(): string {
  const type = get(documentTypeStore)
  return LINE_KEY[type ?? ''] ?? 'cac:InvoiceLine'
}

export function getQuantityKey(): string {
  const type = get(documentTypeStore)
  return QUANTITY_KEY[type ?? ''] ?? 'cbc:InvoicedQuantity'
}

// Quita llaves de líneas de otros tipos de documento (evita líneas fantasma)
function stripOtherLineKeys(body: Record<string, any>, activeKey: string) {
  const clean = { ...body }
  for (const key of ALL_LINE_KEYS) {
    if (key !== activeKey) delete clean[key]
  }
  return clean
}

// Quita llaves de cantidad de otros tipos de documento dentro de una línea
function stripOtherQuantityKeys(line: Record<string, any>, activeKey: string) {
  const clean = { ...line }
  for (const key of ALL_QUANTITY_KEYS) {
    if (key !== activeKey) delete clean[key]
  }
  return clean
}

// Reemplaza la nota en letras (idioma 1000) por el total actual
function withUpdatedNoteInWords(notes: any[] | undefined, total: number, currency: string) {
  return [
    ...(notes ?? []).filter((note) => note._attributes?.languageLocaleID !== '1000'),
    { _text: numeroALetras(total, currency), _attributes: { languageLocaleID: '1000' } },
  ]
}

export function hydrateLines(doc: any): LineItem[] {
  const lines = doc[getLineKey()]
  if (lines === undefined) return []

  const qtyKey = getQuantityKey()
  const arr = Array.isArray(lines) ? lines : [lines]

  return arr.map((line: any, i: number): LineItem => {
    const igvPercent = line['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cac:TaxCategory']?.['cbc:Percent']?._text
    const igvRate = igvPercent ? parseFloat(String(igvPercent)) : 18

    const valorUnitario = String(line['cac:Price']?.['cbc:PriceAmount']?._text ?? '')

    const precioRaw = line['cac:PricingReference']?.['cac:AlternativeConditionPrice']?.['cbc:PriceAmount']?._text
    const precioUnitario = precioRaw
      ? String(precioRaw)
      : valorUnitario
        ? (parseFloat(valorUnitario) * (1 + igvRate / 100)).toFixed(2)
        : ''

    const itemCode = line['cac:Item']?.['cac:SellersItemIdentification']?.['cbc:ID']?._text

    return {
      id: i + 1,
      description: line['cac:Item']?.['cbc:Description']?._text ?? '',
      quantity: String(line[qtyKey]?._text ?? '1'),
      unitCode: line[qtyKey]?._attributes?.unitCode ?? 'NIU',
      valorUnitario,
      precioUnitario,
      igvRate,
      itemCode,
      allowanceCharges: hydrateAllowanceCharges(line),
    }
  })
}

// Op. gravada + IGV de una línea, ajustando la base con el neto de cargos/descuentos (códigos 00/47)
export function calcLineTaxAmounts(quantity: number, precioUnitario: number, igvRate: number, baseNet: number) {
  const rate = igvRate / 100
  const totalSinAjuste = parseFloat((quantity * precioUnitario).toFixed(2))
  const subtotalBruto = totalSinAjuste / (1 + rate)

  const lineExtensionAmount = parseFloat((subtotalBruto + baseNet).toFixed(2))
  const taxAmount = parseFloat((lineExtensionAmount * rate).toFixed(2))

  return { lineExtensionAmount, taxAmount }
}

export function addInvoiceLineActions(data: {
  id: number
  quantity: number
  unitCode: string
  description: string
  valorUnitario: number
  precioUnitario: number
  igvRate: number
  itemCode?: string
  allowanceCharges?: EditableAllowanceCharge[]
}) {
  const currency = getCurrency()
  const lineKey = getLineKey()
  const qtyKey = getQuantityKey()

  const baseNet = netBaseAllowanceChargeAmount(data.allowanceCharges ?? [])
  const { lineExtensionAmount, taxAmount } = calcLineTaxAmounts(
    data.quantity,
    data.precioUnitario,
    data.igvRate,
    baseNet,
  )
  const allowanceChargeNodes = buildAllowanceChargeList(data.allowanceCharges ?? [], currency)

  // Precio con IGV ajustado por el cargo/descuento que afecta la base.
  // cac:Price sigue usando data.valorUnitario (precio inicial, sin ajustar).
  const precioUnitarioAjustado = data.quantity
    ? parseFloat(((lineExtensionAmount + taxAmount) / data.quantity).toFixed(10))
    : data.precioUnitario

  documentStore.update((rawBody) => {
    const body = stripOtherLineKeys(rawBody, lineKey)
    const allLines = (body[lineKey] as any[]) ?? []
    const existingIndex = allLines.findIndex((l: any) => l['cbc:ID']._text === data.id)
    const existingLineRaw = existingIndex !== -1 ? allLines[existingIndex] : {}
    const existingLine = stripOtherQuantityKeys(existingLineRaw, qtyKey)

    const resolvedItemCode =
      data.itemCode ?? existingLine['cac:Item']?.['cac:SellersItemIdentification']?.['cbc:ID']?._text

    // Resto de la línea no recalculado aquí; se excluyen las llaves reconstruidas abajo para fijar su orden en el XML
    const {
      'cbc:ID': _id,
      [qtyKey]: _qty,
      'cbc:LineExtensionAmount': _lineExtension,
      'cac:PricingReference': _pricingRef,
      'cac:AllowanceCharge': _allowanceCharge,
      'cac:TaxTotal': _taxTotal,
      'cac:Item': _item,
      'cac:Price': _price,
      ...restOfLine
    } = existingLine

    const mergedLine = {
      ...restOfLine,
      'cbc:ID': { _text: data.id },
      [qtyKey]: {
        ...existingLine[qtyKey],
        _attributes: { ...existingLine[qtyKey]?._attributes, unitCode: data.unitCode },
        _text: data.quantity,
      },
      'cbc:LineExtensionAmount': {
        ...existingLine['cbc:LineExtensionAmount'],
        _attributes: { ...existingLine['cbc:LineExtensionAmount']?._attributes, currencyID: currency },
        _text: lineExtensionAmount,
      },
      'cac:PricingReference': {
        ...existingLine['cac:PricingReference'],
        'cac:AlternativeConditionPrice': {
          ...existingLine['cac:PricingReference']?.['cac:AlternativeConditionPrice'],
          'cbc:PriceAmount': {
            ...existingLine['cac:PricingReference']?.['cac:AlternativeConditionPrice']?.['cbc:PriceAmount'],
            _attributes: {
              ...existingLine['cac:PricingReference']?.['cac:AlternativeConditionPrice']?.['cbc:PriceAmount']
                ?._attributes,
              currencyID: currency,
            },
            _text: precioUnitarioAjustado,
          },
          'cbc:PriceTypeCode': { _text: '01' },
        },
      },
      ...(allowanceChargeNodes ? { 'cac:AllowanceCharge': allowanceChargeNodes } : {}),
      'cac:TaxTotal': {
        ...existingLine['cac:TaxTotal'],
        'cbc:TaxAmount': {
          ...existingLine['cac:TaxTotal']?.['cbc:TaxAmount'],
          _attributes: { ...existingLine['cac:TaxTotal']?.['cbc:TaxAmount']?._attributes, currencyID: currency },
          _text: taxAmount,
        },
        'cac:TaxSubtotal': [
          {
            ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0],
            'cbc:TaxableAmount': {
              ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cbc:TaxableAmount'],
              _attributes: {
                ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cbc:TaxableAmount']?._attributes,
                currencyID: currency,
              },
              _text: lineExtensionAmount,
            },
            'cbc:TaxAmount': {
              ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cbc:TaxAmount'],
              _attributes: {
                ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cbc:TaxAmount']?._attributes,
                currencyID: currency,
              },
              _text: taxAmount,
            },
            'cac:TaxCategory': {
              ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cac:TaxCategory'],
              'cbc:Percent': { _text: data.igvRate },
              'cbc:TaxExemptionReasonCode': { _text: '10' },
              'cac:TaxScheme': {
                ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cac:TaxCategory']?.['cac:TaxScheme'],
                'cbc:ID': { _text: '1000' },
                'cbc:Name': { _text: 'IGV' },
                'cbc:TaxTypeCode': { _text: 'VAT' },
              },
            },
          },
        ],
      },
      'cac:Item': {
        ...existingLine['cac:Item'],
        'cbc:Description': { _text: data.description },
        ...(resolvedItemCode && {
          'cac:SellersItemIdentification': {
            ...existingLine['cac:Item']?.['cac:SellersItemIdentification'],
            'cbc:ID': { _text: resolvedItemCode },
          },
        }),
      },
      'cac:Price': {
        ...existingLine['cac:Price'],
        'cbc:PriceAmount': {
          ...existingLine['cac:Price']?.['cbc:PriceAmount'],
          _attributes: { ...existingLine['cac:Price']?.['cbc:PriceAmount']?._attributes, currencyID: currency },
          _text: data.valorUnitario,
        },
      },
    }

    const lines =
      existingIndex !== -1
        ? allLines.map((line: any, i: number) => (i === existingIndex ? mergedLine : line))
        : [...allLines, mergedLine]

    const { total, ...ubl } = buildTotalsActions(lines, currency)

    return {
      ...body,
      [lineKey]: lines,
      ...ubl,
      'cbc:Note': withUpdatedNoteInWords(body['cbc:Note'], total,currency),
    }
  })
}

export function removeInvoiceLineActions(id: number) {
  const currency = getCurrency()
  const lineKey = getLineKey()

  documentStore.update((rawBody) => {
    const body = stripOtherLineKeys(rawBody, lineKey)
    const lines = ((body[lineKey] as any[]) ?? []).filter((line: any) => line['cbc:ID']._text !== id)
    const { total, ...ubl } = buildTotalsActions(lines, currency)

    return {
      ...body,
      [lineKey]: lines,
      ...ubl,
      'cbc:Note': withUpdatedNoteInWords(body['cbc:Note'], total,currency),
    }
  })
}

export function clearInvoiceLines() {
  const currency = getCurrency()
  const lineKey = getLineKey()

  documentStore.update((rawBody) => {
    const body = stripOtherLineKeys(rawBody, lineKey)
    const { total, ...ubl } = buildTotalsActions([], currency)

    return {
      ...body,
      [lineKey]: [],
      ...ubl,
      'cbc:Note': withUpdatedNoteInWords(body['cbc:Note'], total,currency),
    }
  })
}