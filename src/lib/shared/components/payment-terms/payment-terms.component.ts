import { documentStore } from '$lib/store/document.store'

export type Cuota = {
  id: number
  monto: string
  vencimiento: string
}

export type CuotaError = {
  monto?: string
  vencimiento?: string
}

export function validateCuotas(
  cuotas: Cuota[],
  total: number,
  emisionDate: string,
  montoDetraccion: number = 0,
  currency: string = 'PEN'
): Record<number, CuotaError> {
  const errors: Record<number, CuotaError> = {}
  const totalFinanciable = currency === 'PEN' ? total - montoDetraccion : total

  cuotas.forEach((cuota, i) => {
    const err: CuotaError = {}
    const suma = cuotas.reduce((s, c) => s + (parseFloat(c.monto) || 0), 0)

    if (parseFloat(cuota.monto) > 0 && suma > totalFinanciable + 0.01) {
      err.monto = `La suma de cuotas (${suma.toFixed(2)}) excede el total a financiar (${totalFinanciable.toFixed(2)})`
    }

    if (cuota.vencimiento) {
      if (i === 0 && emisionDate && cuota.vencimiento <= emisionDate) {
        err.vencimiento = 'Debe ser posterior a la fecha de emisión'
      }
      if (i > 0 && cuotas[i - 1].vencimiento && cuota.vencimiento <= cuotas[i - 1].vencimiento) {
        err.vencimiento = `Debe ser posterior a la cuota ${i}`
      }
    }

    if (Object.keys(err).length) errors[cuota.id] = err
  })

  return errors
}

/**
 * Elimina del array actual todas las entradas de FormaPago/Cuota,
 * preservando cualquier otra entrada (p. ej. Detraccion) que ya exista.
 */
function preservarTerminosNoFormaPago(body: any): object[] {
  const terms = Array.isArray(body['cac:PaymentTerms']) ? body['cac:PaymentTerms'] : []
  return terms.filter((t: any) => t['cbc:ID']?._text !== 'FormaPago')
}

export function setPaymentContadoActions() {
  documentStore.update((body) => {
    const preservados = preservarTerminosNoFormaPago(body)

    return {
      ...body,
      'cac:PaymentTerms': [
        ...preservados,
        {
          'cbc:ID': { _text: 'FormaPago' },
          'cbc:PaymentMeansID': { _text: 'Contado' },
        },
      ],
    }
  })
}

export function setPaymentCreditoActions(
  total: number,
  cuotas: Cuota[],
  montoDetraccion: number = 0,
  currency: string = 'PEN'
) {
  const totalFinanciable = Number(
    (currency === 'PEN' ? total - montoDetraccion : total).toFixed(2)
  )

  const formaPagoTerms: object[] = [
    {
      'cbc:ID': { _text: 'FormaPago' },
      'cbc:PaymentMeansID': { _text: 'Credito' },
      'cbc:Amount': { _attributes: { currencyID: currency }, _text: totalFinanciable },
    },
  ]

  cuotas
    .filter((cuota) => parseFloat(cuota.monto) > 0 || cuota.vencimiento)
    .forEach((cuota, i) => {
      const num = String(i + 1).padStart(3, '0')
      const entry: Record<string, unknown> = {
        'cbc:ID': { _text: 'FormaPago' },
        'cbc:PaymentMeansID': { _text: `Cuota${num}` },
        'cbc:Amount': {
          _attributes: { currencyID: currency },
          _text: parseFloat(cuota.monto) || 0,
        },
      }
      if (cuota.vencimiento) {
        entry['cbc:PaymentDueDate'] = { _text: cuota.vencimiento }
      }
      formaPagoTerms.push(entry)
    })

  documentStore.update((body) => {
    const preservados = preservarTerminosNoFormaPago(body)

    return {
      ...body,
      'cac:PaymentTerms': [...preservados, ...formaPagoTerms],
    }
  })
}