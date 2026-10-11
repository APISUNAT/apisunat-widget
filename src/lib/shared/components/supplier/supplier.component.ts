import { get } from 'svelte/store'
import { documentStore, documentTypeStore } from '$lib/store/document.store'
import { isValidRuc, isDocumentComplete } from '$lib/shared/utils/validation.utils'

export { isValidRuc }

export function setSupplierActions(data: {
  supplier: string
  tradeName: string
  numberDocument: string
  codeAddress?: string
  address: string
}) {
  const docType = get(documentTypeStore)
  const isGuiaRemision = docType === '09' || docType === '31'
  const supplierKey = isGuiaRemision ? 'cac:DespatchSupplierParty' : 'cac:AccountingSupplierParty'

  documentStore.update(body => {
    const current = body[supplierKey]?.['cac:Party'] ?? {}

    const partyData = {
      ...body[supplierKey],
      'cac:Party': {
        ...current,
        'cac:PartyIdentification': {
          ...current['cac:PartyIdentification'],
          'cbc:ID': {
            ...current['cac:PartyIdentification']?.['cbc:ID'],
            _attributes: {
              ...current['cac:PartyIdentification']?.['cbc:ID']?._attributes,
              schemeID: '6',
            },
            _text: data.numberDocument,
          }
        },
        ...(data.tradeName.trim().length >= 3 ? {
          'cac:PartyName': {
            'cbc:Name': { _text: data.tradeName }
          }
        } : {
          'cac:PartyName': undefined
        }),
        'cac:PartyLegalEntity': {
          ...current['cac:PartyLegalEntity'],
          'cbc:RegistrationName': { _text: data.supplier },
          'cac:RegistrationAddress': {
            ...current['cac:PartyLegalEntity']?.['cac:RegistrationAddress'],
            // Solo agregar AddressTypeCode si NO es guía de remisión
            ...(!isGuiaRemision ? {
              'cbc:AddressTypeCode': { _text: data.codeAddress || '0000' }
            } : {}),
            ...(data.address.trim().length >= 3 ? {
              'cac:AddressLine': {
                ...current['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.['cac:AddressLine'],
                'cbc:Line': { _text: data.address }
              }
            } : {
              'cac:AddressLine': undefined
            }),
          }
        }
      }
    }

    return {
      ...body,
      [supplierKey]: partyData
    }
  })
}

export function getSupplierData(): {
  name: string
  tradeName: string
  ruc: string
  codeAddress: string
  address: string
} {
  const doc = get(documentStore)
  const docType = get(documentTypeStore)
  const isGuiaRemision = docType === '09' || docType === '31'
  const supplierKey = isGuiaRemision ? 'cac:DespatchSupplierParty' : 'cac:AccountingSupplierParty'
  const party = doc[supplierKey]?.['cac:Party']

  if (!party) return { tradeName: '', name: '', ruc: '', address: '', codeAddress: '' }

  return {
    tradeName:   party['cac:PartyName']?.['cbc:Name']?._text ?? '',
    name:        party['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text ?? '',
    ruc:         party['cac:PartyIdentification']?.['cbc:ID']?._text ?? '',
    codeAddress: party['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.['cbc:AddressTypeCode']?._text ?? '0000',
    address:     party['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.['cac:AddressLine']?.['cbc:Line']?._text ?? '',
  }
}

export function isRucComplete(ruc: string): boolean {
  return isDocumentComplete('6', ruc)
}