
export const PAYMENT_METHODS_BY_TYPE: Record<string, ('Contado' | 'Credito')[]> = {
  '01': ['Contado', 'Credito'],
  '03': ['Contado'],
}

export function getPaymentMethods(documentType: string): ('Contado' | 'Credito')[] {
  return PAYMENT_METHODS_BY_TYPE[documentType] ?? ['Contado', 'Credito']
}