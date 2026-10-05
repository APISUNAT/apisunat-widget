<script lang="ts">
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { CATALOGO06 } from "$lib/constants/catalagos";
  import { plusIcon, trashIcon, identificationIcon , userIcon } from "$lib/constants/icons.constants";
  import { documentLoaded } from "$lib/store/document.store";
  import {
    setDriversActions,
    getDriversData,
    type Driver,
  } from "./drivers.component";

  let { hidden = false, enabled = false } = $props();

  let drivers = $state<Driver[]>([]);
  let isReady = $state(false);
  let hydrateToken = 0;

  // Filtrar catálogo 06: excluir RUC (6) y SIN DOCUMENTO (-)
  const filteredCatalogo06 = CATALOGO06.filter(
    (item) => item.value !== "6" && item.value !== "-"
  );

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getDriversData();
      drivers = data.length > 0 ? data : [];

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

    // Asegurar que el primer conductor sea "Principal" y los demás "Secundario"
    const driversWithTypes = drivers.map((driver, index) => ({
      ...driver,
      driverType: index === 0 ? "Principal" : "Secundario"
    }));

    setDriversActions(driversWithTypes, enabled);
  });

  function addDriver() {
    drivers = [...drivers, {
      documentType: "1",
      documentNumber: "",
      firstName: "",
      lastName: "",
      driverType: drivers.length === 0 ? "Principal" : "Secundario",
      licenseNumber: ""
    }];
  }

  function removeDriver(index: number) {
    drivers = drivers.filter((_, i) => i !== index);
  }
</script>

<div class:hidden>
  {#if drivers.length === 0}
    <div class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <p class="text-sm text-gray-500 mb-3">No hay conductores agregados</p>
      <button
        type="button"
        onclick={addDriver}
        class="flex items-center gap-2 text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {@html plusIcon}
        Agregar Conductor
      </button>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-3">
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]">
        Conductores
      </p>
      <button
        type="button"
        onclick={addDriver}
        class="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {@html plusIcon}
        Agregar Conductor
      </button>
    </div>

    <div class="space-y-3">
      {#each drivers as driver, index (index)}
        <div class="border border-gray-200 rounded-lg p-3 relative">
          {#if drivers.length > 0}
            <button
              type="button"
              onclick={() => removeDriver(index)}
              class="absolute top-2 right-2 flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1"
              title="Eliminar conductor"
            >
              {@html trashIcon}
            </button>
          {/if}

          <div class="grid gap-3">
            <div class="grid gap-3 md:grid-cols-2">
              <Select
                label="Tipo de documento"
                bind:value={driver.documentType}
                options={filteredCatalogo06}
              />
              <Input
                label="Número de documento"
                placeholder="Ej: 16684243"
                bind:value={driver.documentNumber}
                icon={identificationIcon}
              />
            </div>

            <div class="grid gap-3 md:grid-cols-2">
              <Input
                label="Nombres"
                placeholder="Ej: JAVIER"
                bind:value={driver.firstName}
                icon={userIcon}
              />
              <Input
                label="Apellidos"
                placeholder="Ej: QUISPE PAUCAR"
                bind:value={driver.lastName}
                icon={userIcon}
              />
            </div>

            <Input
              label="# Licencia"
              placeholder="Ej: S46862927"
              bind:value={driver.licenseNumber}
              pattern={`[A-Z0-9]{9,10}`}
              maxLength={10}
              required={true}
              icon={identificationIcon}
            />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
