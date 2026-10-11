import { get } from 'svelte/store'
import { documentStore } from '$lib/store/document.store'
import { getDNIGETAsync, getRUCGETAsync } from '$lib/api/documents.api'
import { getSellerCache, setSellerCache } from './seller-supplier-party.cache'
import { isValidRuc } from '$lib/shared/utils/validation.utils'

type SellerData = { name: string; address?: string }

export { isValidRuc }

/**
 * Establece los datos del proveedor vendedor (SellerSupplierParty)
 * Este campo solo se usa en traslados por compra (HandlingCode = 02)
 */
export function setSellerSupplierPartyActions(data: {
  name: string
  numberDocument: string
  documentType: string
}) {
  documentStore.update(body => {
    // Si no hay datos, eliminar el campo completamente
    if (!data.name.trim() && !data.numberDocument.trim()) {
      const { 'cac:SellerSupplierParty': _, ...rest } = body
      return rest
    }

    const sellerParty = {
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
      'cac:SellerSupplierParty': sellerParty
    }
  })
}

/**
 * Obtiene los datos del proveedor vendedor del store
 */
export function getSellerSupplierPartyData(): {
  name: string
  numberDocument: string
  documentType: string
} {
  const doc = get(documentStore)
  const seller = doc['cac:SellerSupplierParty']

  // Si es un array vacío, retornar datos vacíos
  if (Array.isArray(seller) && seller.length === 0) {
    return { name: '', numberDocument: '', documentType: '6' }
  }

  const party = seller?.['cac:Party']

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
 * Busca datos del proveedor por DNI
 */
async function fetchDNI(numberDocument: string): Promise<SellerData | null> {
  const json = await getDNIGETAsync(numberDocument)
  if (!json?.success) return null
  const d = json.data
  return {
    name: [d.nombre, d.apellido_paterno, d.apellido_materno].filter(Boolean).join(' '),
  }
}

/**
 * Busca datos del proveedor por RUC
 */
async function fetchRUC(numberDocument: string): Promise<SellerData | null> {
  const json = await getRUCGETAsync(numberDocument)
  if (!json?.success) return null
  const d = json.data
  return {
    name: d.nombre ?? '',
  }
}

const fetchers: Record<string, (nd: string) => Promise<SellerData | null>> = {
  '1': fetchDNI,
  '6': fetchRUC,
}

/**
 * Busca los datos del proveedor por documento
 * Primero busca en caché (localStorage), si no encuentra hace la consulta a la API
 */
export async function fetchSellerByDocument(
  typeDocument: string,
  numberDocument: string
): Promise<SellerData | null> {
  // Primero intentar obtener del caché
  const cached = getSellerCache(numberDocument)
  if (cached) return cached

  // Si no hay en caché, buscar en la API
  const fetcher = fetchers[typeDocument]
  if (!fetcher) return null

  try {
    const result = await fetcher(numberDocument)
    // Guardar en caché si se obtuvo resultado
    if (result) setSellerCache(numberDocument, result)
    return result
  } catch {
    return null
  }
}
