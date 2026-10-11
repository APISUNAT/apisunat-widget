import { get } from "svelte/store";
import { documentStore, documentTypeStore } from "$lib/store/document.store";

export interface AddressState {
  // Punto de partida (Despatch)
  departureUbigeo: string;
  departureAddress: string;
  departureAddressTypeCode: string;
  departureRUC: string;

  // Punto de llegada (Delivery)
  arrivalUbigeo: string;
  arrivalAddress: string;
  arrivalAddressTypeCode: string;
  arrivalRUC: string;
}

export function setAddressesActions(
  departureUbigeo: string,
  departureAddress: string,
  departureAddressTypeCode: string,
  departureRUC: string,
  arrivalUbigeo: string,
  arrivalAddress: string,
  arrivalAddressTypeCode: string,
  arrivalRUC: string
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
            ...(arrivalAddressTypeCode && arrivalRUC ? {
              "cbc:AddressTypeCode": {
                _attributes: {
                  listID: arrivalRUC
                },
                _text: arrivalAddressTypeCode
              }
            } : {}),
            ...(arrivalAddress ? {
              "cac:AddressLine": {
                "cbc:Line": { _text: arrivalAddress }
              }
            } : {})
          } : null,
          "cac:Despatch": (departureUbigeo || departureAddress) ? {
            "cac:DespatchAddress": {
              ...(departureUbigeo ? { "cbc:ID": { _text: departureUbigeo } } : {}),
              ...(departureAddressTypeCode && departureRUC ? {
                "cbc:AddressTypeCode": {
                  _attributes: {
                    listID: departureRUC
                  },
                  _text: departureAddressTypeCode
                }
              } : {}),
              ...(departureAddress ? {
                "cac:AddressLine": {
                  "cbc:Line": { _text: departureAddress }
                }
              } : {})
            }
          } : null
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
    departureAddressTypeCode: despatchAddress?.["cbc:AddressTypeCode"]?._text || "",
    departureRUC: despatchAddress?.["cbc:AddressTypeCode"]?._attributes?.listID || "",
    arrivalUbigeo: deliveryAddress?.["cbc:ID"]?._text || "",
    arrivalAddress: deliveryAddress?.["cac:AddressLine"]?.["cbc:Line"]?._text || "",
    arrivalAddressTypeCode: deliveryAddress?.["cbc:AddressTypeCode"]?._text || "",
    arrivalRUC: deliveryAddress?.["cbc:AddressTypeCode"]?._attributes?.listID || "",
  };
}
