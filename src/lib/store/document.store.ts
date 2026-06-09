import { writable, get } from 'svelte/store'

export const documentStore = writable<Record<string, any>>({})

export function loadDocument(json: Record<string, any>) {
  documentStore.set(json)
}

export function setDocumentType(type: string) {
  documentStore.update((doc) => ({
    ...doc,
    'cbc:InvoiceTypeCode': {
      ...(doc['cbc:InvoiceTypeCode'] as object ?? {}),
      _text: type,
    },
  }))
}
//JSON del documento
export function getDocumentOutput(): Record<string, any> {
  const doc = get(documentStore)
  return {
    'cbc:UBLVersionID':            { _text: '2.1' },
    'cbc:CustomizationID':         { _text: '2.0' },
    'cbc:ID':                      doc['cbc:ID'],
    'cbc:IssueDate':               doc['cbc:IssueDate'],
    'cbc:IssueTime':               doc['cbc:IssueTime'],
    'cbc:InvoiceTypeCode':         doc['cbc:InvoiceTypeCode'],
    'cbc:Note':                    doc['cbc:Note'],
    'cbc:DocumentCurrencyCode':    doc['cbc:DocumentCurrencyCode'],
    'cac:AccountingSupplierParty': doc['cac:AccountingSupplierParty'],
    'cac:AccountingCustomerParty': doc['cac:AccountingCustomerParty'],
    'cac:TaxTotal':                doc['cac:TaxTotal'],
    'cac:LegalMonetaryTotal':      doc['cac:LegalMonetaryTotal'],
    'cac:PaymentTerms':            doc['cac:PaymentTerms'],
    'cac:InvoiceLine':             doc['cac:InvoiceLine'],
  }
}
//Json del nombre del archivo
export function getDocumentFileName(): string {
  const doc = get(documentStore)
  const supplierDocument = doc['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text
  const documentID = doc['cbc:ID']?._text
  const id = doc['cbc:InvoiceTypeCode']?._text
  return supplierDocument + '-' + documentID + '-' + id
}

(window as any).apisunat = (config: any) => {
  customElements.whenDefined('sunat-invoice').then(() => {
    const el = document.querySelector('sunat-invoice') as any
    if (el) el.config = config
  })
}
(window as any).apisunat.getOutput = getDocumentOutput,
(window as any).apisunat.getFileName = getDocumentFileName