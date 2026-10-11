/**
 * Configuración de visualización de componentes por tipo de documento
 *
 * Uso desde HTML: config.display.componentName = false (para ocultar)
 * Los defaults están aquí solo como referencia
 */

// ==========================================
// FACTURAS Y BOLETAS (01, 03)
// ==========================================
export const INVOICE_DEFAULTS = {
  header: true,
  supplier: true,
  customer: true,
  lines: true,
  paymentTerms: true,
  detraccion: true,
  retention: true,
  notes: true,
  summary: true,
}

// ==========================================
// NOTAS DE CRÉDITO/DÉBITO (07, 08)
// ==========================================
export const NOTES_DEFAULTS = {
  header: true,
  billingReference: true,
  supplier: true,
  customer: true,
  lines: true,
  notes: true,
  summary: true,
}

// ==========================================
// GUÍA DE REMISIÓN REMITENTE (09, 31)
// ==========================================
export const WAYBILL_DEFAULTS = {
  header: true,
  supplier: true,
  deliveryCustomer: true,
  deliveryOptions: true,
  addresses: true,
  waybillItems: true,
  grossWeight: true,
  notes: true,
  relatedDocuments: true,
}
