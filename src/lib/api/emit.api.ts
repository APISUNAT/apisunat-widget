import { getDocumentOutput } from '$lib/store/document.store'

const API_URL = import.meta.env.VITE_API_URL

export async function sendBillPOSTASYNC() {
  const { personaId, personaToken, fileName, documentBody } = getDocumentOutput()

  if (!documentBody || Object.keys(documentBody).length === 0) {
    throw new Error('No hay documento cargado para enviar')
  }

  const response = await fetch(
    API_URL + 'personas/v1/sendBill',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personaId,
        personaToken,
        fileName,
        documentBody
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error al enviar documento (${response.status}): ${errorText}`)
  }

  return response.json()
}