import { writable, get } from 'svelte/store'
import { runtimeConfigStore } from './config.store'
export const documentResetKey = writable(0)
export const emitBody = {
    '01': {
        'cbc:UBLVersionID': { _text: '2.1' },
        'cbc:CustomizationID': { _text: '2.0' },
        'cbc:ID': null,
        'cbc:IssueDate': null,
        'cbc:IssueTime': [],
        'cbc:DueDate': null,
        'cbc:InvoiceTypeCode': null,
        'cbc:Note': [],
        'cbc:DocumentCurrencyCode': null,
        'cac:DespatchDocumentReference': [],
        'cac:AdditionalDocumentReference': [],
        'cac:AccountingSupplierParty': null,
        'cac:AccountingCustomerParty': null,
        'cac:TaxTotal': null,
        'cac:PrepaidPayment': [],
        'cac:AllowanceCharge': [],
        'cac:LegalMonetaryTotal': null,
        'cac:PaymentTerms': [],
        'cac:InvoiceLine': [],
    },
    '03': {
        'cbc:UBLVersionID': { _text: '2.1' },
        'cbc:CustomizationID': { _text: '2.0' },
        'cbc:ID': null,
        'cbc:IssueDate': null,
        'cbc:IssueTime': [],
        'cbc:InvoiceTypeCode': null,
        'cbc:Note': [],
        'cbc:DocumentCurrencyCode': null,
        'cac:DespatchDocumentReference': [],
        'cac:AdditionalDocumentReference': [],
        'cac:AccountingSupplierParty': null,
        'cac:AccountingCustomerParty': null,
        'cac:TaxTotal': null,
        'cac:PrepaidPayment': [],
        'cac:LegalMonetaryTotal': null,
        'cac:AllowanceCharge': [],
        'cac:InvoiceLine': []
    },
    '04': {
        'cbc:UBLVersionID': { _text: '2.1' },
        'cbc:CustomizationID': { _text: '2.0' },
        'cbc:ID': null,
        'cbc:IssueDate': null,
        'cbc:IssueTime': [],
        'cbc:InvoiceTypeCode': null,
        'cbc:Note': [],
        'cbc:DocumentCurrencyCode': null,
        'cac:DespatchDocumentReference': [],
        'cac:AdditionalDocumentReference': [],
        'cac:AccountingSupplierParty': null,
        'cac:AccountingCustomerParty': null,
        'cac:DeliveryTerms': null,
        'cac:TaxTotal': null,
        'cac:PrepaidPayment': [],
        'cac:LegalMonetaryTotal': null,
        'cac:AllowanceCharge': [],
        'cac:InvoiceLine': []
    },
    '07': {
        'cbc:UBLVersionID': { _text: '2.1' },
        'cbc:CustomizationID': { _text: '2.0' },
        'cbc:ID': null,
        'cbc:IssueDate': null,
        'cbc:IssueTime': [],
        'cbc:Note': [],
        'cbc:DocumentCurrencyCode': null,
        'cac:DespatchDocumentReference': [],
        'cac:AdditionalDocumentReference': [],
        'cac:DiscrepancyResponse': null,
        'cac:BillingReference': null,
        'cac:AccountingSupplierParty': null,
        'cac:AccountingCustomerParty': null,
        'cac:TaxTotal': null,
        'cac:LegalMonetaryTotal': null,
        'cac:CreditNoteLine': []
    },
    '08': {
        'cbc:UBLVersionID': { _text: '2.1' },
        'cbc:CustomizationID': { _text: '2.0' },
        'cbc:ID': null,
        'cbc:IssueDate': null,
        'cbc:IssueTime': [],
        'cbc:Note': [],
        'cbc:DocumentCurrencyCode': null,
        'cac:DespatchDocumentReference': [],
        'cac:AdditionalDocumentReference': [],
        'cac:DiscrepancyResponse': null,
        'cac:BillingReference': null,
        'cac:AccountingSupplierParty': null,
        'cac:AccountingCustomerParty': null,
        'cac:TaxTotal': null,
        'cac:RequestedMonetaryTotal': null,
        'cac:DebitNoteLine': []
    },
    '09': {
        'cbc:UBLVersionID': { _text: '2.1' },
        'cbc:CustomizationID': { _text: '2.0' },
        'cbc:ID': null,
        'cbc:IssueDate': null,
        'cbc:IssueTime': [],
        'cbc:DespatchAdviceTypeCode': { _text: '09' },
        'cbc:Note': [],
        'cac:AdditionalDocumentReference': [],
        'cac:DespatchSupplierParty': null,
        'cac:DeliveryCustomerParty': null,
        'cac:BuyerCustomerParty': [],
        'cac:SellerSupplierParty': [],
        'cac:Shipment': [],
        'cac:DespatchLine': [],
    },
    '31': {
        'cbc:UBLVersionID': { _text: '2.1' },
        'cbc:CustomizationID': { _text: '2.0' },
        'cbc:ID': null,
        'cbc:IssueDate': null,
        'cbc:IssueTime': [],
        'cbc:DespatchAdviceTypeCode': { _text: '31' },
        'cbc:Note': [],
        'cac:AdditionalDocumentReference': [],
        'cac:DespatchSupplierParty': null,
        'cac:DeliveryCustomerParty': null,
        'cac:OriginatorCustomerParty': null,
        'cac:Shipment': [],
        'cac:DespatchLine': [],
    },
    '14': {
        'cbc:UBLVersionID': { _text: '2.1' },
        'cbc:CustomizationID': { _text: '2.0' },
        'cbc:ID': null,
        'cbc:IssueDate': null,
        'cbc:IssueTime': [],
        'cbc:DueDate': null,
        'cbc:InvoiceTypeCode': null,
        'cbc:Note': [],
        'cbc:DocumentCurrencyCode': null,
        'cac:InvoicePeriod': [],
        'cac:ContractDocumentReference': null,
        'cac:AccountingSupplierParty': null,
        'cac:AccountingCustomerParty': null,
        'cac:Delivery': [],
        'cac:TaxTotal': null,
        'cac:LegalMonetaryTotal': null,
        'cac:AllowanceCharge': [],
        'cac:InvoiceLine': [],
    },
} as const

