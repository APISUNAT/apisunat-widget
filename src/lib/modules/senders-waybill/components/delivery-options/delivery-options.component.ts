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
  documentStore.update((body) => {
    const shipment = body["cac:Shipment"] || {};
    const currentInstructions = shipment["cbc:SpecialInstructions"] || [];
    const transportModeCode = shipment["cac:ShipmentStage"]?.["cbc:TransportModeCode"]?._text || "01";
    const isTransportePrivado = transportModeCode === "02";

    // Mapeo de toggles a sus valores en SpecialInstructions
    const instructionMap = {
      retornoVehiculoVacio: "SUNAT_Envio_IndicadorRetornoVehiculoVacio",
      retornoEnvasesVacios: "SUNAT_Envio_IndicadorRetornoVehiculoEnvaseVacio",
      transbordoProgramado: "SUNAT_Envio_IndicadorTransbordoProgramado",
      vehiculosCategoriaM1L: "SUNAT_Envio_IndicadorTrasladoVehiculoM1L",
      trasladoTotalDAM: "SUNAT_Envio_IndicadorTrasladoTotalDAMoDS",
      datosTransportista: "SUNAT_Envio_IndicadorVehiculoConductoresTransp",
    };

    // Crear un Set con las instrucciones actuales (solo los textos)
    const instructionsSet = new Set(
      currentInstructions.map((item: any) => item._text)
    );

    // Agregar o quitar según el estado de cada toggle
    if (retornoVehiculoVacio) {
      instructionsSet.add(instructionMap.retornoVehiculoVacio);
    } else {
      instructionsSet.delete(instructionMap.retornoVehiculoVacio);
    }

    if (retornoEnvasesVacios) {
      instructionsSet.add(instructionMap.retornoEnvasesVacios);
    } else {
      instructionsSet.delete(instructionMap.retornoEnvasesVacios);
    }

    if (transbordoProgramado) {
      instructionsSet.add(instructionMap.transbordoProgramado);
    } else {
      instructionsSet.delete(instructionMap.transbordoProgramado);
    }

    if (vehiculosCategoriaM1L) {
      instructionsSet.add(instructionMap.vehiculosCategoriaM1L);
    } else {
      instructionsSet.delete(instructionMap.vehiculosCategoriaM1L);
    }

    if (trasladoTotalDAM) {
      instructionsSet.add(instructionMap.trasladoTotalDAM);
    } else {
      instructionsSet.delete(instructionMap.trasladoTotalDAM);
    }

    // Solo agregar indicador de datos de transportista si NO es transporte privado
    if (datosTransportista && !isTransportePrivado) {
      instructionsSet.add(instructionMap.datosTransportista);
    } else {
      instructionsSet.delete(instructionMap.datosTransportista);
    }

    // Convertir el Set de vuelta a array de objetos
    const newInstructions = Array.from(instructionsSet).map((text) => ({
      _text: text,
    }));

    return {
      ...body,
      "cac:Shipment": {
        ...shipment,
        "cbc:SpecialInstructions": newInstructions.length > 0 ? newInstructions : [],
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
    retornoVehiculoVacio: instructionsSet.has("SUNAT_Envio_IndicadorRetornoVehiculoVacio"),
    retornoEnvasesVacios: instructionsSet.has("SUNAT_Envio_IndicadorRetornoVehiculoEnvaseVacio"),
    transbordoProgramado: instructionsSet.has("SUNAT_Envio_IndicadorTransbordoProgramado"),
    vehiculosCategoriaM1L: instructionsSet.has("SUNAT_Envio_IndicadorTrasladoVehiculoM1L"),
    trasladoTotalDAM: instructionsSet.has("SUNAT_Envio_IndicadorTrasladoTotalDAMoDS"),
    datosTransportista: instructionsSet.has("SUNAT_Envio_IndicadorVehiculoConductoresTransp"),
  };
}
