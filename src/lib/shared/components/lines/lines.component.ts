import { get } from 'svelte/store'
import { documentStore } from '$lib/store/document.store'
import { numeroALetras } from '$lib/shared/utils/convert.utils'
import { buildTotalsUBL } from '$lib/shared/components/summary/summary-panel.component'

function getCurrency(): string {
  return get(documentStore)['cbc:DocumentCurrencyCode']?._text ?? 'PEN'
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
}) {
  const currency      = getCurrency()
  const rate          = data.igvRate / 100
  const totalLinea    = parseFloat((data.quantity * data.precioUnitario).toFixed(2))
  const lineExtension = parseFloat((totalLinea / (1 + rate)).toFixed(2))
  const taxAmount     = parseFloat((totalLinea - lineExtension).toFixed(2))

  documentStore.update(body => {
    const allLines = (body['cac:InvoiceLine'] as any[]) ?? []
    const existingIndex = allLines.findIndex((l: any) => l['cbc:ID']._text === data.id)
    const existingLine = existingIndex !== -1 ? allLines[existingIndex] : {}

    const resolvedItemCode = data.itemCode
      ?? existingLine['cac:Item']?.['cac:SellersItemIdentification']?.['cbc:ID']?._text

    const mergedLine = {
      ...existingLine,
      'cbc:ID': { _text: data.id },
      'cbc:InvoicedQuantity': {
        ...existingLine['cbc:InvoicedQuantity'],
        _attributes: { ...existingLine['cbc:InvoicedQuantity']?._attributes, unitCode: data.unitCode },
        _text: data.quantity,
      },
      'cbc:LineExtensionAmount': {
        ...existingLine['cbc:LineExtensionAmount'],
        _attributes: { ...existingLine['cbc:LineExtensionAmount']?._attributes, currencyID: currency },
        _text: lineExtension,
      },
      'cac:PricingReference': {
        ...existingLine['cac:PricingReference'],
        'cac:AlternativeConditionPrice': {
          ...existingLine['cac:PricingReference']?.['cac:AlternativeConditionPrice'],
          'cbc:PriceAmount': {
            ...existingLine['cac:PricingReference']?.['cac:AlternativeConditionPrice']?.['cbc:PriceAmount'],
            _attributes: { ...existingLine['cac:PricingReference']?.['cac:AlternativeConditionPrice']?.['cbc:PriceAmount']?._attributes, currencyID: currency },
            _text: data.precioUnitario,
          },
          'cbc:PriceTypeCode': { _text: '01' },//quitar el por defecto
        }
      },
      'cac:TaxTotal': {
        ...existingLine['cac:TaxTotal'],
        'cbc:TaxAmount': {
          ...existingLine['cac:TaxTotal']?.['cbc:TaxAmount'],
          _attributes: { ...existingLine['cac:TaxTotal']?.['cbc:TaxAmount']?._attributes, currencyID: currency },
          _text: taxAmount,
        },
        'cac:TaxSubtotal': [{
          ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0],
          'cbc:TaxableAmount': {
            ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cbc:TaxableAmount'],
            _attributes: { ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cbc:TaxableAmount']?._attributes, currencyID: currency },
            _text: lineExtension,
          },
          'cbc:TaxAmount': {
            ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cbc:TaxAmount'],
            _attributes: { ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cbc:TaxAmount']?._attributes, currencyID: currency },
            _text: taxAmount,
          },
          'cac:TaxCategory': {
            ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cac:TaxCategory'],
            'cbc:Percent':                { _text: data.igvRate },
            'cbc:TaxExemptionReasonCode': { _text: '10' },
            'cac:TaxScheme': {
              ...existingLine['cac:TaxTotal']?.['cac:TaxSubtotal']?.[0]?.['cac:TaxCategory']?.['cac:TaxScheme'],
              'cbc:ID':          { _text: '1000' },//quitar el por defecto
              'cbc:Name':        { _text: 'IGV' },//quitar el por defecto
              'cbc:TaxTypeCode': { _text: 'VAT' },//quitar el por defecto
            }
          }
        }]
      },
      'cac:Item': {
        ...existingLine['cac:Item'],
        'cbc:Description': { _text: data.description },
        ...(resolvedItemCode && {
          'cac:SellersItemIdentification': {
            ...existingLine['cac:Item']?.['cac:SellersItemIdentification'],
            'cbc:ID': { _text: resolvedItemCode }
          }
        })
      },
      'cac:Price': {
        ...existingLine['cac:Price'],
        'cbc:PriceAmount': {
          ...existingLine['cac:Price']?.['cbc:PriceAmount'],
          _attributes: { ...existingLine['cac:Price']?.['cbc:PriceAmount']?._attributes, currencyID: currency },
          _text: data.valorUnitario,
        }
      },
    }

    const lines = existingIndex !== -1
      ? allLines.map((l: any, i: number) => i === existingIndex ? mergedLine : l)
      : [...allLines, mergedLine]

    const { total, ...ubl } = buildTotalsUBL(lines, currency)

    return {
      ...body,
      'cac:InvoiceLine': lines,
      ...ubl,
      'cbc:Note': [
        ...(body['cbc:Note'] ?? []).filter((n: any) => n._attributes?.languageLocaleID !== '1000'),
        { _text: numeroALetras(total), _attributes: { languageLocaleID: '1000' } }
      ]
    }
  })
}

export function removeInvoiceLineActions(id: number) {
  const currency = getCurrency()

  documentStore.update(body => {
    const lines = ((body['cac:InvoiceLine'] as any[]) ?? [])
      .filter((l: any) => l['cbc:ID']._text !== id)
    const { total, ...ubl } = buildTotalsUBL(lines, currency)

    return {
      ...body,
      'cac:InvoiceLine': lines,
      ...ubl,
      'cbc:Note': [
        ...(body['cbc:Note'] ?? []).filter((n: any) => n._attributes?.languageLocaleID !== '1000'),
        { _text: numeroALetras(total), _attributes: { languageLocaleID: '1000' } }
      ]
    }
  })
}

export function clearInvoiceLines() {
  const currency = getCurrency()

  documentStore.update(body => {
    const { total, ...ubl } = buildTotalsUBL([], currency)

    return {
      ...body,
      'cac:InvoiceLine': [],
      ...ubl,
      'cbc:Note': [
        ...(body['cbc:Note'] ?? []).filter((n: any) => n._attributes?.languageLocaleID !== '1000'),
        { _text: numeroALetras(total), _attributes: { languageLocaleID: '1000' } }
      ]
    }
  })
}