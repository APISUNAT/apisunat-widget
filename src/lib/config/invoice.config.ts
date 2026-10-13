export interface DisplayConfig {
  header?: boolean
  headerOptions?: boolean
  supplier?: boolean
  customer?: boolean
  lines?: boolean
  paymentTerms?: boolean
  detraccion?: boolean
  retention?: boolean
  notes?: boolean
  summary?: boolean
  billingReference?: boolean
  deliveryCustomer?: boolean
  deliveryOptions?: boolean
  addresses?: boolean
  waybillItems?: boolean
  grossWeight?: boolean
  relatedDocuments?: boolean
}

export interface WidgetConfig {
  display?: DisplayConfig
  order?: string[] | null
}

export interface InvoiceConfig {
  type: '01' | '03' | '04' | '07' | '08' | '09' | '31' //Campo obligatorio
  personaId: string //Campo obligatorio
  personaToken: string  //Campo obligatorio
  serie? : string

  json?: Record<string, unknown>
  config?: WidgetConfig
  onchange?: (json: Record<string, unknown>) => void
   onEmit?: (result: any) => void
  onError?: (error: unknown) => void
}