import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface CarrierPartyState {
  documentType: string;
  documentNumber: string;
  name: string;
  mtcRegistration: string;
}

export function setCarrierPartyActions(data: CarrierPartyState) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};
    const shipmentStage = shipment["cac:ShipmentStage"] || {};

    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cac:ShipmentStage": {
          ...shipmentStage,
          "cac:CarrierParty": data.documentNumber && data.name ? {
            "cac:PartyIdentification": {
              "cbc:ID": {
                "_attributes": {
                  "schemeID": data.documentType
                },
                "_text": data.documentNumber
              }
            },
            "cac:PartyLegalEntity": {
              "cbc:RegistrationName": {
                "_text": data.name
              },
              ...(data.mtcRegistration ? {
                "cbc:CompanyID": {
                  "_text": data.mtcRegistration
                }
              } : {})
            }
          } : undefined
        }
      }
    };
  });
}

export function getCarrierPartyData(): CarrierPartyState {
  const doc = get(documentStore);
  const carrierParty = doc["cac:Shipment"]?.["cac:ShipmentStage"]?.["cac:CarrierParty"];

  return {
    documentType: carrierParty?.["cac:PartyIdentification"]?.["cbc:ID"]?._attributes?.schemeID || "6",
    documentNumber: carrierParty?.["cac:PartyIdentification"]?.["cbc:ID"]?._text || "",
    name: carrierParty?.["cac:PartyLegalEntity"]?.["cbc:RegistrationName"]?._text || "",
    mtcRegistration: carrierParty?.["cac:PartyLegalEntity"]?.["cbc:CompanyID"]?._text || "",
  };
}
