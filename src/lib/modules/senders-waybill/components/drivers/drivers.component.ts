import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface Driver {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  driverType: string; // "Principal" o "Secundario"
  licenseNumber: string;
}

export function setDriversActions(drivers: Driver[], includeIndicator: boolean) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};
    const shipmentStage = shipment["cac:ShipmentStage"] || {};

    // Si no hay conductores o no se debe incluir el indicador (ej: M1L activo), limpiar la estructura
    if (drivers.length === 0 || !includeIndicator) {
      return {
        ...body,
        "cac:Shipment": {
          ...shipment,
          "cac:ShipmentStage": {
            ...shipmentStage,
            "cac:DriverPerson": null
          }
        }
      };
    }

    // Solo agregar los conductores, NO manejar el indicador
    // El indicador lo maneja delivery-options.component.ts
    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cac:ShipmentStage": {
          ...shipmentStage,
          "cac:DriverPerson": drivers.map(driver => ({
            "cbc:ID": {
              "_attributes": {
                "schemeID": driver.documentType
              },
              "_text": driver.documentNumber
            },
            "cbc:FirstName": {
              "_text": driver.firstName
            },
            "cbc:FamilyName": {
              "_text": driver.lastName
            },
            "cbc:JobTitle": {
              "_text": driver.driverType
            },
            "cac:IdentityDocumentReference": driver.licenseNumber ? {
              "cbc:ID": {
                "_text": driver.licenseNumber
              }
            } : undefined
          }))
        }
      }
    };
  });
}

export function getDriversData(): Driver[] {
  const doc = get(documentStore);
  const driverPersons = doc["cac:Shipment"]?.["cac:ShipmentStage"]?.["cac:DriverPerson"];

  if (!driverPersons) {
    return [];
  }

  // Si es un solo conductor, viene como objeto; si son varios, como array
  const driversArray = Array.isArray(driverPersons) ? driverPersons : [driverPersons];

  return driversArray.map(driver => ({
    documentType: driver["cbc:ID"]?._attributes?.schemeID || "1",
    documentNumber: driver["cbc:ID"]?._text || "",
    firstName: driver["cbc:FirstName"]?._text || "",
    lastName: driver["cbc:FamilyName"]?._text || "",
    driverType: driver["cbc:JobTitle"]?._text || "Principal",
    licenseNumber: driver["cac:IdentityDocumentReference"]?.["cbc:ID"]?._text || "",
  }));
}
