export interface CustomerFieldsConfig {
  ruc?: boolean
  name?: boolean
  address?: boolean
  email?: boolean
  phone?: boolean
}

export interface InvoiceComponents {
  header?: boolean
  retention?: boolean
  supplier?: boolean
  customer?: boolean | CustomerFieldsConfig
  'customer.ruc'?: boolean
  'customer.name'?: boolean
  'customer.address'?: boolean
  'customer.email'?: boolean
  'customer.phone'?: boolean
  lines?: boolean
  paymentTerms?: boolean
}

export interface InvoiceConfig {
  type: '01' | '03' | '04' | '07' | '08' | '09' | '31' //Campo obligatorio
  personaId: string //Campo obligatorio
  personaToken: string  //Campo obligatorio
  serie? : string

  json?: Record<string, unknown>
  components?: InvoiceComponents
  onchange?: (json: Record<string, unknown>) => void
   onEmit?: (result: any) => void
  onError?: (error: unknown) => void
}