export type documentType = keyof typeof emitBody

export type DocumentLoadedEvent = {
    type: documentType
    timestamp: number
}

/**
 * Store principal del documento activo.
 * Contiene todos los campos UBL del comprobante que se está editando.
 */
export const documentStore = writable<Record<string, any>>({})

/**
 * Store del tipo de documento activo.
 * Se mantiene separado del documentStore porque tipos como 07 y 08
 * no tienen cbc:InvoiceTypeCode en su plantilla.
 */
export const documentTypeStore = writable<documentType | null>(null)

/**
 * Se emite cada vez que loadDocument/initDocument reemplaza el store.
 * Los componentes lo usan para re-hidratar su estado local.
 */
export const documentLoaded = writable<DocumentLoadedEvent | null>(null)

function notifyDocumentLoaded(type: documentType) {
    documentLoaded.set({ type, timestamp: Date.now() })
}

/*
 * Carga un documento existente en el store.
 * Requiere pasar el tipo explícitamente para sincronizar documentTypeStore.
 * IMPORTANTE: el store se actualiza ANTES de emitir el evento,
 * para que los componentes suscritos lean los datos ya hidratados.
 */
export function loadDocument(json: Record<string, any>, type: documentType) {
    documentTypeStore.set(type)
    documentStore.set(json)
    notifyDocumentLoaded(type)
}

/*
 * Inicializa el store con la plantilla del tipo de documento seleccionado.
 * IMPORTANTE: el store se actualiza ANTES de emitir el evento.
 */
export function initDocument(type: documentType) {
    const template = emitBody[type]
    if (!template) throw new Error('Tipo de documento no soportado: ' + type)
    documentTypeStore.set(type)
    documentStore.set(structuredClone(template))
    notifyDocumentLoaded(type)
}

/** Resetea el store luego de emitir el documento */
export function resetDocument() {
    const type = get(documentTypeStore)
    if (!type) return

    const template = structuredClone(emitBody[type]) as Record<string, any>

    documentTypeStore.set(type)
    documentStore.set(template)
    notifyDocumentLoaded(type)

    documentResetKey.update(n => n + 1)
}

/**
 * Toma los datos del store y los estructura según el tipo de comprobante activo,
 * usando `emitBody` como esqueleto para respetar el orden de campos exigido por UBL.
 */
export function getDocumentOutput(): Record<string, any> {
    const doc    = get(documentStore)
    const type   = get(documentTypeStore)
    const config = get(runtimeConfigStore)
    if (!type || !emitBody[type]) return {}

    const template = emitBody[type]
    const output = Object.fromEntries(
        Object.keys(template).map((key) => {
            const fixedKeys = ['cbc:UBLVersionID', 'cbc:CustomizationID']
            return [key, fixedKeys.includes(key) ? (template as any)[key] : doc[key]]
        })
    )

    return {
        personaId:    config.personaId,
        personaToken: config.personaToken,
        fileName:     getDocumentFileName(),
        documentBody: output
    }
}

/**
 * Genera el nombre de archivo del comprobante en el formato estándar SUNAT:
 * `{RUC}-{TipoDoc}-{Serie}-{Número}`
 *
 * Ejemplo: `20321465978-03-B001-00000008`
 */
export function getDocumentFileName(): string {
    const doc        = get(documentStore)
    const ruc        = doc['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text
    const docType    = get(documentTypeStore)
    const documentID = doc['cbc:ID']?._text

    return `${ruc}-${docType}-${documentID}`
}

/**
 * Expone la API pública `window.apisunat` para integración con el web component `<sunat-invoice>`.
 */
;(window as any).apisunat = (config: any) => {
    customElements.whenDefined('sunat-invoice').then(() => {
        const el = document.querySelector('sunat-invoice') as any
        if (el) el.config = config
    })
}

;(window as any).apisunat.getOutput   = getDocumentOutput
;(window as any).apisunat.getFileName = getDocumentFileName