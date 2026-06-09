export const DOCUMENT_TYPE_ALLOWED: Record<string, string[]> = {
  '01': ['6'],
  '03': ['-', '1', '6', 'H', '7', '4', 'E', 'A', 'G', 'C', 'D', 'B', '0'],
}

export function getFilteredCatalogo(
  catalogoOptions: { value: string; label: string }[],
  documentType: string
) {
  const allowed = DOCUMENT_TYPE_ALLOWED[documentType]
  if (!allowed) return catalogoOptions
  return catalogoOptions.filter(opt => allowed.includes(opt.value))
}

export function getDefaultTypeDocument(documentType: string, current: string): string {
  const allowed = DOCUMENT_TYPE_ALLOWED[documentType]
  if (!allowed) return current
  if (allowed.includes(current)) return current
  return ''
}