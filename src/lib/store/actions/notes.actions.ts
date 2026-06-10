import { documentStore } from '../document.store'

export function setNote(data: { notecode?: string; note: string }) {
  documentStore.update((body) => ({
    ...body,
    'cbc:Note': [
      ...(body['cbc:Note'] ?? []),
      {
        ...(data.notecode ? { _attributes: { noteCode: data.notecode } } : {}),
        _text: data.note,
      },
    ],
  }))
}

export function removeNote(index: number) {
  documentStore.update((body) => ({
    ...body,
    'cbc:Note': (body['cbc:Note'] ?? []).filter((_: any, i: number) => i !== index),
  }))
}