import { documentStore } from '$lib/store/document.store'

function getPeruTime() {
  return new Date().toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function setHeaderDocument(data: {
  series: string
  correlative: string
  documentType: string
  operationType: string
}) {
  documentStore.update(body => ({
    ...body,
    'cbc:ID': { _text: `${data.series}-${data.correlative}` },
    'cbc:InvoiceTypeCode': {
      _text:       data.documentType,
      _attributes: { listID: data.operationType },
    },
  }))
}

export function setHeaderOptions(data: {
  date: string
  currency: string
}) {
  documentStore.update(body => ({
    ...body,
    'cbc:IssueDate':            { _text: data.date },
    'cbc:IssueTime':            { _text: getPeruTime() },
    'cbc:DocumentCurrencyCode': { _text: data.currency },
  }))
}

export function setHeader(data: {
  series: string
  correlative: string
  date: string
  currency: string
  documentType: string
  operationType: string
}) {
  setHeaderDocument({
    series:         data.series,
    correlative:   data.correlative,
    documentType:  data.documentType,
    operationType: data.operationType,
  })
  setHeaderOptions({
    date:     data.date,
    currency: data.currency,
  })
}