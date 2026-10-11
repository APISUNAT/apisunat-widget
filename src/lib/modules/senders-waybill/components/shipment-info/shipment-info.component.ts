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
    const shipmentStage = shipment["cac:ShipmentStage"] || {};
    const issueDate = body["cbc:IssueDate"]?._text || new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cbc:HandlingCode": handlingCode ? { _text: handlingCode } : null,
        "cbc:Information": handlingCode === "13" && handlingDescription
          ? { _text: handlingDescription }
          : null,
        "cac:ShipmentStage": {
          ...shipmentStage,
          "cbc:TransportModeCode": transportModeCode ? { _text: transportModeCode } : null,
          "cac:TransitPeriod": {
            "cbc:StartDate": { _text: issueDate }
          },
        },
      }
    };
  });
}

export function getShipmentInfoData(): ShipmentInfoState {
  const doc = get(documentStore);
  const shipment = doc["cac:Shipment"] || {};

  return {
    handlingCode: shipment["cbc:HandlingCode"]?._text || "01",
    handlingDescription: shipment["cbc:Information"]?._text || "",
    transportModeCode: shipment["cac:ShipmentStage"]?.["cbc:TransportModeCode"]?._text || "01",
  };
}
