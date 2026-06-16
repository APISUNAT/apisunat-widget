import { documentStore } from '$lib/store/document.store'
import { getDNIGETAsync, getRUCGETAsync } from '$lib/api/documents.api'
import {
    getCustomerCache,
    setCustomerCache
} from './customer.cache'

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
    const cached = getCustomerCache(numberDocument)

    if (cached) {
        return cached
    }



    try {
        let result: { name: string; address: string } | null = null

        if (typeDocument === '1') {
            const json = await getDNIGETAsync(numberDocument)

            if (!json?.success) return null

            const d = json.data

            result = {
                name: [
                    d.nombre,
                    d.apellido_paterno,
                    d.apellido_materno
                ]
                    .filter(Boolean)
                    .join(' '),
                address: buildAddress(d.domicilio)
            }
        }

        if (typeDocument === '6') {
            const json = await getRUCGETAsync(numberDocument)

            if (!json?.success) return null

            const d = json.data

            result = {
                name: d.nombre ?? '',
                address: buildAddress(d.domicilio)
            }
        }

        if (result) {
            setCustomerCache(numberDocument, result)
        }

        return result
    } catch {
        return null
    }
}