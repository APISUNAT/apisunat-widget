import { get } from 'svelte/store'
import { runtimeConfigStore } from '$lib/store/config.store'
const API_URL = import.meta.env.VITE_API_URL

//Obtener el último número de documento registrado para una serie y tipo de documento específicos.
export const getLastDocumentPOSTAsync = async () => {
    const {
        personaId,
        personaToken,
        serie,
        type
    } = get(runtimeConfigStore)

    const response = await fetch(
        API_URL + 'personas/lastDocument',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personaId,
                personaToken,
                type,
                serie
            })
        }
    )

    const data = await response.json()

    if (data.error) {
        throw data.error
    }

    return data
}

//Obtener los datos del cliente segun su RUC

export  const getRUCGETAsync = async  (ruc: string) => {
    const {
        personaId,
        personaToken,
    }= get(runtimeConfigStore)

    const response = await fetch(
        API_URL + `personas/${personaId}/getRUC?ruc=${ruc}&personaToken=${personaToken}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    const data = await response.json()

    if (data.error) {
        throw data.error
    }

    return data
}

//Obtener los datos del cliente segun su DNI

export  const getDNIGETAsync = async  (dni: string) => {
    const {
        personaId,
        personaToken,
    }= get(runtimeConfigStore)

    const response = await fetch(
        API_URL + `personas/${personaId}/getDNI?dni=${dni}&personaToken=${personaToken}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    const data = await response.json()

    if (data.error) {
        throw data.error
    }

    return data
}