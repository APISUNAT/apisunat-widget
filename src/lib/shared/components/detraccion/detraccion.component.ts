import { documentStore } from '$lib/store/document.store'

export interface DetraccionData {
  tipoBien: string      // Código del bien/servicio (CATALOGO54)
  cuenta: string        // Número de cuenta bancaria
  porcentaje: number    // Porcentaje de detracción
  monto: number         // Monto de detracción
  metodoPago: string    // Método de pago (catalogo59)
}

/**
 * Actualiza los datos de detracción en el documento
 */
export function setDetraccionActions(data: DetraccionData) {
  documentStore.update((body) => {
    const newBody = { ...body }

    // 1. Actualizar cac:PaymentTerms con la detracción
    const paymentTerms = Array.isArray(newBody['cac:PaymentTerms'])
      ? [...newBody['cac:PaymentTerms']]
      : []

    // Remover detracción existente
    const filteredTerms = paymentTerms.filter(
      (t: any) => t['cbc:ID']?._text !== 'Detraccion'
    )

    // Agregar nueva detracción
    if (data.tipoBien && (data.porcentaje > 0 || data.monto > 0)) {
      const currency =  'PEN'

      filteredTerms.push({
        'cbc:ID': { _text: 'Detraccion' },
        'cbc:PaymentMeansID': { _text: data.tipoBien },
        'cbc:PaymentPercent': { _text: data.porcentaje },
        'cbc:Amount': {
          _attributes: { currencyID: currency },
          _text: data.monto
        }
      })
    }

    newBody['cac:PaymentTerms'] = filteredTerms

    // 2. Actualizar cac:PaymentMeans con cuenta y/o método de pago
    // (independientes entre sí: uno no depende del otro para guardarse)
    const paymentMeans = Array.isArray(newBody['cac:PaymentMeans'])
      ? [...newBody['cac:PaymentMeans']]
      : []

    // Remover detracción existente
    const filteredMeans = paymentMeans.filter(
      (m: any) => m['cbc:ID']?._text !== 'Detraccion'
    )

    // Agregar nueva detracción si hay al menos un dato (cuenta o método de pago)
    if (data.cuenta || data.metodoPago) {
      filteredMeans.push({
        'cbc:ID': { _text: 'Detraccion' },
        ...(data.metodoPago && {
          'cbc:PaymentMeansCode': { _text: data.metodoPago }
        }),
        ...(data.cuenta && {
          'cac:PayeeFinancialAccount': {
            'cbc:ID': { _text: data.cuenta }
          }
        })
      })
    }

    newBody['cac:PaymentMeans'] = filteredMeans

    return newBody
  })
}

/**
 * Remueve la detracción del documento
 */
export function removeDetraccionActions() {
  documentStore.update((body) => {
    const newBody = { ...body }

    // Remover de PaymentTerms
    if (Array.isArray(newBody['cac:PaymentTerms'])) {
      newBody['cac:PaymentTerms'] = newBody['cac:PaymentTerms'].filter(
        (t: any) => t['cbc:ID']?._text !== 'Detraccion'
      )
    }

    // Remover de PaymentMeans
    if (Array.isArray(newBody['cac:PaymentMeans'])) {
      newBody['cac:PaymentMeans'] = newBody['cac:PaymentMeans'].filter(
        (m: any) => m['cbc:ID']?._text !== 'Detraccion'
      )
    }

    return newBody
  })
}

/**
 * Calcula el monto de detracción basado en el porcentaje y total
 */
export function calcularMontoPorPorcentaje(porcentaje: number, total: number): number {
  if (porcentaje <= 0 || total <= 0) return 0
  return Number(((porcentaje / 100) * total).toFixed(2))
}

/**
 * Calcula el porcentaje de detracción basado en el monto y total
 */
export function calcularPorcentajePorMonto(monto: number, total: number): number {
  if (monto <= 0 || total <= 0) return 0
  return Number(((monto / total) * 100).toFixed(2))
}

/**
 * Obtiene los datos actuales de detracción del documento
 */
export function getDetraccionFromDocument(doc: any): Partial<DetraccionData> | null {
  const paymentTerms = doc['cac:PaymentTerms']
  const paymentMeans = doc['cac:PaymentMeans']

  if (!Array.isArray(paymentTerms) && !Array.isArray(paymentMeans)) {
    return null
  }

  const detraccionTerm = Array.isArray(paymentTerms)
    ? paymentTerms.find((t: any) => t['cbc:ID']?._text === 'Detraccion')
    : null

  const detraccionMean = Array.isArray(paymentMeans)
    ? paymentMeans.find((m: any) => m['cbc:ID']?._text === 'Detraccion')
    : null

  if (!detraccionTerm && !detraccionMean) return null

  return {
    tipoBien: detraccionTerm?.['cbc:PaymentMeansID']?._text ?? '',
    porcentaje: Number(detraccionTerm?.['cbc:PaymentPercent']?._text ?? 0),
    monto: Number(detraccionTerm?.['cbc:Amount']?._text ?? 0),
    cuenta: detraccionMean?.['cac:PayeeFinancialAccount']?.['cbc:ID']?._text ?? '',
    metodoPago: detraccionMean?.['cbc:PaymentMeansCode']?._text ?? '',
  }
}