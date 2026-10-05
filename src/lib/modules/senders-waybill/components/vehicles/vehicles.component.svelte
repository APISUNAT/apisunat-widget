<script lang="ts">
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { catalogoD37 } from "$lib/constants/catalagos";
  import { plusIcon, trashIcon, identificationIcon , packageIcon } from "$lib/constants/icons.constants";
  import { documentLoaded } from "$lib/store/document.store";
  import {
    setVehiclesActions,
    getVehiclesData,
    type Vehicle,
  } from "./vehicles.component";

  let { hidden = false, enabled = false } = $props();

  let vehicles = $state<Vehicle[]>([]);
  let isReady = $state(false);
  let hydrateToken = 0;

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getVehiclesData();
      // Solo cargar datos si existen, no crear uno vacío por defecto
      vehicles = data.length > 0 ? data : [];

      requestAnimationFrame(() => {
        if (token === hydrateToken) {
          isReady = true;
        }
      });
    }
  });

  // Sincronizar con el store cuando cambian los valores
  // Solo se ejecuta si enabled es true para evitar bucle infinito
  $effect(() => {
    if (!isReady) return;
    if (!enabled) return; // CRÍTICO: Evita bucle infinito cuando M1L está activo
    setVehiclesActions(vehicles, enabled);
  });

  function addVehicle() {
    vehicles = [...vehicles, { plate: "", tucChv: "", authorizationType: "", authorization: "" }];
  }

  function removeVehicle(index: number) {
    vehicles = vehicles.filter((_, i) => i !== index);
  }
</script>

<div class:hidden>
  {#if vehicles.length === 0}
    <div class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <p class="text-sm text-gray-500 mb-3">No hay vehículos agregados</p>
      <button
        type="button"
        onclick={addVehicle}
        class="flex items-center gap-2 text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {@html plusIcon}
        Agregar Vehículo
      </button>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-3">
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]">
        Vehículos
      </p>
      <button
        type="button"
        onclick={addVehicle}
        class="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {@html plusIcon}
        Agregar Vehículo
      </button>
    </div>

    <div class="space-y-3">
      {#each vehicles as vehicle, index (index)}
        <div class="border border-gray-200 rounded-lg p-3 relative">
          {#if vehicles.length > 0}
            <button
              type="button"
              onclick={() => removeVehicle(index)}
              class="absolute top-2 right-2 flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1"
              title="Eliminar vehículo"
            >
              {@html trashIcon}
            </button>
          {/if}

          <div class="grid gap-3">
            <div class="grid gap-3 md:grid-cols-2">
              <Input
                label="Placa"
                placeholder="Ej: BFJ901"
                bind:value={vehicle.plate}
                pattern={`[A-Z0-9]{6,8}`}
                maxLength={8}
                required={true}
                icon={packageIcon}
              />
              <Input
                label="TUC / CHV"
                placeholder="Ej: AZZ5656A888"
                bind:value={vehicle.tucChv}
                pattern={`[A-Z0-9]{10,15}`}
                maxLength={15}
                icon={identificationIcon}
              />
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <Select
                label="Tipo de Autorización"
                placeholder="Entidad emisora"
                bind:value={vehicle.authorizationType}
                options={[{ value: "", label: "Entidad emisora" }, ...catalogoD37]}
              />
              <Input
                label="# Autorización"
                placeholder="Ej: RDASASASA"
                bind:value={vehicle.authorization}
                pattern={`[A-Z0-9]{3,50}`}
                maxLength={50}
                icon={identificationIcon}
              />
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
