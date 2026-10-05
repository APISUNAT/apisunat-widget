import { get } from "svelte/store";
import { documentStore, documentTypeStore } from "$lib/store/document.store";

export interface AddressState {
  // Punto de partida (Despatch)
  departureUbigeo: string;
  departureAddress: string;
  departureAddressTypeCode: string;

  // Punto de llegada (Delivery)
  arrivalUbigeo: string;
  arrivalAddress: string;
  arrivalAddressTypeCode: string;
}

export function setAddressesActions(
  departureUbigeo: string,
  departureAddress: string,
  departureAddressTypeCode: string,
  arrivalUbigeo: string,
  arrivalAddress: string,
  arrivalAddressTypeCode: string
) {
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};

    // Obtener el RUC del supplier según el tipo de documento
    const docType = get(documentTypeStore);
    const isGuiaRemision = docType === '09' || docType === '31';
    const supplierKey = isGuiaRemision ? 'cac:DespatchSupplierParty' : 'cac:AccountingSupplierParty';
    const supplierRUC = body[supplierKey]?.["cac:Party"]?.["cac:PartyIdentification"]?.["cbc:ID"]?._text || "";

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
            } : {}),
            ...(arrivalAddressTypeCode && supplierRUC ? {
              "cbc:AddressTypeCode": {
                _attributes: {
                  listID: supplierRUC
                },
                _text: arrivalAddressTypeCode
              }
            } : {})
          } : null,
          "cac:Despatch": (departureUbigeo || departureAddress) ? {
            "cac:DespatchAddress": {
              ...(departureUbigeo ? { "cbc:ID": { _text: departureUbigeo } } : {}),
              ...(departureAddress ? {
                "cac:AddressLine": {
                  "cbc:Line": { _text: departureAddress }
                }
              } : {}),
              ...(departureAddressTypeCode && supplierRUC ? {
                "cbc:AddressTypeCode": {
                  _attributes: {
                    listID: supplierRUC
                  },
                  _text: departureAddressTypeCode
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
    arrivalUbigeo: deliveryAddress?.["cbc:ID"]?._text || "",
    arrivalAddress: deliveryAddress?.["cac:AddressLine"]?.["cbc:Line"]?._text || "",
    arrivalAddressTypeCode: deliveryAddress?.["cbc:AddressTypeCode"]?._text || "",
  };
}
