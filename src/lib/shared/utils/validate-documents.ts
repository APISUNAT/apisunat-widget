import { get } from 'svelte/store'
import { documentStore, documentTypeStore } from '$lib/store/document.store'
import {
    getCreditoAmountFromTerms,
    validateCuotas,
    type Cuota,
} from '$lib/shared/components/payment-terms/payment-terms.component'

export interface ValidationError {
    field: string
    message: string
}

const LINE_KEY: Record<string, string> = {
    '07': 'cac:CreditNoteLine',
    '08': 'cac:DebitNoteLine',
    '09': 'cac:DespatchLine',
    '31': 'cac:DespatchLine',
}

function collectCreditPaymentErrors(doc: Record<string, any>): ValidationError[] {
    const terms = Array.isArray(doc['cac:PaymentTerms']) ? doc['cac:PaymentTerms'] : []
    const hasCredito = terms.some((t: any) => t?.['cbc:PaymentMeansID']?._text === 'Credito')
    if (!hasCredito) return []

    const errors: ValidationError[] = []
    const cuotasTerms = terms.filter((t: any) =>
        /^Cuota\d{3}$/.test(t?.['cbc:PaymentMeansID']?._text ?? ''),
    )

    if (cuotasTerms.length === 0) {
        errors.push({ field: 'paymentTerms', message: 'Agrega las cuotas de pago' })
        return errors
    }

    const cuotas: Cuota[] = cuotasTerms.map((t: any, i: number) => ({
        id: i + 1,
        monto: String(t?.['cbc:Amount']?._text ?? ''),
        vencimiento: t?.['cbc:PaymentDueDate']?._text ?? '',
    }))

    for (const [index, cuota] of cuotas.entries()) {
        if (!cuota.vencimiento?.trim()) {
            errors.push({
                field: 'paymentTerms',
                message: `La cuota ${index + 1} necesita fecha de vencimiento`,
            })
        }
    }

    const issueDate = doc['cbc:IssueDate']?._text ?? ''
    const currency = doc['cbc:DocumentCurrencyCode']?._text ?? 'PEN'
    const payable = Number(doc['cac:LegalMonetaryTotal']?.['cbc:PayableAmount']?._text ?? 0)
    const detraccion = terms.find((t: any) => t?.['cbc:ID']?._text === 'Detraccion')
    const montoDetraccion = Number(detraccion?.['cbc:Amount']?._text ?? 0)
    const hostCredito = getCreditoAmountFromTerms(terms)

    const fieldErrors = validateCuotas(
        cuotas,
        payable,
        issueDate,
        Number.isFinite(montoDetraccion) ? montoDetraccion : 0,
        currency,
        hostCredito,
    )

    for (const err of Object.values(fieldErrors)) {
        if (err.vencimiento) {
            errors.push({ field: 'paymentTerms', message: err.vencimiento })
        }
        if (err.monto) {
            errors.push({ field: 'paymentTerms', message: err.monto })
        }
    }

    return errors
}

export function validateDocument(): ValidationError[] {
    const doc = get(documentStore)
    const type = get(documentTypeStore)
    const errors: ValidationError[] = []
    const isNote = ['07', '08'].includes(type ?? '')
    // Valida que el valor de _text no esté vacío
    const isEmpty = (value: string | undefined) => !value?.trim()
    // La fecha de emisión es obligatoria
    if (isEmpty(doc['cbc:IssueDate']?._text))
        errors.push({ field: 'issueDate', message: 'La fecha de emisión es requerida' })
    // Para facturas y boletas, la moneda es obligatoria
    if (isEmpty(doc['cbc:DocumentCurrencyCode']?._text))
        errors.push({ field: 'currency', message: 'Selecciona la moneda' })
    // Para facturas y boletas, el tipo de operación es obligatorio
    if (
        !isNote &&
        isEmpty(doc['cbc:InvoiceTypeCode']?._attributes?.listID)
    ) {
        errors.push({
            field: 'operationType',
            message: 'Selecciona el tipo de operación'
        })
    }
    if (isEmpty(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID))
        errors.push({ field: 'customer', message: 'Selecciona Tipo de Documento del Cliente' })
    //valida el numero de documento del emisor
    if (isEmpty(doc['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
        errors.push({ field: 'supplierNumber', message: 'El número de documento del emisor es requerido' })
    //valida el nombre del emisor
    if (isEmpty(doc['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text))
        errors.push({ field: 'supplierName', message: 'El nombre del emisor es requerido' })
    //Valida el numero de documento del cliente solo salta si es sin docmuento
    if (doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID !== '-') {
        if (isEmpty(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
            errors.push({ field: 'customerNumber', message: 'El número de documento del cliente es requerido' })
    }
    // Valida que el array de líneas no esté vacío
    const lineKey = LINE_KEY[type ?? ''] ?? 'cac:InvoiceLine'
    if (!doc[lineKey]?.length)
        errors.push({ field: 'lines', message: 'Agrega al menos un ítem' }
        )

    errors.push(...collectCreditPaymentErrors(doc))

    // El disparador real de "operación sujeta a detracción" es el tipo de
    // operación (catálogo 51, código 1001) — NO la existencia de PaymentTerms.
    // Ambos deben estar sincronizados: si el tipo de operación es 1001,
    // exigimos que también exista el bien/servicio, el % y el monto en
    // PaymentTerms, y la cuenta + método de pago completos en PaymentMeans.
    const isOperacionDetraccion = doc['cbc:InvoiceTypeCode']?._attributes?.listID === '1001'

    if (isOperacionDetraccion) {
        const detraccionTerm = doc['cac:PaymentTerms']?.find(
            (t: any) => t['cbc:ID']?._text === 'Detraccion'
        )
        const detraccionMean = doc['cac:PaymentMeans']?.find(
            (m: any) => m['cbc:ID']?._text === 'Detraccion'
        )
        const metodoPago = detraccionMean?.['cbc:PaymentMeansCode']?._text
        const cuenta = detraccionMean?.['cac:PayeeFinancialAccount']?.['cbc:ID']?._text
        const tipoBien = detraccionTerm?.['cbc:PaymentMeansID']?._text
        const monto = detraccionTerm?.['cbc:Amount']?._text

        if (isEmpty(tipoBien) && !monto) {
            errors.push({
                field: 'detraccion',
                message: 'Selecciona el bien/servicio o ingresa el monto de la detracción'
            })
        }

        if (isEmpty(metodoPago) || isEmpty(cuenta)) {
            errors.push({
                field: 'detraccion',
                message: 'Completa la cuenta y el método de pago de la detracción'
            })
        }
    }

    // Para notas de crédito/débito, la descripción de la razón es obligatoria
    if (isNote && isEmpty(doc['cac:DiscrepancyResponse']?.['cbc:Description']?._text)) {
        errors.push({
            field: 'noteDescription',
            message: 'Agrega la razón de la nota crédito/débito'
        })
    }
    // para notas ver que al menos exista un doc de referencia
    if(isNote && !doc['cac:BillingReference']){
        errors.push({
            field: 'referenceDocument',
            message: 'Agrega al menos un documento que va modificar'
        })
    }

    return errors
}
