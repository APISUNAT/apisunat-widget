import { derived, get } from 'svelte/store'
import { documentStore, documentTypeStore } from '$lib/store/document.store'
import { CATALOGO02 } from '$lib/constants/catalagos'
import { calcTotals } from '$lib/shared/utils/totals.utils'

// Nota de Débito ('08') usa cac:RequestedMonetaryTotal en vez de
// cac:LegalMonetaryTotal. El resto de documentos (Factura, Boleta,
// Nota de Crédito, Guía) usan LegalMonetaryTotal normalmente.
const MONETARY_TOTAL_KEY: Record<string, string> = {
    '08': 'cac:RequestedMonetaryTotal',
}

function getMonetaryTotalKey(): string {
    const type = get(documentTypeStore)
    return MONETARY_TOTAL_KEY[type ?? ''] ?? 'cac:LegalMonetaryTotal'
}

export function buildTotalsActions(lines: any[], currency: string) {
    const { opGravadaR, igvR, total } = calcTotals(lines)
    const monetaryTotalKey = getMonetaryTotalKey()
    const isRequestedTotal = monetaryTotalKey === 'cac:RequestedMonetaryTotal'

    return {
        total,
        // Si la llave activa es RequestedMonetaryTotal, nos asegurarnos de no
        // dejar un LegalMonetaryTotal "fantasma" de un tipo de documento
        // anterior, y viceversa.
        'cac:LegalMonetaryTotal': undefined,
        'cac:RequestedMonetaryTotal': undefined,
        'cac:TaxTotal': {
            'cbc:TaxAmount': { _attributes: { currencyID: currency }, _text: igvR },
            'cac:TaxSubtotal': [{
                'cbc:TaxableAmount': { _attributes: { currencyID: currency }, _text: opGravadaR },
                'cbc:TaxAmount': { _attributes: { currencyID: currency }, _text: igvR },
                'cac:TaxCategory': {
                    'cac:TaxScheme': {
                        'cbc:ID': { _text: '1000' },
                        'cbc:Name': { _text: 'IGV' },
                        'cbc:TaxTypeCode': { _text: 'VAT' }
                    }
                }
            }]
        },
        [monetaryTotalKey]: isRequestedTotal
            ? {
                // Nota de Débito: solo PayableAmount, sin LineExtensionAmount
                // ni TaxInclusiveAmount.
                'cbc:PayableAmount': {
                    _attributes: { currencyID: currency },
                    _text: total
                }
            }
            : {
                ...(total !== 0 && {
                    'cbc:LineExtensionAmount': {
                        _attributes: { currencyID: currency },
                        _text: opGravadaR
                    },
                    'cbc:TaxInclusiveAmount': {
                        _attributes: { currencyID: currency },
                        _text: total
                    }
                }),

                'cbc:PayableAmount': {
                    _attributes: { currencyID: currency },
                    _text: total
                }
            }
    }
}

export const summary = derived(documentStore, ($doc) => {
    const lmt = $doc['cac:LegalMonetaryTotal'] ?? $doc['cac:RequestedMonetaryTotal']
    const currency = $doc['cbc:DocumentCurrencyCode']?._text ?? 'PEN'
    const symbol = CATALOGO02.find(c => c.value === currency)?.symbol ?? 'S/'

    const opGravada = parseFloat(String(lmt?.['cbc:LineExtensionAmount']?._text ?? 0))
    const total = parseFloat(String(lmt?.['cbc:PayableAmount']?._text ?? 0))
    const igv = parseFloat((total - opGravada).toFixed(2))


    return {
        symbol,
        opGravada: opGravada.toFixed(2),
        igv: igv.toFixed(2),
        total: total.toFixed(2),
    }
})