<script lang="ts">
  import Toggle from "$lib/shared/ui/toggle.svelte";
  import ShipmentInfo from "$lib/modules/senders-waybill/components/shipment-info/shipment-info.component.svelte";
  import CarrierParty from "$lib/modules/senders-waybill/components/carrier-party/carrier-party.component.svelte";
  import Vehicles from "$lib/modules/senders-waybill/components/vehicles/vehicles.component.svelte";
  import Drivers from "$lib/modules/senders-waybill/components/drivers/drivers.component.svelte";
  import Addresses from "$lib/modules/senders-waybill/components/addresses/addresses.component.svelte";
  import WaybillItems from "$lib/modules/senders-waybill/components/waybill-items/waybill-items.component.svelte";
  import GrossWeight from "$lib/modules/senders-waybill/components/gross-weight/gross-weight.component.svelte";
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
  const isTrasladoTotalEnabled = $derived(
    handlingCode === "08" || handlingCode === "09"
  );

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
          disabled={vehiculosCategoriaM1L}
        />
      </div>
    </div>

    <!-- Columna derecha: Tipo de operación y modalidad -->
    <div class="min-w-0">
      <ShipmentInfo />
    </div>
  </div>

  <!-- Datos del Transportista (siempre visible) -->
  <div class="mt-4">
    <CarrierParty />
  </div>

  <!-- Vehículos y Conductores (solo cuando se activa el toggle) -->
  {#if datosTransportista}
    <div class="mt-4 space-y-4">
      <Vehicles enabled={datosTransportista} />
      <Drivers enabled={datosTransportista} />
    </div>
  {/if}

  <!-- Punto de Partida y Llegada -->
  <div class="mt-4">
    <Addresses />
  </div>

  <!-- Bienes a Transportar -->
  <div class="mt-4">
    <WaybillItems />
  </div>

  <!-- Peso Bruto Total -->
  <div class="mt-4">
    <GrossWeight />
  </div>
</div>