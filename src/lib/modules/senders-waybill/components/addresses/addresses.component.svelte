<script lang="ts">
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { locationIcon } from "$lib/constants/icons.constants";
  import { documentLoaded } from "$lib/store/document.store";
  import {
    setAddressesActions,
    getAddressesData,
  } from "./addresses.component";
  import {
    getRegionList,
    getProvinceList,
    getDistrictList,
  } from "$lib/constants/ubigueo.constants";

  let { hidden = false } = $props();

  // Punto de partida
  let departureDepartamento = $state("");
  let departureProvincia = $state("");
  let departureDistrito = $state("");
  let departureAddress = $state("");

  // Punto de llegada
  let arrivalDepartamento = $state("");
  let arrivalProvincia = $state("");
  let arrivalDistrito = $state("");
  let arrivalAddress = $state("");

  let isReady = $state(false);
  let hydrateToken = 0;

  // Opciones para los selects
  const departamentosOptions = [
    { value: "", label: "Debe seleccionar..." },
    ...getRegionList().map((item) => ({
      value: item.r,
      label: item.n,
    }))
  ];

  const departureProvienciasOptions = $derived(
    departureDepartamento
      ? [
          { value: "", label: "Debe seleccionar..." },
          ...getProvinceList(departureDepartamento).map((item) => ({
            value: item.r + item.p,
            label: item.n,
          }))
        ]
      : [{ value: "", label: "Debe seleccionar..." }]
  );

  const departureDistritosOptions = $derived(
    departureProvincia && departureProvincia.length === 4
      ? [
          { value: "", label: "Debe seleccionar..." },
          ...getDistrictList(departureProvincia.substring(0, 2), departureProvincia.substring(2, 4)).map((item) => ({
            value: item.r + item.p + item.d,
            label: item.n,
          }))
        ]
      : [{ value: "", label: "Debe seleccionar..." }]
  );

  const arrivalProvienciasOptions = $derived(
    arrivalDepartamento
      ? [
          { value: "", label: "Debe seleccionar..." },
          ...getProvinceList(arrivalDepartamento).map((item) => ({
            value: item.r + item.p,
            label: item.n,
          }))
        ]
      : [{ value: "", label: "Debe seleccionar..." }]
  );

  const arrivalDistritosOptions = $derived(
    arrivalProvincia && arrivalProvincia.length === 4
      ? [
          { value: "", label: "Debe seleccionar..." },
          ...getDistrictList(arrivalProvincia.substring(0, 2), arrivalProvincia.substring(2, 4)).map((item) => ({
            value: item.r + item.p + item.d,
            label: item.n,
          }))
        ]
      : [{ value: "", label: "Debe seleccionar..." }]
  );

  // Resetear provincia cuando cambia departamento de partida
  $effect(() => {
    if (isReady && departureDepartamento) {
      if (departureProvincia && departureProvincia.substring(0, 2) !== departureDepartamento) {
        departureProvincia = "";
        departureDistrito = "";
      }
    }
  });

  // Resetear distrito cuando cambia provincia de partida
  $effect(() => {
    if (isReady && departureProvincia) {
      if (departureDistrito && departureDistrito.substring(0, 4) !== departureProvincia) {
        departureDistrito = "";
      }
    }
  });

  // Resetear provincia cuando cambia departamento de llegada
  $effect(() => {
    if (isReady && arrivalDepartamento) {
      if (arrivalProvincia && arrivalProvincia.substring(0, 2) !== arrivalDepartamento) {
        arrivalProvincia = "";
        arrivalDistrito = "";
      }
    }
  });

  // Resetear distrito cuando cambia provincia de llegada
  $effect(() => {
    if (isReady && arrivalProvincia) {
      if (arrivalDistrito && arrivalDistrito.substring(0, 4) !== arrivalProvincia) {
        arrivalDistrito = "";
      }
    }
  });

  // Sincronizar con el store cuando cambian los valores
  $effect(() => {
    if (!isReady) return;

    setAddressesActions(
      departureDistrito,
      departureAddress,
      arrivalDistrito,
      arrivalAddress
    );
  });

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getAddressesData();

      // Punto de partida
      if (data.departureUbigeo && data.departureUbigeo.length === 6) {
        const r = data.departureUbigeo.substring(0, 2);
        const p = data.departureUbigeo.substring(2, 4);
        const d = data.departureUbigeo.substring(4, 6);

        departureDepartamento = r;
        departureProvincia = r + p;
        departureDistrito = r + p + d;
      }
      departureAddress = data.departureAddress;

      // Punto de llegada
      if (data.arrivalUbigeo && data.arrivalUbigeo.length === 6) {
        const r = data.arrivalUbigeo.substring(0, 2);
        const p = data.arrivalUbigeo.substring(2, 4);
        const d = data.arrivalUbigeo.substring(4, 6);

        arrivalDepartamento = r;
        arrivalProvincia = r + p;
        arrivalDistrito = r + p + d;
      }
      arrivalAddress = data.arrivalAddress;

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
    <!-- Punto de Partida -->
    <div>
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-2 text-center">
        Punto de Partida
      </p>
      <div class="grid gap-3" style="grid-template-columns: 22fr 22fr 22fr 34fr;">
        <Select
          placeholder="Departamento"
          showLabel={false}
          bind:value={departureDepartamento}
          options={departamentosOptions}
        />
        <Select
          placeholder="Provincia"
          showLabel={false}
          bind:value={departureProvincia}
          options={departureProvienciasOptions}
          disabled={!departureDepartamento}
        />
        <Select
          placeholder="Distrito"
          showLabel={false}
          bind:value={departureDistrito}
          options={departureDistritosOptions}
          disabled={!departureProvincia}
        />
        <Input
          placeholder="Dirección completa"
          showLabel={false}
          bind:value={departureAddress}
          icon={locationIcon}
        />
      </div>
    </div>

    <!-- Punto de Llegada -->
    <div>
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-2 text-center">
        Punto de Llegada
      </p>
      <div class="grid gap-3" style="grid-template-columns: 22fr 22fr 22fr 34fr;">
        <Select
          placeholder="Departamento"
          showLabel={false}
          bind:value={arrivalDepartamento}
          options={departamentosOptions}
        />
        <Select
          placeholder="Provincia"
          showLabel={false}
          bind:value={arrivalProvincia}
          options={arrivalProvienciasOptions}
          disabled={!arrivalDepartamento}
        />
        <Select
          placeholder="Distrito"
          showLabel={false}
          bind:value={arrivalDistrito}
          options={arrivalDistritosOptions}
          disabled={!arrivalProvincia}
        />
        <Input
          placeholder="Dirección completa"
          showLabel={false}
          bind:value={arrivalAddress}
          icon={locationIcon}
        />
      </div>
    </div>
  </div>
</div>
