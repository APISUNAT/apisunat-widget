import { documentStore } from '$lib/store/document.store'
import { getDNIGETAsync, getRUCGETAsync } from '$lib/api/documents.api'

export function setCustomerActions(data: {
  typeDocument: string
  numberDocument: string
  name: string
  address: string
  phone?: string
  email?: string
}) {
  const isNoDocument = data.typeDocument === '-'

  documentStore.update(body => {
    const current = body['cac:AccountingCustomerParty']?.['cac:Party'] ?? {}

    return {
      ...body,
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': {
              ...current['cac:PartyIdentification']?.['cbc:ID'],
              _attributes: {
                ...current['cac:PartyIdentification']?.['cbc:ID']?._attributes,
                schemeID: isNoDocument ? '-' : data.typeDocument,
              },
              _text: isNoDocument ? '00000000' : data.numberDocument,
            }
          },
          'cac:PartyLegalEntity': {
             'cbc:RegistrationName': {
                    _text: data.name?.trim() || '---'
                  },
              ...(data.address && {
                'cac:RegistrationAddress': {
                  'cac:AddressLine': {
                    'cbc:Line': { _text: data.address }
                  }
                }
              }),
            },
          ...(data.phone || data.email) && {
            'cac:Contact': {
              ...(data.phone && { 'cbc:Telephone': { _text: data.phone } }),
              ...(data.email && { 'cbc:ElectronicMail': { _text: data.email } }),
            }
          }
        }
      }
    }
  })
}

function buildAddress(domicilio: any): string {
  return [
    domicilio?.direccion,
    domicilio?.distrito,
    domicilio?.provincia,
    domicilio?.departamento,
  ]
    .filter(Boolean)
    .join(', ')
}

export async function fetchCustomerByDocument(
  typeDocument: string,
  numberDocument: string
): Promise<{ name: string; address: string } | null> {
  try {
    if (typeDocument === '1') {
      const json = await getDNIGETAsync(numberDocument)
      if (!json?.success) return null
      const d = json.data
      const name = [d.nombre, d.apellido_paterno, d.apellido_materno]
        .filter(Boolean)
        .join(' ')
      return { name, address: buildAddress(d.domicilio) }
    }

    if (typeDocument === '6') {
      const json = await getRUCGETAsync(numberDocument)
      if (!json?.success) return null
      const d = json.data
      return { name: d.nombre ?? '', address: buildAddress(d.domicilio) }
    }

    return null
  } catch {
    return null
  }
}