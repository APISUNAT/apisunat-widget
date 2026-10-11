import { documentStore } from '$lib/store/document.store'
import { derived } from 'svelte/store'

export const savedRelatedDocuments = derived(documentStore, ($doc) =>
  ($doc['cac:AdditionalDocumentReference'] ?? [])
    .map((d: any, i: number) => ({ ...d, _originalIndex: i }))
)

export function addRelatedDocumentAction(data: {
  documentTypeCode: string
  documentId: string
  documentType?: string
}) {
  documentStore.update((body) => ({
    ...body,
    'cac:AdditionalDocumentReference': [
      ...(body['cac:AdditionalDocumentReference'] ?? []),
      {
        'cbc:ID': {
          _text: data.documentId,
        },
        'cbc:DocumentTypeCode': {
          _text: data.documentTypeCode,
        },
        ...(data.documentType ? {
          'cbc:DocumentType': {
            _text: data.documentType,
          }
        } : {})
      },
    ],
  }))
}

export function removeRelatedDocumentAction(index: number) {
  documentStore.update((body) => ({
    ...body,
    'cac:AdditionalDocumentReference': (body['cac:AdditionalDocumentReference'] ?? []).filter(
      (_: any, i: number) => i !== index
    ),
  }))
}
