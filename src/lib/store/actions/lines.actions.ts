import { documentStore } from '../document.store'
import { numeroALetras } from '$lib/shared/utils/convert.utils'

export function addInvoiceLine(data: {
  id: number
  quantity: number
  unitCode: string
  description: string
  valorUnitario: number
  precioUnitario: number
  igvRate: number
  itemCode?: string
}) {
  const rate          = data.igvRate / 100
  const totalLinea    = parseFloat((data.quantity * data.precioUnitario).toFixed(2))
  const lineExtension = parseFloat((totalLinea / (1 + rate)).toFixed(2))
  const taxAmount     = parseFloat((totalLinea - lineExtension).toFixed(2))

  const line = {
    'cbc:ID':               { _text: data.id },
    'cbc:InvoicedQuantity': { _attributes: { unitCode: data.unitCode }, _text: data.quantity },
    'cbc:LineExtensionAmount': { _attributes: { currencyID: 'PEN' }, _text: lineExtension },
    'cac:PricingReference': {
      'cac:AlternativeConditionPrice': {
        'cbc:PriceAmount':   { _attributes: { currencyID: 'PEN' }, _text: data.precioUnitario },
        'cbc:PriceTypeCode': { _text: '01' }
      }
    },
    'cac:TaxTotal': {
      'cbc:TaxAmount': { _attributes: { currencyID: 'PEN' }, _text: taxAmount },
      'cac:TaxSubtotal': [{
        'cbc:TaxableAmount': { _attributes: { currencyID: 'PEN' }, _text: lineExtension },
        'cbc:TaxAmount':     { _attributes: { currencyID: 'PEN' }, _text: taxAmount },
        'cac:TaxCategory': {
          'cbc:Percent':                { _text: data.igvRate },
          'cbc:TaxExemptionReasonCode': { _text: '10' },
          'cac:TaxScheme': {
            'cbc:ID':          { _text: '1000' },
            'cbc:Name':        { _text: 'IGV' },
            'cbc:TaxTypeCode': { _text: 'VAT' }
          }
        }
      }]
    },
    'cac:Item': {
      'cbc:Description': { _text: data.description },
      ...(data.itemCode && {
        'cac:SellersItemIdentification': { 'cbc:ID': { _text: data.itemCode } }
      })
    },
    'cac:Price': {
      'cbc:PriceAmount': { _attributes: { currencyID: 'PEN' }, _text: data.valorUnitario }
    }
  }

  documentStore.update(body => {
    const existing = ((body['cac:InvoiceLine'] as any[]) ?? [])
      .filter((l: any) => l['cbc:ID']._text !== data.id)
    const lines = [...existing, line]
    const { total, ...ubl } = recalcTotals(lines)

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

export function removeInvoiceLine(id: number) {
  documentStore.update(body => {
    const lines = ((body['cac:InvoiceLine'] as any[]) ?? [])
      .filter((l: any) => l['cbc:ID']._text !== id)
    const { total, ...ubl } = recalcTotals(lines)

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
  documentStore.update(body => {
    const { total, ...ubl } = recalcTotals([])

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

function recalcTotals(lines: any[]) {
  const opGravada  = lines.reduce((s, l) => s + (l['cbc:LineExtensionAmount']?._text ?? 0), 0)
  const igv        = lines.reduce((s, l) => s + (l['cac:TaxTotal']?.['cbc:TaxAmount']?._text ?? 0), 0)
  const opGravadaR = parseFloat(opGravada.toFixed(2))
  const igvR       = parseFloat(igv.toFixed(2))
  const total      = parseFloat((opGravadaR + igvR).toFixed(2))

  return {
    total,
    'cac:TaxTotal': {
      'cbc:TaxAmount': { _attributes: { currencyID: 'PEN' }, _text: igvR },
      'cac:TaxSubtotal': [{
        'cbc:TaxableAmount': { _attributes: { currencyID: 'PEN' }, _text: opGravadaR },
        'cbc:TaxAmount':     { _attributes: { currencyID: 'PEN' }, _text: igvR },
        'cac:TaxCategory': {
          'cac:TaxScheme': {
            'cbc:ID':          { _text: '1000' },
            'cbc:Name':        { _text: 'IGV' },
            'cbc:TaxTypeCode': { _text: 'VAT' }
          }
        }
      }]
    },
    'cac:LegalMonetaryTotal': {
      'cbc:LineExtensionAmount': { _attributes: { currencyID: 'PEN' }, _text: opGravadaR },
      'cbc:TaxInclusiveAmount':  { _attributes: { currencyID: 'PEN' }, _text: total },
      'cbc:PayableAmount':       { _attributes: { currencyID: 'PEN' }, _text: total },
    }
  }
}