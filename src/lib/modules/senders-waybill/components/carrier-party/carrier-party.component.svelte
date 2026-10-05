<script lang="ts">
  import { identificationIcon, userIcon } from "$lib/constants/icons.constants";
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentLoaded } from "$lib/store/document.store";
  import {
    setCarrierPartyActions,
    getCarrierPartyData,
    fetchCarrierByRUC,
  } from "./carrier-party.component";

  let { hidden = false, enabled = true } = $props();

  let documentType = $state("6");
  let documentNumber = $state("");
  let name = $state("");
  let mtcRegistration = $state("");

  let isReady = $state(false);
  let hydrateToken = 0;

  const filteredCatalogo06 = [{ value: "6", label: "RUC" }];
  const isRucComplete = $derived(documentNumber.length === 11);

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getCarrierPartyData();

      documentType = data.documentType;
      documentNumber = data.documentNumber;
      name = data.name;
      mtcRegistration = data.mtcRegistration;

      requestAnimationFrame(() => {
        if (token === hydrateToken) {
          isReady = true;
        }
      });
    }
  });

  // Sincronizar con el store cuando cambian los valores
  $effect(() => {
    if (!isReady) return;

    setCarrierPartyActions({
      documentType,
      documentNumber,
      name,
      mtcRegistration,
    }, enabled);
  });

  // Buscar transportista por RUC automáticamente (primero en caché, luego API)
  $effect(() => {
    const ruc = documentNumber;
    const token = hydrateToken;

    if (!isReady || !isRucComplete) return;

    fetchCarrierByRUC(ruc)
      .then((data) => {
        if (token !== hydrateToken) return;
        if (data) {
          name = data.name ?? name;
        }
      })
      .catch(() => {
        // Ignorar errores
      });
  });
</script>

<div class:hidden>
  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-3">
    Datos del Transportista
  </p>

  <div class="grid gap-3 grid-cols-[minmax(0,2fr)_120px_180px_minmax(0,1fr)]">
    <Input
      placeholder="Nombre / Razón social"
      showLabel={false}
      bind:value={name}
      icon={userIcon}
    />
    <Select
      placeholder="Tipo"
      showLabel={false}
      bind:value={documentType}
      options={filteredCatalogo06}
      required
      disabled={true}
    />
    <Input
      placeholder="RUC"
      showLabel={false}
      bind:value={documentNumber}
      icon={identificationIcon}
      maxLength={11}
    />
    <Input
      placeholder="Registro MTC"
      showLabel={false}
      bind:value={mtcRegistration}
      pattern={`[A-Z0-9]{0,20}`}
      maxLength={20}
      icon={identificationIcon}
    />
  </div>
</div>
