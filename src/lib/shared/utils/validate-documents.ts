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
  const doc  = get(documentStore)
  const type = get(documentTypeStore)
  const errors: ValidationError[] = []

  // Valida que el valor de _text no esté vacío
  const isEmpty = (value: string | undefined) => !value?.trim()

  if (isEmpty(doc['cbc:IssueDate']?._text))
    errors.push({ field: 'issueDate', message: 'La fecha de emisión es requerida' })

  if (isEmpty(doc['cbc:DocumentCurrencyCode']?._text))
    errors.push({ field: 'currency', message: 'Selecciona la moneda' })

  if (isEmpty(doc['cbc:InvoiceTypeCode']?._attributes?.listID))
    errors.push({ field: 'operationType', message: 'Selecciona el tipo de operación' })
  if (isEmpty(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID))
    errors.push({ field: 'customer', message: 'Selecciona Tipo de Documento del Cliente' })
  //Valida el numero de documento del cliente solo salta si es sin docmuento
  if(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID !== '-'){
    if (isEmpty(doc['cac:AccountingCustomerParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text))
      errors.push({ field: 'customerNumber', message: 'El número de documento del cliente es requerido' })
  }
  // Valida que el array de líneas no esté vacío
  const lineKey = LINE_KEY[type ?? ''] ?? 'cac:InvoiceLine'
  if (!doc[lineKey]?.length)
    errors.push({ field: 'lines', message: 'Agrega al menos un ítem' })

  return errors
}