import { documentStore } from '$lib/store/document.store'
import { derived } from 'svelte/store'

export const savedNotes = derived(documentStore, ($doc) =>
  ($doc['cbc:Note'] ?? [])
    .map((n: any, i: number) => ({ ...n, _originalIndex: i }))
    .filter((n: any) => n._attributes?.languageLocaleID !== '1000')
)

export const savedCodes = derived(documentStore, ($doc) =>
  new Set(
    ($doc['cbc:Note'] ?? [])
      .filter((n: any) => n._attributes?.noteCode)
      .map((n: any) => String(n._attributes.noteCode))
  )
)

export function setNoteActions(data: { notecode?: string; note: string }) {
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

export function removeNoteActions(index: number) {
  documentStore.update((body) => ({
    ...body,
    'cbc:Note': (body['cbc:Note'] ?? []).filter((_: any, i: number) => i !== index),
  }))
}