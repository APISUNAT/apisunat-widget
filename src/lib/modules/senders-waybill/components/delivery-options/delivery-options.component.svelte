<script lang="ts">
  import Toggle from "$lib/shared/ui/toggle.svelte";
  import ShipmentInfo from "$lib/modules/senders-waybill/components/shipment-info/shipment-info.component.svelte";
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
        />

        <Toggle
          label="Retorno con Envases Vacíos"
          bind:checked={retornoEnvasesVacios}
        />

        <Toggle
          label="Transbordo Programado"
          bind:checked={transbordoProgramado}
        />

        <Toggle
          label="Vehículos Categoría M1 o L"
          bind:checked={vehiculosCategoriaM1L}
        />

        <Toggle
          label="Traslado total (DAM o DS)"
          bind:checked={trasladoTotalDAM}
        />

        <Toggle
          label="Datos del Transportista"
          bind:checked={datosTransportista}
        />
      </div>
    </div>

    <!-- Columna derecha: Tipo de operación y modalidad -->
    <div class="min-w-0">
      <ShipmentInfo />
    </div>
  </div>
</div>