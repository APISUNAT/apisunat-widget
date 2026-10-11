/**
 * Constantes para los indicadores de SUNAT en SpecialInstructions
 */
export const DELIVERY_INDICATORS = {
  RETORNO_VEHICULO_VACIO: "SUNAT_Envio_IndicadorRetornoVehiculoVacio",
  RETORNO_ENVASES_VACIOS: "SUNAT_Envio_IndicadorRetornoVehiculoEnvaseVacio",
  TRANSBORDO_PROGRAMADO: "SUNAT_Envio_IndicadorTransbordoProgramado",
  VEHICULO_M1L: "SUNAT_Envio_IndicadorTrasladoVehiculoM1L",
  TRASLADO_TOTAL_DAM: "SUNAT_Envio_IndicadorTrasladoTotalDAMoDS",
  DATOS_TRANSPORTISTA: "SUNAT_Envio_IndicadorVehiculoConductoresTransp",
} as const;

/**
 * Códigos de modalidad de transporte
 */
export const TRANSPORT_MODE_CODES = {
  PUBLICO: "01",
  PRIVADO: "02",
} as const;
