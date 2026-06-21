export function normalizeIgvRate(raw: any): number {
    const n = Number(raw);
    if (isNaN(n)) return 18;
    return n < 1 ? Math.round(n * 100) : n;
}

export function createEditableItem(source: any = {}) {
    const s = source ?? {};
    return {
        description: s.description ?? "",
        quantity: s.quantity ?? "1",
        unitCode: s.unitCode ?? "NIU",
        valorUnitario: s.valorUnitario ?? "",
        precioUnitario: s.precioUnitario ?? "",
        igvRate: normalizeIgvRate(s.igvRate ?? 18),
        taxSchemeValue: s.taxSchemeValue ?? '1000',
    };
}

export function calcItemAmounts(quantity: string, precioUnitario: string, igvRate: number) {
    const qty = parseFloat(quantity) || 0;
    const rate = igvRate / 100;
    const precio = parseFloat(precioUnitario) || 0;
    const total = qty * precio;
    const subtotal = total / (1 + rate);
    const tax = total - subtotal;
    return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
    };
}

export function calcPrecioFromValor(valor: string, igvRate: number): string {
    if (valor === "") return "";
    const v = parseFloat(valor) || 0;
    return (v * (1 + igvRate / 100)).toFixed(2);
}

export function calcValorFromPrecio(precio: string, igvRate: number): string {
    if (precio === "") return "";
    const p = parseFloat(precio) || 0;
    return (p / (1 + igvRate / 100)).toFixed(2);
}

export function calcPrecioOnRateChange(valorUnitario: string, newRate: number): string {
    if (valorUnitario === "") return "";
    const v = parseFloat(valorUnitario) || 0;
    return (v * (1 + newRate / 100)).toFixed(2);
}