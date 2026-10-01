import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface Driver {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
}

export function setDriversActions(drivers: Driver[], includeIndicator: boolean) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};
    const shipmentStage = shipment["cac:ShipmentStage"] || {};

    // Si no hay conductores o indicador, limpiar la estructura
    if (drivers.length === 0 || !includeIndicator) {
      return {
        ...body,
        "cac:Shipment": {
          ...shipment,
          "cbc:SpecialInstructions": [],
          "cac:ShipmentStage": {
            ...shipmentStage,
            "cac:DriverPerson": []
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
    licenseNumber: driver["cac:IdentityDocumentReference"]?.["cbc:ID"]?._text || "",
  }));
}
