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

export function inferDocTypeCode(serie: string): '01' | '03' | null {
    const prefix = serie.trim().toUpperCase().charAt(0)
    if (prefix === 'F') return '01'
    if (prefix === 'B') return '03'
    return null
}

export function buildFullId(serie: string, correlativo: string): string {
    const s = serie.trim().toUpperCase()
    const c = correlativo.trim().padStart(8, '0')
    return s && c ? `${s}-${c}` : ''
}

export function isFormValid(form: BillingReferenceForm): boolean {
    return (
        form.serie.trim().length > 0 &&
        form.correlativo.trim().length > 0 &&
        form.issueDate.trim().length > 0 &&
        inferDocTypeCode(form.serie) !== null
    )
}

function resolveDocTypeLabel(docTypeCode: string): string {
    return CATALOGO01.find((d) => d.value === docTypeCode)?.label ?? ''
}

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

function buildAdditionalRef(fullId: string, form: BillingReferenceForm) {
    const docTypeCode = inferDocTypeCode(form.serie)!
    const ruc = getSupplierRuc()
    return {
        'cbc:ID':               { _text: fullId },
        'cbc:DocumentTypeCode': { _text: "99" },
        'cbc:DocumentType':     { _text: resolveDocTypeLabel(docTypeCode) },
        ...(ruc && {
            'cac:IssuerParty': {
                'cac:PartyIdentification': {
                    'cbc:ID': { _attributes: { schemeID: '6' }, _text: ruc },
                },
            },
        }),
    }
}

function buildBillingRef(fullId: string, form: BillingReferenceForm) {
    const docTypeCode = inferDocTypeCode(form.serie)!
    return {
        'cac:InvoiceDocumentReference': {
            'cbc:ID':               { _text: fullId },
            'cbc:IssueDate':        { _text: form.issueDate },
            'cbc:DocumentTypeCode': { _text: docTypeCode },
        },
    }
}

export function addBillingReferenceActions(form: BillingReferenceForm): void {
    const fullId = buildFullId(form.serie, form.correlativo)
    documentStore.update((doc) => ({
        ...doc,
        'cac:AdditionalDocumentReference': [
            ...((doc['cac:AdditionalDocumentReference'] as unknown[]) ?? []),
            buildAdditionalRef(fullId, form),
        ],
        'cac:BillingReference': buildBillingRef(fullId, form),
    }))
}

export function removeBillingRefActions(): void {
    documentStore.update((doc) => {
        const { 'cac:BillingReference': _, 'cac:AdditionalDocumentReference': __, ...rest } = doc
        return rest
    })
}
export function removeAdditionalRefActions(index: number): void {
    documentStore.update((doc) => {
        const refs = Array.isArray(doc['cac:AdditionalDocumentReference'])
            ? [...doc['cac:AdditionalDocumentReference']]
            : []
        refs.splice(index, 1)
        return { ...doc, 'cac:AdditionalDocumentReference': refs }
    })
}