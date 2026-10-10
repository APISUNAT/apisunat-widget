import { get } from 'svelte/store'
import { documentStore } from '$lib/store/document.store'
import { getDNIGETAsync, getRUCGETAsync } from '$lib/api/documents.api'
import { getBuyerCache, setBuyerCache } from './buyer-customer-party.cache'
import { isValidRuc } from '$lib/shared/utils/validation.utils'

type BuyerData = { name: string; address?: string }

export { isValidRuc }

/**
 * Establece los datos del comprador (BuyerCustomerParty)
 * Este campo solo se usa en traslados por venta con entrega a terceros (HandlingCode = 02)
 */
export function setBuyerCustomerPartyActions(data: {
  name: string
  numberDocument: string
  documentType: string
}) {
  documentStore.update(body => {
    // Si no hay datos, eliminar el campo completamente
    if (!data.name.trim() && !data.numberDocument.trim()) {
      const { 'cac:BuyerCustomerParty': _, ...rest } = body
      return rest
    }

    const buyerParty = {
      'cac:Party': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: {
              schemeID: data.documentType || '6'
            },
            _text: data.numberDocument
          }
        },
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text: data.name || '---'
          }
        }
      }
    }

    return {
      ...body,
      'cac:BuyerCustomerParty': buyerParty
    }
  })
}

/**
 * Obtiene los datos del comprador del store
 */
export function getBuyerCustomerPartyData(): {
  name: string
  numberDocument: string
  documentType: string
} {
  const doc = get(documentStore)
  const buyer = doc['cac:BuyerCustomerParty']

  // Si es un array vacío, retornar datos vacíos
  if (Array.isArray(buyer) && buyer.length === 0) {
    return { name: '', numberDocument: '', documentType: '6' }
  }

  const party = buyer?.['cac:Party']

  if (!party) {
    return { name: '', numberDocument: '', documentType: '6' }
  }

  return {
    name: party['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text ?? '',
    numberDocument: party['cac:PartyIdentification']?.['cbc:ID']?._text ?? '',
    documentType: party['cac:PartyIdentification']?.['cbc:ID']?._attributes?.schemeID ?? '6'
  }
}

/**
 * Busca datos del comprador por DNI
 */
async function fetchDNI(numberDocument: string): Promise<BuyerData | null> {
  const json = await getDNIGETAsync(numberDocument)
  if (!json?.success) return null
  const d = json.data
  return {
    name: [d.nombre, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' '),
  }
}

/**
 * Busca datos del comprador por RUC
 */
async function fetchRUC(numberDocument: string): Promise<BuyerData | null> {
  const json = await getRUCGETAsync(numberDocument)
  if (!json?.success) return null
  const d = json.data
  return {
    name: d.nombre ?? '',
  }
}

const fetchers: Record<string, (nd: string) => Promise<BuyerData | null>> = {
  '1': fetchDNI,
  '6': fetchRUC,
}

/**
 * Busca los datos del comprador por documento
 * Primero busca en caché (localStorage), si no encuentra hace la consulta a la API
 */
export async function fetchBuyerByDocument(
  typeDocument: string,
  numberDocument: string
): Promise<BuyerData | null> {
  // Primero intentar obtener del caché
  const cached = getBuyerCache(numberDocument)
  if (cached) return cached

  // Si no hay en caché, buscar en la API
  const fetcher = fetchers[typeDocument]
  if (!fetcher) return null

  try {
    const result = await fetcher(numberDocument)
    // Guardar en caché si se obtuvo resultado
    if (result) setBuyerCache(numberDocument, result)
    return result
  } catch {
    return null
  }
}
