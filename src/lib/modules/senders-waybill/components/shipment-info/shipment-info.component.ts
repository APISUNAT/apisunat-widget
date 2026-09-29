import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface ShipmentInfoState {
  handlingCode: string;
  handlingDescription: string;
  transportModeCode: string;
}

export function setShipmentInfoActions(
  handlingCode: string,
  handlingDescription: string,
  transportModeCode: string
) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};

    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cbc:HandlingCode": handlingCode ? { _text: handlingCode } : undefined,
        "cbc:Information": handlingCode === "13" && handlingDescription
          ? { _text: handlingDescription }
          : undefined,
        "cac:ShipmentStage": {
          ...(shipment["cac:ShipmentStage"] || {}),
          "cbc:TransportModeCode": transportModeCode ? { _text: transportModeCode } : undefined,
        }
      }
    };
  });
}

export function getShipmentInfoData(): ShipmentInfoState {
  const doc = get(documentStore);
  const shipment = doc["cac:Shipment"] || {};

  return {
    handlingCode: shipment["cbc:HandlingCode"]?._text || "",
    handlingDescription: shipment["cbc:Information"]?._text || "",
    transportModeCode: shipment["cac:ShipmentStage"]?.["cbc:TransportModeCode"]?._text || "",
  };
}
