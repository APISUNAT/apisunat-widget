
// Convertir un número decimal a entero
// usar esta funcion en todo ingreso de numeros en la UI
export function convertDecimalToInt(value: number): number {
    const numberInt = value * 10000000000
    return numberInt
}
// Convertir un número entero a decimal (10 decimales)
export function convertIntToDecimal(value: number): number {
    const numberDecimal = value / 10000000000
    return numberDecimal
}
// Redondear a dos decimales
export function roundToTwoDecimals(value: number, decimal: number): number {
    return Number(value.toFixed(decimal));
}
