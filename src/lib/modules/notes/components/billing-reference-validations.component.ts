import { get } from "svelte/store";
import { runtimeConfigStore } from "$lib/store/config.store";
import { documentStore } from "$lib/store/document.store";

export function getExpectedSeriePrefix(): 'F' | 'B' | null {
    const { serie } = get(runtimeConfigStore)

    // primero intenta del config
    if (serie) {
        const prefix = serie.charAt(0).toUpperCase()
        if (prefix === 'F' || prefix === 'B') return prefix as 'F' | 'B'
    }

    // si no, lo infiere del ID en el documentStore
    const id = get(documentStore)?.['cbc:ID']?._text ?? ''
    const prefix = id.charAt(0).toUpperCase()
    if (prefix === 'F' || prefix === 'B') return prefix as 'F' | 'B'

    return null
}
export function isSerieCompatible(serie: string): boolean {
    const expected = getExpectedSeriePrefix()
    if (!serie) return true;
    return serie.trim().toUpperCase().charAt(0) === expected
}