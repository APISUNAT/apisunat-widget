<script lang="ts">
  import Toggle from "$lib/shared/ui/toggle.svelte";
  import ShipmentInfo from "$lib/modules/senders-waybill/components/shipment-info/shipment-info.component.svelte";
  import SellerSupplierParty from "$lib/modules/senders-waybill/components/seller-supplier-party/seller-supplier-party.component.svelte";
  import BuyerCustomerParty from "$lib/modules/senders-waybill/components/buyer-customer-party/buyer-customer-party.component.svelte";
  import CarrierParty from "$lib/modules/senders-waybill/components/carrier-party/carrier-party.component.svelte";
  import PortLocation from "$lib/modules/senders-waybill/components/port-location/port-location.component.svelte";
  import Vehicles from "$lib/modules/senders-waybill/components/vehicles/vehicles.component.svelte";
  import Drivers from "$lib/modules/senders-waybill/components/drivers/drivers.component.svelte";
  import { documentLoaded, documentStore } from "$lib/store/document.store";
  import {
    setDeliveryOptionsActions,
    getDeliveryOptionsData,
  } from "./delivery-options.component";

  let { hidden = false } = $props();

  let retornoVehiculoVacio = $state(false);
  let retornoEnvasesVacios = $state(false);
  let transbordoProgramado = $state(false);
  let vehiculosCategoriaM1L = $state(false);
  let trasladoTotalDAM = $state(false);
  let datosTransportista = $state(false);

  let isReady = $state(false);
  let hydrateToken = 0;

  const handlingCode = $derived($documentStore?.["cac:Shipment"]?.["cbc:HandlingCode"]?._text || "");
  const transportModeCode = $derived($documentStore?.["cac:Shipment"]?.["cac:ShipmentStage"]?.["cbc:TransportModeCode"]?._text || "01");

  const isTrasladoTotalEnabled = $derived(
    handlingCode === "08" || handlingCode === "09"
  );

  const isTransportePrivado = $derived(transportModeCode === "02");

  // Mostrar datos del proveedor solo en Traslado por Compra (02)
  const showSellerSupplier = $derived(handlingCode === "02"||handlingCode === "07"||handlingCode === "13");

  // Mostrar datos del comprador solo en Venta con entrega a terceros (03)
  const showBuyerCustomer = $derived(handlingCode === "03"||handlingCode === "13");

  // Mostrar puerto/aeropuerto solo en Importación (08) o Exportación (09)
  const showPortLocation = $derived(handlingCode === "08" || handlingCode === "09");

  // Desactivar automáticamente el traslado total si cambia el tipo de operación
  $effect(() => {
    if (!isTrasladoTotalEnabled && trasladoTotalDAM) {
      trasladoTotalDAM = false;
    }
  });

  // Sincronizar con el store cuando cambian los valores
  $effect(() => {
    if (!isReady) return;

    setDeliveryOptionsActions(
      retornoVehiculoVacio,
      retornoEnvasesVacios,
      transbordoProgramado,
      vehiculosCategoriaM1L,
      trasladoTotalDAM,
      datosTransportista
    );
  });

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getDeliveryOptionsData();

      retornoVehiculoVacio = data.retornoVehiculoVacio;
      retornoEnvasesVacios = data.retornoEnvasesVacios;
      transbordoProgramado = data.transbordoProgramado;
      vehiculosCategoriaM1L = data.vehiculosCategoriaM1L;
      trasladoTotalDAM = data.trasladoTotalDAM;
      datosTransportista = data.datosTransportista;

      requestAnimationFrame(() => {
        if (token === hydrateToken) {
          isReady = true;
        }
      });
    }
  });
</script>

<div class:hidden>
  <div class="grid grid-cols-2 gap-6">
    <!-- Columna izquierda: Toggles -->
    <div class="min-w-0 pl-8">
      <div class="grid grid-cols-2 gap-x-4 gap-y-4">
        <Toggle
          label="Retorno de Vehículo Vacío"
          bind:checked={retornoVehiculoVacio}
          disabled={retornoEnvasesVacios}
        />

        <Toggle
          label="Retorno con Envases Vacíos"
          bind:checked={retornoEnvasesVacios}
          disabled={retornoVehiculoVacio}
        />

        <Toggle
          label="Transbordo Programado"
          bind:checked={transbordoProgramado}
        />

        <Toggle
          label="Vehículos Categoría M1 o L"
          bind:checked={vehiculosCategoriaM1L}
          disabled={datosTransportista}
        />

        <Toggle
          label="Traslado total (DAM o DS)"
          bind:checked={trasladoTotalDAM}
          disabled={!isTrasladoTotalEnabled}
        />

        <Toggle
          label="Datos del Transportista"
          bind:checked={datosTransportista}
          disabled={vehiculosCategoriaM1L || isTransportePrivado}
        />
      </div>
    </div>

    <!-- Columna derecha: Tipo de operación y modalidad -->
    <div class="min-w-0">
      <ShipmentInfo />
    </div>
  </div>

  <!-- Datos del Proveedor: solo visible cuando el motivo es Traslado por Compra (02) -->
  <div class="mt-4" class:hidden={!showSellerSupplier}>
    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-3">
      Datos del Proveedor
    </div>
    <SellerSupplierParty hidden={!showSellerSupplier} />
  </div>

  <!-- Datos del Comprador: solo visible cuando el motivo es Venta con entrega a terceros (03) -->
  <div class="mt-4" class:hidden={!showBuyerCustomer}>
    <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-3">
      Datos del Comprador
    </div>
    <BuyerCustomerParty hidden={!showBuyerCustomer} />
  </div>

  <!-- Datos del Transportista (solo en Transporte Público) -->
  <div class="mt-4" class:hidden={isTransportePrivado}>
    <CarrierParty enabled={!isTransportePrivado} />
  </div>

  <!-- Puerto/Aeropuerto y Bultos: solo visible en Importación (08) o Exportación (09) -->
  <div class="mt-4" class:hidden={!showPortLocation}>
    <PortLocation hidden={!showPortLocation} />
  </div>

  <!-- Vehículos y Conductores: ocultos cuando M1L está activo, pero mantienen datos -->
  <div class="mt-4 space-y-4" class:hidden={vehiculosCategoriaM1L || (!isTransportePrivado && !datosTransportista)}>
    <Vehicles enabled={!vehiculosCategoriaM1L && (isTransportePrivado || datosTransportista)} />
    <Drivers enabled={!vehiculosCategoriaM1L && (isTransportePrivado || datosTransportista)} />
  </div>
</div>