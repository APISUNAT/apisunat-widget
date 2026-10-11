import { get } from 'svelte/store';
import { documentStore } from '$lib/store/document.store';

export interface PortLocationData {
  portCode: string;
  locationType: string; // "1" = Puerto, "2" = Aeropuerto
  portName: string;
  container1: string;
  container2: string;
  seal1: string;
  seal2: string;
  packageQuantity: string;
}

/**
 * Establece los datos de Puerto/Aeropuerto (FirstArrivalPortLocation)
 * y Contenedores/Precintos (TransportHandlingUnit)
 * Este campo solo se usa en:
 * - Importación (HandlingCode = 08)
 * - Exportación (HandlingCode = 09)
 */
export function setPortLocationActions(data: PortLocationData) {
  documentStore.update(body => {
    const shipment = body["cac:Shipment"] || {};

    // Si no hay datos, eliminar los campos completamente
    if (!data.portCode.trim() || !data.locationType.trim()) {
      const { "cac:FirstArrivalPortLocation": _, "cac:TransportHandlingUnit": __, ...restShipment } = shipment;
      return {
        ...body,
        "cac:Shipment": restShipment
      };
    }

    // Construir TransportHandlingUnit para contenedores y precintos
    const transportHandlingUnits: any[] = [];

    // Agregar primer contenedor/precinto si tiene datos
    if (data.container1.trim() || data.seal1.trim()) {
      transportHandlingUnits.push({
        "cbc:ID": {
          "_text": data.container1
        },
        "cac:TransportEquipment": {
          "cbc:ID": {
            "_text": data.seal1
          }
        }
      });
    }

    // Agregar segundo contenedor/precinto si tiene datos
    if (data.container2.trim() || data.seal2.trim()) {
      transportHandlingUnits.push({
        "cbc:ID": {
          "_text": data.container2
        },
        "cac:TransportEquipment": {
          "cbc:ID": {
            "_text": data.seal2
          }
        }
      });
    }

    // Construir Package si hay cantidad de bultos
    const packageData = data.packageQuantity.trim() ? {
      "cac:Package": {
        "cbc:Quantity": {
          "_text": data.packageQuantity
        }
      }
    } : null;

    // Construir el objeto shipment
    const updatedShipment: any = {
      ...shipment,
      "cac:FirstArrivalPortLocation": {
        "cbc:ID": {
          "_text": data.portCode
        },
        "cbc:LocationTypeCode": {
          "_text": data.locationType
        },
        "cbc:Name": {
          "_text": data.portName
        }
      }
    };

    // Agregar TransportHandlingUnit solo si hay contenedores o cantidad de bultos
    if (transportHandlingUnits.length > 0 || packageData) {
      if (transportHandlingUnits.length > 0 && packageData) {
        // Ambos: agregar package a cada handling unit
        updatedShipment["cac:TransportHandlingUnit"] = transportHandlingUnits.map(unit => ({
          ...unit,
          ...packageData
        }));
      } else if (transportHandlingUnits.length > 0) {
        // Solo contenedores
        updatedShipment["cac:TransportHandlingUnit"] = transportHandlingUnits;
      } else if (packageData) {
        // Solo cantidad de bultos
        updatedShipment["cac:TransportHandlingUnit"] = [packageData];
      }
    }

    return {
      ...body,
      "cac:Shipment": updatedShipment
    };
  });
}

/**
 * Obtiene los datos de Puerto/Aeropuerto del store
 */
export function getPortLocationData(): PortLocationData {
  const doc = get(documentStore);
  const shipment = doc["cac:Shipment"];
  const portLocation = shipment?.["cac:FirstArrivalPortLocation"];

  if (!portLocation) {
    return {
      portCode: '',
      locationType: '1',
      portName: '',
      container1: '',
      container2: '',
      seal1: '',
      seal2: '',
      packageQuantity: ''
    };
  }

  // Obtener contenedores y precintos
  const transportHandlingUnits = shipment?.["cac:TransportHandlingUnit"];
  let container1 = '';
  let container2 = '';
  let seal1 = '';
  let seal2 = '';
  let packageQuantity = '';

  if (transportHandlingUnits) {
    const units = Array.isArray(transportHandlingUnits) ? transportHandlingUnits : [transportHandlingUnits];

    // Primer contenedor/precinto
    if (units[0]) {
      container1 = units[0]["cbc:ID"]?._text ?? '';
      seal1 = units[0]["cac:TransportEquipment"]?.["cbc:ID"]?._text ?? '';

      // Extraer cantidad de bultos del primer unit
      if (units[0]["cac:Package"]?.["cbc:Quantity"]?._text) {
        packageQuantity = units[0]["cac:Package"]["cbc:Quantity"]._text;
      }
    }

    // Segundo contenedor/precinto
    if (units[1]) {
      container2 = units[1]["cbc:ID"]?._text ?? '';
      seal2 = units[1]["cac:TransportEquipment"]?.["cbc:ID"]?._text ?? '';
    }
  }

  return {
    portCode: portLocation["cbc:ID"]?._text ?? '',
    locationType: portLocation["cbc:LocationTypeCode"]?._text ?? '1',
    portName: portLocation["cbc:Name"]?._text ?? '',
    container1,
    container2,
    seal1,
    seal2,
    packageQuantity
  };
}
