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

    // Si no hay vehículos, no agregar la estructura
    if (vehicles.length === 0 || !includeIndicator) {
      const { "cac:TransportHandlingUnit": _, ...rest } = shipment;
      const newShipment = { ...rest };

      // Remover el indicador si no hay datos
      if (!includeIndicator) {
        delete newShipment["cbc:SpecialInstructions"];
      }

      return {
        ...body,
        "cac:Shipment": newShipment
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
        "cac:TransportHandlingUnit": {
          "cac:TransportEquipment": vehicles.map(vehicle => ({
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
  const transportEquipment = doc["cac:Shipment"]?.["cac:TransportHandlingUnit"]?.["cac:TransportEquipment"];

  if (!transportEquipment) {
    return [];
  }

  // Si es un solo vehículo, viene como objeto; si son varios, como array
  const equipmentArray = Array.isArray(transportEquipment) ? transportEquipment : [transportEquipment];

  return equipmentArray.map(equipment => ({
    plate: equipment["cbc:ID"]?._text || "",
    tucChv: equipment["cac:ApplicableTransportMeans"]?.["cbc:RegistrationNationalityID"]?._text || "",
    authorizationType: equipment["cac:ShipmentDocumentReference"]?.["cbc:ID"]?._attributes?.schemeID || "",
    authorization: equipment["cac:ShipmentDocumentReference"]?.["cbc:ID"]?._text || "",
  }));
}
