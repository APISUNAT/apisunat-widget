import { get } from 'svelte/store'
import { documentStore } from '$lib/store/document.store'

export function setSupplierActions(data: {
  supplier: string
  numberDocument: string
  address: string
  addressTypeCode?: string
  tradeName?: string
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
        ...(data.tradeName && {
          'cac:PartyName': {
            'cbc:Name': { _text: data.tradeName }
          }
        }),
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': { _text: data.supplier },
          'cac:RegistrationAddress': {
            'cbc:AddressTypeCode': { _text: data.addressTypeCode ?? '0000' },
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
  tradeName: string
  addressTypeCode: string
} {
  const doc   = get(documentStore)
  const party = doc['cac:AccountingSupplierParty']?.['cac:Party']

  if (!party) {
    return { name: '', ruc: '', address: '', tradeName: '', addressTypeCode: '0000' }
  }

  const name =
    party['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text ?? ''

  const ruc =
    party['cac:PartyIdentification']?.['cbc:ID']?._text ?? ''

  const address =
    party['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.['cac:AddressLine']?.['cbc:Line']?._text ?? ''

  const tradeName =
    party['cac:PartyName']?.['cbc:Name']?._text ?? ''

  const addressTypeCode =
    party['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.['cbc:AddressTypeCode']?._text ?? '0000'

  return { name, ruc, address, tradeName, addressTypeCode }
}