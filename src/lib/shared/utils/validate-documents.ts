import { get } from 'svelte/store'
import { documentStore, documentTypeStore } from '$lib/store/document.store'

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


    // si el metodo de pago es credito validar que tenga cuota
    if (doc['cac:PaymentTerms']?.[0]?.['cbc:PaymentMeansID']?._text === 'Credito') {
        if (!doc['cac:PaymentTerms']?.[1]?.['cbc:PaymentMeansID']?._text?.startsWith('Cuota')) {
            errors.push({
                field: 'paymentTerms',
                message: 'Agrega las cuotas de pago'
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