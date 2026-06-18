export function calcTotals(lines: any[]) {
  const opGravada  = lines.reduce((s, l) => s + (l['cbc:LineExtensionAmount']?._text ?? 0), 0)
  const igv        = lines.reduce((s, l) => s + (l['cac:TaxTotal']?.['cbc:TaxAmount']?._text ?? 0), 0)
  const opGravadaR = parseFloat(opGravada.toFixed(2))
  const igvR       = parseFloat(igv.toFixed(2))
  const total      = parseFloat((opGravadaR + igvR).toFixed(2))

  return { opGravadaR, igvR, total }
}