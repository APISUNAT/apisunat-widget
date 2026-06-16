import { get } from 'svelte/store'
import { documentStore } from '$lib/store/document.store'

export function setSupplierActions(data: {
  supplier: string
  numberDocument: string
  codeAdress?: string
  address: string
}) {
  documentStore.update(body => {
    const current = body['cac:AccountingSupplierParty']?.['cac:Party'] ?? {}

    return {
      ...body,
      'cac:AccountingSupplierParty': {
        ...body['cac:AccountingSupplierParty'],
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
          'cac:PartyLegalEntity': {
            ...current['cac:PartyLegalEntity'],
            'cbc:RegistrationName': { _text: data.supplier },
            'cac:RegistrationAddress': {
              ...current['cac:PartyLegalEntity']?.['cac:RegistrationAddress'],
              'cbc:AddressTypeCode': { _text: data.codeAdress || '0000' },
              'cac:AddressLine': {
                ...current['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.['cac:AddressLine'],
                'cbc:Line': { _text: data.address }
              }
            }
          }
        }
      }
    }
  })
}

export function getSupplierData(): {
  name: string
  ruc: string
  address: string
} {
  const doc = get(documentStore)
  const party = doc['cac:AccountingSupplierParty']?.['cac:Party']

  if (!party) return { name: '', ruc: '', address: '' }

  return {
    name:    party['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text ?? '',
    ruc:     party['cac:PartyIdentification']?.['cbc:ID']?._text ?? '',
    address: party['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.['cac:AddressLine']?.['cbc:Line']?._text ?? '',
  }
}
export function isValidRuc(ruc: string): boolean {
  return /^(10|15|17|20)\d{9}$/.test(ruc)
}

export function isRucComplete(ruc: string): boolean {
  return ruc.length === 11 && isValidRuc(ruc)
}