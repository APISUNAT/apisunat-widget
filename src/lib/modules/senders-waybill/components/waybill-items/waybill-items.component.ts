import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface WaybillItem {
  id: number;
  quantity: string;
  unitCode: string;
  description: string;
  damSerie?: string;
  damNumero?: string;
  partidaArancelaria?: string;
  bienNormalizado?: string;
}

export interface EditableWaybillItem {
  quantity: string;
  unitCode: string;
  description: string;
  damSerie?: string;
  damNumero?: string;
  partidaArancelaria?: string;
  bienNormalizado?: string;
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

    // Construir AdditionalItemProperty si hay datos DAM/DS
    const additionalProperties = [];

    if (item.partidaArancelaria && item.partidaArancelaria.trim() && !/^0+$/.test(item.partidaArancelaria)) {
      additionalProperties.push({
        "cbc:Name": { _text: "Partida arancelaria" },
        "cbc:NameCode": { _text: "7020" },
        "cbc:Value": { _text: item.partidaArancelaria },
      });
    }

    if (item.damNumero) {
      additionalProperties.push({
        "cbc:Name": { _text: "Numero de declaracion aduanera (DAM)" },
        "cbc:NameCode": { _text: "7021" },
        "cbc:Value": { _text: item.damNumero },
      });
    }

    if (item.bienNormalizado === "1") {
      additionalProperties.push({
        "cbc:Name": { _text: "Indicador de bien normalizado" },
        "cbc:NameCode": { _text: "7022" },
        "cbc:Value": { _text: item.bienNormalizado },
      });
    }

    if (item.damSerie) {
      additionalProperties.push({
        "cbc:Name": { _text: "Numero de serie en la DAM o DS" },
        "cbc:NameCode": { _text: "7023" },
        "cbc:Value": { _text: item.damSerie },
      });
    }

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
        ...(additionalProperties.length > 0 && {
          "cac:AdditionalItemProperty": additionalProperties,
        }),
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

  return linesArray.map((line, index) => {
    // Extraer datos adicionales
    const additionalProps = line["cac:Item"]?.["cac:AdditionalItemProperty"];
    let damSerie = "";
    let damNumero = "";
    let partidaArancelaria = "";
    let bienNormalizado = "0";

    if (additionalProps) {
      const props = Array.isArray(additionalProps) ? additionalProps : [additionalProps];

      props.forEach((prop: any) => {
        const nameCode = prop["cbc:NameCode"]?._text;
        const value = prop["cbc:Value"]?._text;

        if (nameCode === "7023" && value) {
          damSerie = String(value);
        } else if (nameCode === "7021" && value) {
          damNumero = String(value);
        } else if (nameCode === "7020" && value) {
          partidaArancelaria = String(value);
        } else if (nameCode === "7022" && value) {
          bienNormalizado = String(value);
        }
      });
    }

    return {
      id: parseInt(line["cbc:ID"]?._text || String(index + 1)),
      quantity: line["cbc:DeliveredQuantity"]?._text || "1",
      unitCode:
        line["cbc:DeliveredQuantity"]?._attributes?.unitCode || "NIU",
      description: line["cac:Item"]?.["cbc:Description"]?._text || "",
      damSerie,
      damNumero,
      partidaArancelaria,
      bienNormalizado,
    };
  });
}

export function createEditableWaybillItem(
  item?: Partial<WaybillItem>
): EditableWaybillItem {
  return {
    quantity: item?.quantity || "1",
    unitCode: item?.unitCode || "NIU",
    description: item?.description || "",
    damSerie: item?.damSerie || "",
    damNumero: item?.damNumero || "",
    partidaArancelaria: item?.partidaArancelaria || "",
    bienNormalizado: item?.bienNormalizado || "0",
  };
}
