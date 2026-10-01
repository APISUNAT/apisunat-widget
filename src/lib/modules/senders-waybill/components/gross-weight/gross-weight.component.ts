import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface GrossWeightState {
  value: string;
  unitCode: string;
}

export function setGrossWeightActions(value: string, unitCode: string) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};

    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cbc:GrossWeightMeasure":
          value && parseFloat(value) > 0
            ? {
                _attributes: { unitCode: unitCode || "TNE" },
                _text: parseFloat(value),
              }
            : undefined,
      },
    };
  });
}

export function getGrossWeightData(): GrossWeightState {
  const doc = get(documentStore);
  const grossWeight = doc["cac:Shipment"]?.["cbc:GrossWeightMeasure"];

  return {
    value: grossWeight?._text ? String(grossWeight._text) : "",
    unitCode: grossWeight?._attributes?.unitCode || "KGM",
  };
}
