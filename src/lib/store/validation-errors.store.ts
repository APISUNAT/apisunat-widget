import { writable } from 'svelte/store'
import type { ValidationError } from '$lib/shared/utils/validate-documents'

/**
 * Store para manejar los errores de validación globalmente
 * Permite que los componentes de input lean los errores y se estilen en consecuencia
 */
function createValidationErrorsStore() {
  const { subscribe, set, update } = writable<ValidationError[]>([])

  return {
    subscribe,
    /**
     * Establece los errores de validación
     */
    setErrors: (errors: ValidationError[]) => set(errors),
    /**
     * Limpia todos los errores
     */
    clearErrors: () => set([]),
    /**
     * Obtiene el mensaje de error para un campo específico
     */
    getErrorForField: (field: string, currentErrors: ValidationError[]): string | null => {
      const error = currentErrors.find(e => e.field === field)
      return error ? error.message : null
    }
  }
}

export const validationErrorsStore = createValidationErrorsStore()
