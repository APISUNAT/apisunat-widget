import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface Vehicle {
  plate: string;
  tucChv: string;
  authorizationType: string;
  authorization: string;
}

export function setVehiclesActions(vehicles: Vehicle[], includeIndicator: boolean) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};
    const shipmentStage = shipment["cac:ShipmentStage"] || {};

    // Si no hay vehículos o indicador, limpiar la estructura
    if (vehicles.length === 0 || !includeIndicator) {
      return {
        ...body,
        "cac:Shipment": {
          ...shipment,
          "cbc:SpecialInstructions": [],
          "cac:ShipmentStage": {
            ...shipmentStage,
            "cac:TransportHandlingUnit": []
          }
        }
      };
    }

    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cbc:SpecialInstructions": [
          {
            "_text": "SUNAT_Envio_IndicadorVehiculoConductoresTransp"
          }
        ],
        "cac:ShipmentStage": {
          ...shipmentStage,
          "cac:TransportHandlingUnit": vehicles.map(vehicle => ({
            "cbc:ID": {
              "_text": vehicle.plate
            },
            "cac:ApplicableTransportMeans": vehicle.tucChv ? {
              "cbc:RegistrationNationalityID": {
                "_text": vehicle.tucChv
              }
            } : undefined,
            "cac:ShipmentDocumentReference": vehicle.authorization && vehicle.authorizationType ? {
              "cbc:ID": {
                "_attributes": {
                  "schemeID": vehicle.authorizationType
                },
                "_text": vehicle.authorization
              }
            } : undefined
          }))
        }
      }
    };
  });
}

export function getVehiclesData(): Vehicle[] {
  const doc = get(documentStore);
  const transportHandlingUnit = doc["cac:Shipment"]?.["cac:ShipmentStage"]?.["cac:TransportHandlingUnit"];

  if (!transportHandlingUnit || transportHandlingUnit.length === 0) {
    return [];
  }

  // Si es un solo vehículo, viene como objeto; si son varios, como array
  const equipmentArray = Array.isArray(transportHandlingUnit) ? transportHandlingUnit : [transportHandlingUnit];

  return equipmentArray.map(equipment => ({
    plate: equipment["cbc:ID"]?._text || "",
    tucChv: equipment["cac:ApplicableTransportMeans"]?.["cbc:RegistrationNationalityID"]?._text || "",
    authorizationType: equipment["cac:ShipmentDocumentReference"]?.["cbc:ID"]?._attributes?.schemeID || "",
    authorization: equipment["cac:ShipmentDocumentReference"]?.["cbc:ID"]?._text || "",
  }));
}
