import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";
import { getRUCGETAsync } from "$lib/api/documents.api";
import { getCarrierCache, setCarrierCache } from "./carrier-party.cache";

export interface CarrierPartyState {
  documentType: string;
  documentNumber: string;
  name: string;
  mtcRegistration: string;
}

type CarrierData = { name: string }

export function setCarrierPartyActions(data: CarrierPartyState, enabled: boolean = true) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};
    const shipmentStage = shipment["cac:ShipmentStage"] || {};

    // Si enabled es false (ej: Transporte Privado), limpiar CarrierParty
    if (!enabled) {
      return {
        ...body,
        "cac:Shipment": {
          ...shipment,
          "cac:ShipmentStage": {
            ...shipmentStage,
            "cac:CarrierParty": null
          }
        }
      };
    }

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
          } : null
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

/**
 * Busca datos del transportista por RUC
 * Primero busca en caché (localStorage), si no encuentra hace la consulta a la API
 */
export async function fetchCarrierByRUC(ruc: string): Promise<CarrierData | null> {
  // Primero intentar obtener del caché
  const cached = getCarrierCache(ruc);
  if (cached) return cached;

  // Si no hay en caché, buscar en la API
  try {
    const json = await getRUCGETAsync(ruc);
    if (!json?.success) return null;

    const result = {
      name: json.data?.nombre ?? ''
    };

    // Guardar en caché si se obtuvo resultado
    if (result.name) setCarrierCache(ruc, result);

    return result;
  } catch {
    return null;
  }
}
