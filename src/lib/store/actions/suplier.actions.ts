import { documentStore } from '../document.store'

export function setSupplier(data: {
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