export interface InvoiceComponents {
  header?: boolean
  supplier?: boolean
  customer?: boolean
  lines?: boolean
  paymentTerms?: boolean
}

export interface InvoiceConfig {
  type: '01' | '03' | '07' | '08' //Unico campo obligatorio
  title?: string
  json?: Record<string, unknown>
  components?: InvoiceComponents
  onchange?: (json: Record<string, unknown>) => void
}