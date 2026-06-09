import { documentStore } from '../document.store'

export function setDocumentReference(data: {
    id: string
    documentTypeCode: string
    documentType: string
    identificationDocumentType?: string
    identificationDocumentNumber?: string
}) {
    documentStore.update(body => ({
        ...body,
        'cac:AdditionalDocumentReference': [
            ...(body['cac:AdditionalDocumentReference'] ?? []), 
            {
                'cbc:ID': { _text: data.id },
                'cbc:DocumentTypeCode': { _text: data.documentTypeCode },
                'cbc:DocumentType': { _text: data.documentType },
                ...(data.identificationDocumentType && data.identificationDocumentNumber
                    ? {
                        'cac:IssuerParty': {
                            'cac:PartyIdentification': {
                                'cbc:ID': {
                                    _attributes: { schemeID: data.identificationDocumentType },
                                    _text: data.identificationDocumentNumber
                                }
                            }
                        }
                    }
                    : {}
                )
            }
        ]
    }))
}