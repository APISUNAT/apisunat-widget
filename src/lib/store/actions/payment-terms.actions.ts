import { documentStore } from '../document.store'

export type PaymentMethod = 'Contado' | 'Credito'

export type Cuota = {
  id: number
  monto: string
  vencimiento: string
}

export function setPaymentContado() {
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

export function setPaymentCredito(total: number, cuotas: Cuota[]) {
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

export function clearPaymentTerms() {
  documentStore.update(body => ({
    ...body,
    'cac:PaymentTerms': [],
  }))
}