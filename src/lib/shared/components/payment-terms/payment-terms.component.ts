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

export function getCreditoAmountFromTerms(terms: unknown): number {
  if (!Array.isArray(terms)) return 0
  const credito = terms.find((t: any) => t?.['cbc:PaymentMeansID']?._text === 'Credito')
  const amount = Number(credito?.['cbc:Amount']?._text ?? 0)
  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

export function sumCuotaAmounts(cuotas: Cuota[]): number {
  return cuotas
    .filter((cuota) => parseFloat(cuota.monto) > 0 || cuota.vencimiento)
    .reduce((suma, cuota) => suma + (parseFloat(cuota.monto) || 0), 0)
}

/**
 * Tope a financiar: en PEN es total − detracción. En otra moneda la detracción
 * está en soles y no se puede restar del total; se usa el Credito que ya
 * entregó el host (neto pendiente).
 */
export function resolveFinanciableCap(
  total: number,
  montoDetraccion: number = 0,
  currency: string = 'PEN',
  existingCreditoAmount: number = 0,
): number {
  if (currency === 'PEN') {
    return Number((total - montoDetraccion).toFixed(2))
  }
  if (Number.isFinite(existingCreditoAmount) && existingCreditoAmount > 0) {
    return Number(existingCreditoAmount.toFixed(2))
  }
  return Number(Number(total).toFixed(2))
}

/**
 * Monto del nodo Credito. SUNAT exige que coincida con la suma de cuotas;
 * no se copia el PayableAmount (total bruto) cuando hay detracción en USD.
 */
export function resolveCreditoAmount(
  total: number,
  cuotas: Cuota[],
  montoDetraccion: number = 0,
  currency: string = 'PEN',
  existingCreditoAmount: number = 0,
): number {
  const sumaCuotas = sumCuotaAmounts(cuotas)
  if (sumaCuotas > 0) {
    return Number(sumaCuotas.toFixed(2))
  }
  return resolveFinanciableCap(total, montoDetraccion, currency, existingCreditoAmount)
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate

  const date = new Date(year, month - 1, day + days)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getCuotaMinDate(cuotas: Cuota[], index: number, emisionDate: string): string {
  if (index > 0) {
    const previous = cuotas[index - 1]?.vencimiento
    if (previous) return addCalendarDays(previous, 1)
  }
  return emisionDate
}

/** ISO `YYYY-MM-DD` → `DD/MM/YYYY` para mensajes de UI. */
export function formatDateUi(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

export function validateCuotas(
  cuotas: Cuota[],
  total: number,
  emisionDate: string,
  montoDetraccion: number = 0,
  currency: string = 'PEN',
  existingCreditoAmount: number = 0,
): Record<number, CuotaError> {
  const errors: Record<number, CuotaError> = {}
  const totalFinanciable = resolveFinanciableCap(
    total,
    montoDetraccion,
    currency,
    existingCreditoAmount,
  )

  cuotas.forEach((cuota, i) => {
    const err: CuotaError = {}
    const suma = cuotas.reduce((s, c) => s + (parseFloat(c.monto) || 0), 0)

    if (parseFloat(cuota.monto) > 0 && suma > totalFinanciable + 0.01) {
      err.monto = `La suma de cuotas (${suma.toFixed(2)}) excede el total a financiar (${totalFinanciable.toFixed(2)})`
    }

    if (cuota.vencimiento) {
      const previous = i > 0 ? cuotas[i - 1]?.vencimiento : ''
      const minDate = getCuotaMinDate(cuotas, i, emisionDate)

      if (i === 0 && emisionDate && cuota.vencimiento < emisionDate) {
        err.vencimiento = `No puede ser anterior a la emisión (${formatDateUi(emisionDate)})`
      } else if (previous && cuota.vencimiento <= previous) {
        err.vencimiento = `Debe ser posterior a la cuota ${i} (${formatDateUi(previous)})`
      } else if (minDate && cuota.vencimiento < minDate) {
        err.vencimiento =
          i === 0
            ? `No puede ser anterior a la emisión (${formatDateUi(minDate)})`
            : `Debe ser desde ${formatDateUi(minDate)} (día siguiente a la cuota ${i})`
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
  currency: string = 'PEN',
  existingCreditoAmount: number = 0,
) {
  const creditoAmount = resolveCreditoAmount(
    total,
    cuotas,
    montoDetraccion,
    currency,
    existingCreditoAmount,
  )

  const formaPagoTerms: object[] = [
    {
      'cbc:ID': { _text: 'FormaPago' },
      'cbc:PaymentMeansID': { _text: 'Credito' },
      'cbc:Amount': { _attributes: { currencyID: currency }, _text: creditoAmount },
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
