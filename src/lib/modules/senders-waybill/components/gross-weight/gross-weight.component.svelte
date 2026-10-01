<script lang="ts">
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { weightIcon } from "$lib/constants/icons.constants";
  import { documentLoaded } from "$lib/store/document.store";
  import {
    setGrossWeightActions,
    getGrossWeightData,
  } from "./gross-weight.component";

  let { hidden = false } = $props();

  let value = $state("");
  let unitCode = $state("KGM");

  let isReady = $state(false);
  let hydrateToken = 0;

  const unitOptions = [
    { value: "TNE", label: "Toneladas" },
    { value: "KGM", label: "Kilogramos" },
  ];

  // Sincronizar con el store cuando cambian los valores
  $effect(() => {
    if (!isReady) return;
    setGrossWeightActions(value, unitCode);
  });

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getGrossWeightData();
      value = data.value;
      unitCode = data.unitCode;

      requestAnimationFrame(() => {
        if (token === hydrateToken) {
          isReady = true;
        }
      });
    }
  });
</script>

<div class:hidden>
  <div class="flex justify-end">
    <div class="w-1/2">
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-3">
        Peso Bruto Total
      </p>
      <div class="grid gap-3 grid-cols-2">
        <Select
          placeholder="Unidad"
          showLabel={false}
          bind:value={unitCode}
          options={unitOptions}
        />
        <Input
          placeholder="500.000"
          showLabel={false}
          bind:value={value}
          icon={weightIcon}
          onlyNumbers={true}
          maxDecimals={3}
        />
      </div>
    </div>
  </div>
</div>
