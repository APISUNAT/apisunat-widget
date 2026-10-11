<script lang="ts">
  import { untrack } from "svelte";
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentLoaded } from "$lib/store/document.store";
  import { catalogo63 } from "$lib/constants/catalagos";
  import { containerIcon, sealIcon, packagesIcon } from "$lib/constants/icons.constants";
  import {
    getPortLocationData,
    setPortLocationActions,
  } from "./port-location.component";

  let { hidden = false } = $props();

  let portCode = $state("");
  let locationType = $state("1"); // 1 = Puerto, 2 = Aeropuerto
  let portName = $state("");
  let container1 = $state("");
  let container2 = $state("");
  let seal1 = $state("");
  let seal2 = $state("");
  let packageQuantity = $state("");
  let isReady = $state(false);
  let hydrateToken = 0;

  const locationTypes = [
    { value: "1", label: "Puerto" },
    { value: "2", label: "Aeropuerto" },
  ];

  // Filtrar opciones según el tipo de ubicación
  const filteredPortOptions = $derived(
    locationType === "1"
      ? catalogo63.filter(p => p.value !== "AER") // Puertos
      : catalogo63.filter(p => p.value === "AER") // Aeropuertos
  );

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getPortLocationData();

      portCode = data.portCode;
      locationType = data.locationType;
      portName = data.portName;
      container1 = data.container1;
      container2 = data.container2;
      seal1 = data.seal1;
      seal2 = data.seal2;
      packageQuantity = data.packageQuantity;

      requestAnimationFrame(() => {
        if (token === hydrateToken) {
          isReady = true;
        }
      });
    }
  });

  // Sincronizar con el store cuando cambian los valores
  $effect(() => {
    const pc = portCode;
    const lt = locationType;
    const pn = portName;
    const c1 = container1;
    const c2 = container2;
    const s1 = seal1;
    const s2 = seal2;
    const pq = packageQuantity;
    const ready = isReady;

    if (!ready) return;

    untrack(() => {
      setPortLocationActions({
        portCode: pc,
        locationType: lt,
        portName: pn,
        container1: c1,
        container2: c2,
        seal1: s1,
        seal2: s2,
        packageQuantity: pq,
      });
    });
  });

  // Actualizar nombre cuando se selecciona un puerto
  $effect(() => {
    if (!isReady) return;

    const selectedPort = catalogo63.find((p) => p.value === portCode);
    if (selectedPort) {
      portName = selectedPort.label;
    }
  });
</script>

<div class:hidden>
  <div class="grid gap-6 md:grid-cols-[2fr_3fr]">
    <!-- Columna izquierda (2fr = 40%): Contenedores y Precintos -->
    <div>
      <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-3">
        Contenedor y Precinto
      </div>

      <div class="space-y-2">
        <div class="grid gap-3 grid-cols-2">
          <Input
            placeholder="Contenedor 1"
            showLabel={false}
            bind:value={container1}
            icon={containerIcon}
          />

          <Input
            placeholder="Precinto 1"
            showLabel={false}
            bind:value={seal1}
            icon={sealIcon}
          />
        </div>

        <div class="grid gap-3 grid-cols-2">
          <Input
            placeholder="Contenedor 2"
            showLabel={false}
            bind:value={container2}
            icon={containerIcon}
          />

          <Input
            placeholder="Precinto 2"
            showLabel={false}
            bind:value={seal2}
            icon={sealIcon}
          />
        </div>
      </div>
    </div>

    <!-- Columna derecha (3fr = 60%): Puerto/Aeropuerto y Bultos -->
    <div>
      <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-3">
        Puerto/Aeropuerto y Bultos
      </div>

      <div class="space-y-2">
        <div class="grid gap-3 grid-cols-[2fr_3fr]">
          <Select
            placeholder="Puerto / Aeropuerto"
            showLabel={false}
            options={locationTypes}
            bind:value={locationType}
          />

          <Select
            placeholder="Selecciona puerto/aeropuerto"
            showLabel={false}
            options={filteredPortOptions}
            bind:value={portCode}
          />
        </div>

        <div class="grid gap-3 grid-cols-2">
          <div></div>
          <Input
            placeholder="Bultos"
            showLabel={false}
            bind:value={packageQuantity}
            type="number"
            icon={packagesIcon}
          />
        </div>
      </div>
    </div>
  </div>
</div>
