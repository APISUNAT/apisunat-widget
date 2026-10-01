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
        "cbc:ID": { _text: "SUNAT_Envio" },
        "cbc:HandlingCode": handlingCode ? { _text: handlingCode } : undefined,
        "cbc:Information": handlingCode === "13" && handlingDescription
          ? { _text: handlingDescription }
          : undefined,
        ...(shipment["cbc:GrossWeightMeasure"] ? {
          "cbc:GrossWeightMeasure": shipment["cbc:GrossWeightMeasure"]
        } : {}),
        "cac:ShipmentStage": {
          "cbc:TransportModeCode": transportModeCode ? { _text: transportModeCode } : undefined,
          "cac:TransitPeriod": {
            "cbc:StartDate": { _text: issueDate }
          },
          ...(shipmentStage["cac:CarrierParty"] ? {
            "cac:CarrierParty": shipmentStage["cac:CarrierParty"]
          } : {}),
          ...(shipmentStage["cac:LoadingTransportEvent"] ? {
            "cac:LoadingTransportEvent": shipmentStage["cac:LoadingTransportEvent"]
          } : {}),
          ...(shipmentStage["cac:TransportHandlingUnit"] ? {
            "cac:TransportHandlingUnit": shipmentStage["cac:TransportHandlingUnit"]
          } : {}),
          ...(shipmentStage["cac:DriverPerson"] ? {
            "cac:DriverPerson": shipmentStage["cac:DriverPerson"]
          } : {})
        },
        ...(shipment["cac:Delivery"] ? {
          "cac:Delivery": shipment["cac:Delivery"]
        } : {})
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
