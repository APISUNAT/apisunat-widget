import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";

export interface DeliveryOptionsState {
  retornoVehiculoVacio: boolean;
  retornoEnvasesVacios: boolean;
  transbordoProgramado: boolean;
  vehiculosCategoriaM1L: boolean;
  trasladoTotalDAM: boolean;
  datosTransportista: boolean;
}

export function setDeliveryOptionsActions(
  retornoVehiculoVacio: boolean,
  retornoEnvasesVacios: boolean,
  transbordoProgramado: boolean,
  vehiculosCategoriaM1L: boolean,
  trasladoTotalDAM: boolean,
  datosTransportista: boolean
) {
  documentStore.update((body) => ({
    ...body,
    "cbc:ReturnVehicleIndicator": retornoVehiculoVacio ? { _text: "true" } : undefined,
    "cbc:ReturnPackagingIndicator": retornoEnvasesVacios ? { _text: "true" } : undefined,
    "cbc:TransbordoIndicator": transbordoProgramado ? { _text: "true" } : undefined,
    "cbc:VehicleM1L": vehiculosCategoriaM1L ? { _text: "true" } : undefined,
    "cbc:TotalTransferIndicator": trasladoTotalDAM ? { _text: "true" } : undefined,
    "cbc:CarrierPartyIndicator": datosTransportista ? { _text: "true" } : undefined,
  }));
}

export function getDeliveryOptionsData(): DeliveryOptionsState {
  const doc = get(documentStore);

  return {
    retornoVehiculoVacio: doc["cbc:ReturnVehicleIndicator"]?._text === "true",
    retornoEnvasesVacios: doc["cbc:ReturnPackagingIndicator"]?._text === "true",
    transbordoProgramado: doc["cbc:TransbordoIndicator"]?._text === "true",
    vehiculosCategoriaM1L: doc["cbc:VehicleM1L"]?._text === "true",
    trasladoTotalDAM: doc["cbc:TotalTransferIndicator"]?._text === "true",
    datosTransportista: doc["cbc:CarrierPartyIndicator"]?._text === "true",
  };
}
