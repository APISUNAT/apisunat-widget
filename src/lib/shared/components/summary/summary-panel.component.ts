import { derived } from 'svelte/store'
import { documentStore } from '$lib/store/document.store'
import { CATALOGO02 } from '$lib/constants/catalagos'
import { calcTotals } from '$lib/shared/utils/totals.utils'

export function buildTotalsUBL(lines: any[], currency: string) {
  const { opGravadaR, igvR, total } = calcTotals(lines)

  return {
    total,
    'cac:TaxTotal': {
      'cbc:TaxAmount': { _attributes: { currencyID: currency }, _text: igvR },
      'cac:TaxSubtotal': [{
        'cbc:TaxableAmount': { _attributes: { currencyID: currency }, _text: opGravadaR },
        'cbc:TaxAmount':     { _attributes: { currencyID: currency }, _text: igvR },
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
      'cbc:LineExtensionAmount': { _attributes: { currencyID: currency }, _text: opGravadaR },
      'cbc:TaxInclusiveAmount':  { _attributes: { currencyID: currency }, _text: total },
      'cbc:PayableAmount':       { _attributes: { currencyID: currency }, _text: total },
    }
  }
}

export const summary = derived(documentStore, ($doc) => {
  const lmt      = $doc['cac:LegalMonetaryTotal']
  const currency = $doc['cbc:DocumentCurrencyCode']?._text ?? 'PEN'
  const symbol   = CATALOGO02.find(c => c.value === currency)?.symbol ?? 'S/'

  const opGravada = parseFloat(String(lmt?.['cbc:LineExtensionAmount']?._text ?? 0))
  const total     = parseFloat(String(lmt?.['cbc:PayableAmount']?._text ?? 0))
  const igv       = parseFloat((total - opGravada).toFixed(2))

  return {
    symbol,
    opGravada: opGravada.toFixed(2),
    igv:       igv.toFixed(2),
    total:     total.toFixed(2),
  }
})