import { documentStore } from '$lib/store/document.store'
import { getDNIGETAsync, getRUCGETAsync } from '$lib/api/documents.api'
import { getCustomerCache, setCustomerCache } from './customer.cache'

type CustomerData = { name: string; address: string }

export function setCustomerActions(data: {
    typeDocument: string
    numberDocument: string
    name: string
    address: string
    phone?: string
    email?: string
}) {
    const isNoDocument = data.typeDocument === '-'

    documentStore.update(body => ({
        ...body,
        'cac:AccountingCustomerParty': {
            'cac:Party': {
                'cac:PartyIdentification': {
                    'cbc:ID': {
                        _attributes: { schemeID: isNoDocument ? '-' : data.typeDocument },
                        _text: isNoDocument ? '00000000' : data.numberDocument,
                    }
                },
                'cac:PartyLegalEntity': {
                    'cbc:RegistrationName': {
                        _text: data.name.trim() || '---'
                    },
                    ...(data.address && {
                        'cac:RegistrationAddress': {
                            'cac:AddressLine': {
                                'cbc:Line': { _text: data.address }
                            }
                        }
                    }),
                },
                ...((data.phone || data.email) && {
                    'cac:Contact': {
                        ...(data.phone && { 'cbc:Telephone': { _text: data.phone } }),
                        ...(data.email && { 'cbc:ElectronicMail': { _text: data.email } }),
                    }
                })
            }
        }
    }))
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

async function fetchDNI(numberDocument: string): Promise<CustomerData | null> {
    const json = await getDNIGETAsync(numberDocument)
    if (!json?.success) return null
    const d = json.data
    return {
        name: [d.nombre, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' '),
        address: buildAddress(d.domicilio),
    }
}

async function fetchRUC(numberDocument: string): Promise<CustomerData | null> {
    const json = await getRUCGETAsync(numberDocument)
    if (!json?.success) return null
    const d = json.data
    return {
        name: d.nombre ?? '',
        address: buildAddress(d.domicilio),
    }
}

const fetchers: Record<string, (nd: string) => Promise<CustomerData | null>> = {
    '1': fetchDNI,
    '6': fetchRUC,
}

export async function fetchCustomerByDocument(
    typeDocument: string,
    numberDocument: string
): Promise<CustomerData | null> {
    const cached = getCustomerCache(numberDocument)
    if (cached) return cached

    const fetcher = fetchers[typeDocument]
    if (!fetcher) return null

    try {
        const result = await fetcher(numberDocument)
        if (result) setCustomerCache(numberDocument, result)
        return result
    } catch {
        return null
    }
}