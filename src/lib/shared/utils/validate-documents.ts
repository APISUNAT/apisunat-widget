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
    const isGuia = ['09', '31'].includes(type ?? '')
    // Valida que el valor de _text no esté vacío
    const isEmpty = (value: string | undefined) => !value?.trim()
    // La fecha de emisión es obligatoria
    if (isEmpty(doc['cbc:IssueDate']?._text))
        errors.push({ field: 'issueDate', message: 'La fecha de emisión es requerida' })
    // Para facturas y boletas, la moneda es obligatoria
    if (!isGuia && isEmpty(doc['cbc:DocumentCurrencyCode']?._text))
        errors.push({ field: 'currency', message: 'Selecciona la moneda' })
    // Para facturas y boletas, el tipo de operación es obligatorio
    if (
        !isNote &&
        !isGuia &&
        isEmpty(doc['cbc:InvoiceTypeCode']?._attributes?.listID)
    ) {
        errors.push({
            field: 'operationType',
            message: 'Selecciona el tipo de operación'
        })
    }
    // Para guías, validar tipo de operación de traslado
    if (isGuia && isEmpty(doc['cac:Shipment']?.['cbc:HandlingCode']?._text)) {
        errors.push({
            field: 'handlingCode',
            message: 'Selecciona el tipo de operación'
        })
    }
    // Validaciones de cliente (solo para facturas/boletas/notas, no para guías)
    if (!isGuia) {
        if (isEmpty(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID))
            errors.push({ field: 'customer', message: 'Selecciona Tipo de Documento del Cliente' })
        //Valida el numero de documento del cliente solo salta si es sin documento
        if (doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID !== '-') {
            if (isEmpty(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
                errors.push({ field: 'customerNumber', message: 'El número de documento del cliente es requerido' })
        }
    }

    // Validaciones de emisor (aplica para todos los documentos)
    if (!isGuia) {
        //valida el numero de documento del emisor
        if (isEmpty(doc['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
            errors.push({ field: 'supplierNumber', message: 'El número de documento del emisor es requerido' })
        //valida el nombre del emisor
        if (isEmpty(doc['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text))
            errors.push({ field: 'supplierName', message: 'El nombre del emisor es requerido' })
    } else {
        // Para guías validar DespatchSupplierParty
        if (isEmpty(doc['cac:DespatchSupplierParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
            errors.push({ field: 'supplierNumber', message: 'El número de documento del emisor es requerido' })
        if (isEmpty(doc['cac:DespatchSupplierParty']?.['cac:Party']?.['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text))
            errors.push({ field: 'supplierName', message: 'El nombre del emisor es requerido' })
    }
    // Valida que el array de líneas no esté vacío
    const lineKey = LINE_KEY[type ?? ''] ?? 'cac:InvoiceLine'
    if (!doc[lineKey]?.length)
        errors.push({ field: 'lines', message: 'Agrega al menos un ítem' }
        )

    // Validaciones de pago y detracción (solo para facturas/boletas/notas, no para guías)
    if (!isGuia) {
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

    // Validaciones específicas para Guías de Remisión (09 y 31)
    if (isGuia) {
        // Validar peso bruto
        const grossWeight = doc['cac:Shipment']?.['cbc:GrossWeightMeasure']?._text
        if (!grossWeight || parseFloat(grossWeight) <= 0) {
            errors.push({
                field: 'grossWeight',
                message: 'El peso bruto total es requerido'
            })
        }

        // Validar datos del transportista
        const carrierParty = doc['cac:Shipment']?.['cac:ShipmentStage']?.['cac:CarrierParty']
        const carrierDocument = carrierParty?.['cac:PartyIdentification']?.['cbc:ID']?._text
        if (isEmpty(carrierDocument)) {
            errors.push({
                field: 'carrierParty',
                message: 'Los datos del transportista son requeridos'
            })
        }

        // Validar destinatario
        const deliveryCustomer = doc['cac:DeliveryCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text
        if (isEmpty(deliveryCustomer)) {
            errors.push({
                field: 'deliveryCustomer',
                message: 'El destinatario es requerido'
            })
        }
    }

    return errors
}
