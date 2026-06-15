import {writable} from 'svelte/store';

export interface RuntimeConfig {
    personaId: string
    personaToken: string
    type: string
    serie?: string
}
export const runtimeConfigStore = writable<RuntimeConfig>({
    personaId: '',
    personaToken: '',
    type: '',
    serie: ''
})
