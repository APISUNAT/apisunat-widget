import { get } from 'svelte/store'
import { getLastDocumentPOSTAsync } from '$lib/api/documents.api'
import { runtimeConfigStore } from '$lib/store/config.store'

export interface CatalogItem {
  value: string
  label: string
}

export const OPERATIONS_BY_TYPE_DOCUMENT: Record<string, string[]> = {
  '01': ['0101', '1001', '0401', '2106', '0200', '0201', '0208', '0202', '0205', '0203', '0204', '0206', '0207'],
  '03': ['0101', '1001', '0401', '0200', '0201', '0208', '0205', '0203', '0204', '0206', '0207'],
}

export function filterOperationsByDocumentType(type: string, catalog: CatalogItem[]): CatalogItem[] {
  const allowed = OPERATIONS_BY_TYPE_DOCUMENT[type] ?? []
  return catalog.filter(op => allowed.includes(op.value))
}

export function buildHeaderDocumentAction(data: {
  series: string
  correlative: string
  documentType: string
  operationType: string
}) {
  return {
    'cbc:ID': { _text: `${data.series}-${data.correlative}` },
    'cbc:InvoiceTypeCode': {
      _text:       data.documentType,
      _attributes: { listID: data.operationType },
    },
  }
}

export async function loadLastDocumentAction(): Promise<{ series: string; correlative: string } | null> {
  const { serie } = get(runtimeConfigStore)
  if (!serie) return null

  const data = await getLastDocumentPOSTAsync()

  return {
    series:      data.serie,
    correlative: data.suggestedNumber
  }
}