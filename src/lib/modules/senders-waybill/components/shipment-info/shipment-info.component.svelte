<script lang="ts">
  import Select from "$lib/shared/ui/select.svelte";
  import { CATALOGO18, CATALOGO20 } from "$lib/constants/catalagos";
  import { documentLoaded } from "$lib/store/document.store";
  import {
    setShipmentInfoActions,
    getShipmentInfoData,
  } from "./shipment-info.component";

  let { hidden = false } = $props();

  let handlingCode = $state("01"); // Traslado por Venta por defecto
  let handlingDescription = $state("");
  let transportModeCode = $state("01"); // Transporte Público por defecto

  let isReady = $state(false);
  let hydrateToken = 0;

  const showOtrosField = $derived(handlingCode === "13");

  // Sincronizar con el store cuando cambian los valores
  $effect(() => {
    if (!isReady) return;

    setShipmentInfoActions(
      handlingCode,
      handlingDescription,
      transportModeCode
    );
  });

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getShipmentInfoData();

      handlingCode = data.handlingCode;
      handlingDescription = data.handlingDescription;
      transportModeCode = data.transportModeCode;

      requestAnimationFrame(() => {
        if (token === hydrateToken) {
          isReady = true;
        }
      });
    }
  });
</script>

<div class:hidden>
  <div class="space-y-3">
    <div class="grid gap-3" class:grid-cols-2={showOtrosField}>
      <Select
        label="Tipo de Operación"
        options={CATALOGO20}
        bind:value={handlingCode}
      />

      {#if showOtrosField}
        <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
          <span class="font-medium">Descripción</span>
          <input
            bind:value={handlingDescription}
            placeholder="Ingrese descripción"
            class="block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 text-sm font-medium text-[var(--form-text-color)] outline-none"
          />
        </div>
      {/if}
    </div>

    <Select
      label="Modalidad de Transporte"
      options={CATALOGO18}
      bind:value={transportModeCode}
    />
  </div>
</div>
