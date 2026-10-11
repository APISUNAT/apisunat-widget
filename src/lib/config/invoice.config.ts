export interface InvoiceComponents {
  header?: boolean
  supplier?: boolean
  customer?: boolean
  retention?: boolean
  paymentTerms?: boolean
  lines?: boolean
  deliveryOptions?: boolean
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