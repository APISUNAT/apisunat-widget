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
    const currentInstructions = shipment["cbc:SpecialInstructions"] || [];

    // Si no hay vehículos, limpiar la estructura
    if (vehicles.length === 0) {
      return {
        ...body,
        "cac:Shipment": {
          ...shipment,
          "cac:TransportHandlingUnit": null
        }
      };
    }

    // Si includeIndicator es false (ej: M1L activo), limpiar del JSON pero no del estado local
    if (!includeIndicator) {
      return {
        ...body,
        "cac:Shipment": {
          ...shipment,
          "cac:TransportHandlingUnit": null
        }
      };
    }

    // Construir TransportEquipment (uno o múltiples)
    const transportEquipment = vehicles.length === 1
      ? {
          "cbc:ID": {
            "_text": vehicles[0].plate
          },
          "cac:ApplicableTransportMeans": vehicles[0].tucChv ? {
            "cbc:RegistrationNationalityID": {
              "_text": vehicles[0].tucChv
            }
          } : undefined,
          "cac:ShipmentDocumentReference": vehicles[0].authorization && vehicles[0].authorizationType ? {
            "cbc:ID": {
              "_attributes": {
                "schemeID": vehicles[0].authorizationType
              },
              "_text": vehicles[0].authorization
            }
          } : undefined
        }
      : vehicles.map(vehicle => ({
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
        }));

    // Solo agregar los vehículos, NO manejar el indicador
    // El indicador lo maneja delivery-options.component.ts
    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cac:TransportHandlingUnit": {
          "cac:TransportEquipment": transportEquipment
        }
      }
    };
  });
}

export function getVehiclesData(): Vehicle[] {
  const doc = get(documentStore);
  const transportHandlingUnit = doc["cac:Shipment"]?.["cac:TransportHandlingUnit"];

  if (!transportHandlingUnit) {
    return [];
  }

  const transportEquipment = transportHandlingUnit["cac:TransportEquipment"];

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
