import { documentStore } from '$lib/store/document.store'

export function setRetentionActions(active: boolean) {
    documentStore.update(body => {
        const total = body['cac:LegalMonetaryTotal']?.['cbc:TaxInclusiveAmount']?._text ?? 0
        const baseAmount = parseFloat((total as number).toFixed(2))
        const retentionAmount = parseFloat((baseAmount * 0.03).toFixed(2))

        return {
            ...body,
            'cac:AllowanceCharge': active ? [{
                'cbc:ChargeIndicator':           { _text: 'false' },
                'cbc:AllowanceChargeReasonCode': { _text: '62' },
                'cbc:MultiplierFactorNumeric':   { _text: 0.03 },
                'cbc:Amount':     { _attributes: { currencyID: 'PEN' }, _text: retentionAmount },
                'cbc:BaseAmount': { _attributes: { currencyID: 'PEN' }, _text: baseAmount },
            }] : [],
        }
    })
}