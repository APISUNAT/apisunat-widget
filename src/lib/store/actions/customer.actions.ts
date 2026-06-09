import { documentStore } from '../document.store'

export function setCustomer(data: {
  typeDocument: string
  numberDocument: string
  name: string
  address: string
  phone?: string
  email?: string
}) {
  documentStore.update(body => ({
    ...body,
    'cac:AccountingCustomerParty': {
      'cac:Party': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: { schemeID: data.typeDocument },
            _text: data.numberDocument
          }
        },
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': { _text: data.name },
          'cac:RegistrationAddress': {
            'cac:AddressLine': {
              'cbc:Line': { _text: data.address }
            }
          }
        },
        ...(data.phone || data.email) && {
          'cac:Contact': {
            ...(data.phone && { 'cbc:Telephone':      { _text: data.phone } }),
            ...(data.email && { 'cbc:ElectronicMail': { _text: data.email } }),
          }
        }
      }
    }
  }))
}