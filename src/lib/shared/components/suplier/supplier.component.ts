import { get } from 'svelte/store'
import { documentStore } from '$lib/store/document.store'

export function setSupplierActions(data: {
  supplier: string
  numberDocument: string
  address: string
}) {
  documentStore.update(body => ({
    ...body,
    'cac:AccountingSupplierParty': {
      'cac:Party': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: { schemeID: '6' },
            _text: data.numberDocument
          }
        },
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': { _text: data.supplier },
          'cac:RegistrationAddress': {
            'cbc:AddressTypeCode': { _text: '0000' },
            'cac:AddressLine': {
              'cbc:Line': { _text: data.address }
            }
          }
        }
      }
    }
  }))
}

export function getSupplierData(): {
  name: string
  ruc: string
  address: string
} {
  const doc = get(documentStore)
  const party = doc['cac:AccountingSupplierParty']?.['cac:Party']

  if (!party) {
    return { name: '', ruc: '', address: '' }
  }

  const name =
    party['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text ?? ''

  const ruc =
    party['cac:PartyIdentification']?.['cbc:ID']?._text ?? ''

  const address =
    party['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.[
      'cac:AddressLine'
    ]?.['cbc:Line']?._text ?? ''

  return { name, ruc, address }
}