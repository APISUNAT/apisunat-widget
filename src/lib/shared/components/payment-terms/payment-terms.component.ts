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
  emisionDate: string
): Record<number, CuotaError> {
  const errors: Record<number, CuotaError> = {}

  cuotas.forEach((cuota, i) => {
    const err: CuotaError = {}
    const suma = cuotas.reduce((s, c) => s + (parseFloat(c.monto) || 0), 0)

    if (parseFloat(cuota.monto) > 0 && suma > total + 0.01) {
      err.monto = `La suma de cuotas (S/ ${suma.toFixed(2)}) excede el total (S/ ${total.toFixed(2)})`
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

export function setPaymentContadoActions() {
  documentStore.update(body => ({
    ...body,
    'cac:PaymentTerms': [
      {
        'cbc:ID': { _text: 'FormaPago' },
        'cbc:PaymentMeansID': { _text: 'Contado' },
      },
    ],
  }))
}

export function setPaymentCreditoActions(total: number, cuotas: Cuota[]) {
  const terms: object[] = [
    {
      'cbc:ID': { _text: 'FormaPago' },
      'cbc:PaymentMeansID': { _text: 'Credito' },
      'cbc:Amount': { _attributes: { currencyID: 'PEN' }, _text: total },
    },
  ]

  cuotas.forEach((cuota, i) => {
    const num = String(i + 1).padStart(3, '0')
    const entry: Record<string, unknown> = {
      'cbc:ID': { _text: 'FormaPago' },
      'cbc:PaymentMeansID': { _text: `Cuota${num}` },
      'cbc:Amount': {
        _attributes: { currencyID: 'PEN' },
        _text: parseFloat(cuota.monto) || 0,
      },
    }
    if (cuota.vencimiento) {
      entry['cbc:PaymentDueDate'] = { _text: cuota.vencimiento }
    }
    terms.push(entry)
  })

  documentStore.update(body => ({
    ...body,
    'cac:PaymentTerms': terms,
  }))
}