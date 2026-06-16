// export type EditableItem = {
//   description:    string;
//   quantity:       string;
//   unitCode:       string;
//   valorUnitario:  string;
//   precioUnitario: string;
//   igvRate:        number;
//   itemCode?:      string;
// };

// export type LineItem = EditableItem & { id: number };

// export function lineTotal(item: LineItem): string {
//   const qty    = parseFloat(item.quantity) || 0;
//   const precio = parseFloat(item.precioUnitario) || 0;
//   return (qty * precio).toFixed(2);
// }

// export function grandTotalFromItems(items: LineItem[]): string {
//   return items
//     .reduce((sum, item) => {
//       const qty    = parseFloat(item.quantity) || 0;
//       const precio = parseFloat(item.precioUnitario) || 0;
//       return sum + qty * precio;
//     }, 0)
//     .toFixed(2);
// }

// export function hydrateLines(doc: any): LineItem[] {
//   const lines = doc["cac:InvoiceLine"];
//   if (lines === undefined) return [];
//   const arr = Array.isArray(lines) ? lines : [lines];

//   return arr.map((line: any, i: number) => {
//     const igvPercent =
//       line["cac:TaxTotal"]?.["cac:TaxSubtotal"]?.[0]?.["cac:TaxCategory"]?.["cbc:Percent"]?._text;
//     const igvRate = igvPercent ? parseFloat(String(igvPercent)) : 18;

//     const valorUnitario = String(line["cac:Price"]?.["cbc:PriceAmount"]?._text ?? "");

//     const precioRaw =
//       line["cac:PricingReference"]?.["cac:AlternativeConditionPrice"]?.["cbc:PriceAmount"]?._text;

//     const precioUnitario = precioRaw
//       ? String(precioRaw)
//       : valorUnitario
//         ? (parseFloat(valorUnitario) * (1 + igvRate / 100)).toFixed(2)
//         : "";

//     return {
//       id:            i + 1,
//       description:   line["cac:Item"]?.["cbc:Description"]?._text ?? "",
//       quantity:      String(line["cbc:InvoicedQuantity"]?._text ?? "1"),
//       unitCode:      line["cbc:InvoicedQuantity"]?._attributes?.unitCode ?? "NIU",
//       valorUnitario,
//       precioUnitario,
//       igvRate,
//       itemCode:      line["cac:Item"]?.["cac:SellersItemIdentification"]?.["cbc:ID"]?._text,
//     };
//   });
// }