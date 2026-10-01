import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface WaybillItem {
  id: number;
  quantity: string;
  unitCode: string;
  description: string;
}

export interface EditableWaybillItem {
  quantity: string;
  unitCode: string;
  description: string;
}

export function addWaybillItemActions(item: WaybillItem) {
  documentStore.update((body) => {
    const existingLines = body["cac:DespatchLine"] || [];
    const linesArray = Array.isArray(existingLines)
      ? existingLines
      : [existingLines];

    const updatedLines = linesArray.filter(
      (line) => line["cbc:ID"]?._text !== String(item.id)
    );

    const newLine = {
      "cbc:ID": { _text: String(item.id) },
      "cbc:DeliveredQuantity": {
        _attributes: { unitCode: item.unitCode || "NIU" },
        _text: item.quantity,
      },
      "cac:OrderLineReference": {
        "cbc:LineID": { _text: String(item.id) },
      },
      "cac:Item": {
        "cbc:Description": { _text: item.description },
      },
    };

    updatedLines.push(newLine);
    updatedLines.sort(
      (a, b) =>
        parseInt(a["cbc:ID"]?._text || "0") -
        parseInt(b["cbc:ID"]?._text || "0")
    );

    return {
      ...body,
      "cac:DespatchLine": updatedLines,
    };
  });
}

export function removeWaybillItemActions(id: number) {
  documentStore.update((body) => {
    const existingLines = body["cac:DespatchLine"] || [];
    const linesArray = Array.isArray(existingLines)
      ? existingLines
      : [existingLines];

    const updatedLines = linesArray.filter(
      (line) => line["cbc:ID"]?._text !== String(id)
    );

    return {
      ...body,
      "cac:DespatchLine": updatedLines.length > 0 ? updatedLines : undefined,
    };
  });
}

export function hydrateWaybillItems(doc: any): WaybillItem[] {
  const lines = doc["cac:DespatchLine"];
  if (!lines) return [];

  const linesArray = Array.isArray(lines) ? lines : [lines];

  return linesArray.map((line, index) => ({
    id: parseInt(line["cbc:ID"]?._text || String(index + 1)),
    quantity: line["cbc:DeliveredQuantity"]?._text || "1",
    unitCode:
      line["cbc:DeliveredQuantity"]?._attributes?.unitCode || "NIU",
    description: line["cac:Item"]?.["cbc:Description"]?._text || "",
  }));
}

export function createEditableWaybillItem(
  item?: Partial<WaybillItem>
): EditableWaybillItem {
  return {
    quantity: item?.quantity || "1",
    unitCode: item?.unitCode || "NIU",
    description: item?.description || "",
  };
}
