import { get } from "svelte/store";
import { documentStore } from "$lib/store/document.store";
import { DELIVERY_INDICATORS, TRANSPORT_MODE_CODES } from "../../constants/delivery-options.constants";

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
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};
    const currentInstructions = shipment["cbc:SpecialInstructions"] || [];
    const transportModeCode = shipment["cac:ShipmentStage"]?.["cbc:TransportModeCode"]?._text || TRANSPORT_MODE_CODES.PUBLICO;
    const isTransportePrivado = transportModeCode === TRANSPORT_MODE_CODES.PRIVADO;

    // Crear un Set con las instrucciones actuales (solo los textos)
    const instructionsSet = new Set(
      currentInstructions.map((item: any) => item._text)
    );

    // Agregar o quitar según el estado de cada toggle
    if (retornoVehiculoVacio) {
      instructionsSet.add(DELIVERY_INDICATORS.RETORNO_VEHICULO_VACIO);
    } else {
      instructionsSet.delete(DELIVERY_INDICATORS.RETORNO_VEHICULO_VACIO);
    }

    if (retornoEnvasesVacios) {
      instructionsSet.add(DELIVERY_INDICATORS.RETORNO_ENVASES_VACIOS);
    } else {
      instructionsSet.delete(DELIVERY_INDICATORS.RETORNO_ENVASES_VACIOS);
    }

    if (transbordoProgramado) {
      instructionsSet.add(DELIVERY_INDICATORS.TRANSBORDO_PROGRAMADO);
    } else {
      instructionsSet.delete(DELIVERY_INDICATORS.TRANSBORDO_PROGRAMADO);
    }

    if (vehiculosCategoriaM1L) {
      instructionsSet.add(DELIVERY_INDICATORS.VEHICULO_M1L);
    } else {
      instructionsSet.delete(DELIVERY_INDICATORS.VEHICULO_M1L);
    }

    if (trasladoTotalDAM) {
      instructionsSet.add(DELIVERY_INDICATORS.TRASLADO_TOTAL_DAM);
    } else {
      instructionsSet.delete(DELIVERY_INDICATORS.TRASLADO_TOTAL_DAM);
    }

    // Solo agregar indicador de datos de transportista si NO es transporte privado
    if (datosTransportista && !isTransportePrivado) {
      instructionsSet.add(DELIVERY_INDICATORS.DATOS_TRANSPORTISTA);
    } else {
      instructionsSet.delete(DELIVERY_INDICATORS.DATOS_TRANSPORTISTA);
    }

    // Convertir el Set de vuelta a array de objetos
    const newInstructions = Array.from(instructionsSet).map((text) => ({
      _text: text,
    }));

    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cbc:SpecialInstructions": newInstructions.length > 0 ? newInstructions : null,
      }
    };
  });
}

export function getDeliveryOptionsData(): DeliveryOptionsState {
  const doc = get(documentStore);
  const shipment = doc["cac:Shipment"] || {};
  const instructions = shipment["cbc:SpecialInstructions"] || [];

  // Crear un Set con las instrucciones existentes
  const instructionsSet = new Set(
    instructions.map((item: any) => item._text)
  );

  return {
    retornoVehiculoVacio: instructionsSet.has(DELIVERY_INDICATORS.RETORNO_VEHICULO_VACIO),
    retornoEnvasesVacios: instructionsSet.has(DELIVERY_INDICATORS.RETORNO_ENVASES_VACIOS),
    transbordoProgramado: instructionsSet.has(DELIVERY_INDICATORS.TRANSBORDO_PROGRAMADO),
    vehiculosCategoriaM1L: instructionsSet.has(DELIVERY_INDICATORS.VEHICULO_M1L),
    trasladoTotalDAM: instructionsSet.has(DELIVERY_INDICATORS.TRASLADO_TOTAL_DAM),
    datosTransportista: instructionsSet.has(DELIVERY_INDICATORS.DATOS_TRANSPORTISTA),
  };
}
