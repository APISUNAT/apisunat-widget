import { documentStore } from '$lib/store/document.store'

// Código del catálogo 53 para retención del IGV
const RETENTION_REASON_CODE = '62'

export function setRetentionActions(active: boolean) {
    documentStore.update(body => {
        const total = body['cac:LegalMonetaryTotal']?.['cbc:TaxInclusiveAmount']?._text ?? 0
        const baseAmount = parseFloat((total as number).toFixed(2))
        const retentionAmount = parseFloat((baseAmount * 0.03).toFixed(2))

        // Mantenemos los demás cargos/descuentos y quitamos solo la retención anterior
        const existing = (body['cac:AllowanceCharge'] as any[]) ?? []
        const otherCharges = existing.filter(
            (c) => c['cbc:AllowanceChargeReasonCode']?._text !== RETENTION_REASON_CODE
        )

        const retentionCharge = {
            'cbc:ChargeIndicator':           { _text: 'false' },
            'cbc:AllowanceChargeReasonCode': { _text: RETENTION_REASON_CODE },
            'cbc:MultiplierFactorNumeric':   { _text: 0.03 },
            'cbc:Amount':     { _attributes: { currencyID: 'PEN' }, _text: retentionAmount },
            'cbc:BaseAmount': { _attributes: { currencyID: 'PEN' }, _text: baseAmount },
        }

        return {
            ...body,
            'cac:AllowanceCharge': active
                ? [...otherCharges, retentionCharge]
                : otherCharges,
        }
    })
}