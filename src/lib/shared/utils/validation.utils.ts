/**
 * Utilidades de validación centralizadas para documentos peruanos
 */

/**
 * Valida que un string no esté vacío (elimina espacios en blanco)
 */
export function isEmpty(value: string | undefined | null): boolean {
  return !value?.trim();
}

/**
 * Valida un RUC peruano
 * - Debe comenzar con 10, 15, 16, 17 o 20
 * - Debe tener exactamente 11 dígitos
 */
export function isValidRuc(ruc: string): boolean {
  return /^(10|15|16|17|20)\d{9}$/.test(ruc);
}

/**
 * Valida un DNI peruano
 * - Debe tener exactamente 8 dígitos
 */
export function isValidDNI(dni: string): boolean {
  return /^\d{8}$/.test(dni);
}

/**
 * Retorna la longitud máxima según el tipo de documento
 * @param typeDocument - Código del tipo de documento (catálogo 06)
 * @returns Longitud máxima permitida
 */
export function getMaxLengthByDocumentType(typeDocument: string): number {
  if (typeDocument === '6') return 11; // RUC
  if (typeDocument === '1') return 8;  // DNI
  return 15; // Otros documentos
}

/**
 * Verifica si un documento está completo y es válido
 * @param typeDocument - Código del tipo de documento
 * @param numberDocument - Número del documento
 * @returns true si el documento está completo y es válido
 */
export function isDocumentComplete(typeDocument: string, numberDocument: string): boolean {
  if (typeDocument === '6') {
    return numberDocument.length === 11 && isValidRuc(numberDocument);
  }
  if (typeDocument === '1') {
    return numberDocument.length === 8 && isValidDNI(numberDocument);
  }
  return false;
}

/**
 * Valida si el tipo de documento requiere selección (no es "-")
 */
export function requiresDocumentSelection(typeDocument: string): boolean {
  return typeDocument !== '-';
}
