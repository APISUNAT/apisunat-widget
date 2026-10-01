import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface AddressState {
  // Punto de partida (Despatch)
  departureUbigeo: string;
  departureAddress: string;

  // Punto de llegada (Delivery)
  arrivalUbigeo: string;
  arrivalAddress: string;
}

export function setAddressesActions(
  departureUbigeo: string,
  departureAddress: string,
  arrivalUbigeo: string,
  arrivalAddress: string
) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};

    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cac:Delivery": {
          "cac:DeliveryAddress": (arrivalUbigeo || arrivalAddress) ? {
            ...(arrivalUbigeo ? { "cbc:ID": { _text: arrivalUbigeo } } : {}),
            ...(arrivalAddress ? {
              "cac:AddressLine": {
                "cbc:Line": { _text: arrivalAddress }
              }
            } : {})
          } : undefined,
          "cac:Despatch": departureUbigeo || departureAddress ? {
            "cac:DespatchAddress": {
              ...(departureUbigeo ? { "cbc:ID": { _text: departureUbigeo } } : {}),
              ...(departureAddress ? {
                "cac:AddressLine": {
                  "cbc:Line": { _text: departureAddress }
                }
              } : {})
            }
          } : undefined
        }
      }
    };
  });
}

export function getAddressesData(): AddressState {
  const doc = get(documentStore);
  const delivery = doc["cac:Shipment"]?.["cac:Delivery"] || {};

  const despatchAddress = delivery["cac:Despatch"]?.["cac:DespatchAddress"];
  const deliveryAddress = delivery["cac:DeliveryAddress"];

  return {
    departureUbigeo: despatchAddress?.["cbc:ID"]?._text || "",
    departureAddress: despatchAddress?.["cac:AddressLine"]?.["cbc:Line"]?._text || "",
    arrivalUbigeo: deliveryAddress?.["cbc:ID"]?._text || "",
    arrivalAddress: deliveryAddress?.["cac:AddressLine"]?.["cbc:Line"]?._text || "",
  };
}
