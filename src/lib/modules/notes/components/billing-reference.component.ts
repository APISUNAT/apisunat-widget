import { documentStore } from '$lib/store/document.store'
import { CATALOGO01 } from '$lib/constants/catalagos'
import { get } from 'svelte/store'

export interface BillingReferenceForm {
    serie: string
    correlativo: string
    issueDate: string
}

export const EMPTY_FORM: BillingReferenceForm = {
    serie: '',
    correlativo: '',
    issueDate: '',
}

/**
 * Infiere el código de tipo de documento (catálogo 01 de SUNAT) a partir
 * de la letra inicial de la serie: F -> Factura (01), B -> Boleta (03).
 * Devuelve null si la serie no empieza con F ni B (serie inválida o vacía).
 */
export function inferDocTypeCode(serie: string): '01' | '03' | null {
    const prefix = serie.trim().toUpperCase().charAt(0)
    if (prefix === 'F') return '01'
    if (prefix === 'B') return '03'
    return null
}

/**
 * Concatena serie + correlativo en el formato estándar "F001-00000001".
 * El correlativo se rellena con ceros a la izquierda hasta 8 dígitos.
 * Devuelve "" si falta alguno de los dos campos.
 */
export function buildFullId(serie: string, correlativo: string): string {
    const s = serie.trim().toUpperCase()
    const c = correlativo.trim().padStart(8, '0')
    return s && c ? `${s}-${c}` : ''
}

/**
 * Valida que el formulario tenga serie y correlativo no vacíos, y que
 * la serie permita inferir un tipo de documento válido (F o B).
 * Se usa para habilitar/deshabilitar el botón "Agregar referencia".
 */
export function isFormValid(form: BillingReferenceForm): boolean {
    return (
        form.serie.trim().length > 0 &&
        form.correlativo.trim().length > 0 &&
        inferDocTypeCode(form.serie) !== null
    )
}

// Traduce el código de tipo de documento (ej. '01') a su etiqueta legible
// (ej. "Factura") usando el catálogo 01.
function resolveDocTypeLabel(docTypeCode: string): string {
    return CATALOGO01.find((d) => d.value === docTypeCode)?.label ?? ''
}

// Lee el RUC del emisor (proveedor) directamente del documentStore actual.
// Se usa para identificar al emisor del documento referenciado dentro de
// cac:AdditionalDocumentReference.
function getSupplierRuc(): string | null {
    const doc = get(documentStore)
    return (
        doc?.['cac:AccountingSupplierParty']
            ?.['cac:Party']
            ?.['cac:PartyIdentification']
            ?.['cbc:ID']
            ?._text ?? null
    )
}

/**
 * Construye el nodo cac:AdditionalDocumentReference para el documento
 * que se está modificando (la Factura/Boleta original).
 */
function buildAdditionalRef(
    fullId: string,
    form: BillingReferenceForm,
    current: Record<string, any> = {},
) {
    const docTypeCode = inferDocTypeCode(form.serie)!
    const ruc = getSupplierRuc()
    return {
        ...current,
        'cbc:ID':               { _text: fullId },
        'cbc:DocumentTypeCode': { _text: "99" },
        'cbc:DocumentType':     { _text: resolveDocTypeLabel(docTypeCode) },
        ...(ruc && {
            'cac:IssuerParty': {
                ...current['cac:IssuerParty'],
                'cac:PartyIdentification': {
                    ...current['cac:IssuerParty']?.['cac:PartyIdentification'],
                    'cbc:ID': {
                        ...current['cac:IssuerParty']?.['cac:PartyIdentification']?.['cbc:ID'],
                        _attributes: { schemeID: '6' },
                        _text: ruc,
                    },
                },
            },
        }),
    }
}

/**
 * Construye el nodo cac:BillingReference > cac:InvoiceDocumentReference,
 * que es la referencia al documento que se está modificando
 * (obligatoria en Notas de Crédito/Débito).
 */
function buildBillingRef(
    fullId: string,
    form: BillingReferenceForm,
    current: Record<string, any> = {},
) {
    const docTypeCode = inferDocTypeCode(form.serie)!
    const currentInvoiceRef = current['cac:InvoiceDocumentReference'] ?? {}
    return {
        ...current,
        'cac:InvoiceDocumentReference': {
            ...currentInvoiceRef,
            'cbc:ID':               { _text: fullId },
            ...(form.issueDate.trim() && {
                'cbc:IssueDate': { _text: form.issueDate },
            }),
            'cbc:DocumentTypeCode': { _text: docTypeCode },
        },
    }
}

/**
 * Acción principal: toma los datos del formulario (serie, correlativo,
 * fecha) y escribe AMBOS nodos en el documentStore:
 * - cac:AdditionalDocumentReference (se agrega como nuevo elemento del arreglo,
 *   o se actualiza in-place si ya existe una entrada con el mismo fullId)
 * - cac:BillingReference (se actualiza preservando campos ajenos al formulario)
 *
 * Se llama cuando el usuario confirma el modal de "Documento que modifica".
 */
export function addBillingReferenceActions(form: BillingReferenceForm): void {
    const fullId = buildFullId(form.serie, form.correlativo)

    documentStore.update((doc) => {
        const currentBillingRef = doc['cac:BillingReference'] ?? {}

        const existingRefs = Array.isArray(doc['cac:AdditionalDocumentReference'])
            ? (doc['cac:AdditionalDocumentReference'] as any[])
            : []
        const existingIndex = existingRefs.findIndex((ref) => ref['cbc:ID']?._text === fullId)
        const currentAdditionalRef = existingIndex !== -1 ? existingRefs[existingIndex] : {}

        const newAdditionalRef = buildAdditionalRef(fullId, form, currentAdditionalRef)
        const additionalRefs = existingIndex !== -1
            ? existingRefs.map((ref, i) => (i === existingIndex ? newAdditionalRef : ref))
            : [...existingRefs, newAdditionalRef]

        return {
            ...doc,
            'cac:AdditionalDocumentReference': additionalRefs,
            'cac:BillingReference': buildBillingRef(fullId, form, currentBillingRef),
        }
    })
}

/**
 * Elimina la referencia al documento modificado: quita cac:BillingReference
 * por completo, y de cac:AdditionalDocumentReference borra SOLO la entrada
 * que coincide con el fullId referenciado (no todo el arreglo), para no
 * afectar otras referencias adicionales que pudieran existir por otro motivo.
 */
export function removeBillingRefActions(): void {
    documentStore.update((doc) => {
        const fullId = doc['cac:BillingReference']?.['cac:InvoiceDocumentReference']?.['cbc:ID']?._text

        const refs = Array.isArray(doc['cac:AdditionalDocumentReference'])
            ? doc['cac:AdditionalDocumentReference'] as any[]
            : []
        const filteredRefs = fullId
            ? refs.filter((ref) => ref['cbc:ID']?._text !== fullId)
            : refs

        const { 'cac:BillingReference': _, ...rest } = doc
        return { ...rest, 'cac:AdditionalDocumentReference': filteredRefs }
    })
}

/**
 * Elimina una sola entrada del arreglo cac:AdditionalDocumentReference por
 * índice, sin tocar cac:BillingReference. Útil si en el futuro se permiten
 * múltiples referencias adicionales independientes de la principal.
 */
export function removeAdditionalRefActions(index: number): void {
    documentStore.update((doc) => {
        const refs = Array.isArray(doc['cac:AdditionalDocumentReference'])
            ? [...doc['cac:AdditionalDocumentReference']]
            : []
        refs.splice(index, 1)
        return { ...doc, 'cac:AdditionalDocumentReference': refs }
    })
}