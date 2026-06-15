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

export function maxLengthInput(typeDocument: string): number {
  if (typeDocument === '6') return 11
  if (typeDocument === '1') return 8
  return 15
}

export function isValidRuc(ruc: string): boolean {
  return /^(10|15|17|20)\d{9}$/.test(ruc)
}

export function handleNoDocumentSelection(typeDocument: string): boolean {
  return typeDocument === '-'
}

export function isDocumentComplete(typeDocument: string, numberDocument: string): boolean {
  if (typeDocument === '6') return numberDocument.length === 11 && isValidRuc(numberDocument)
  if (typeDocument === '1') return numberDocument.length === 8
  return false
}