<script lang="ts">
  import { untrack } from "svelte";
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import {
    buildingIcon,
    identificationIcon,
  } from "$lib/constants/icons.constants";
  import { CATALOGO06 } from "$lib/constants/catalagos";
  import { documentLoaded } from "$lib/store/document.store";
  import {
    getBuyerCustomerPartyData,
    setBuyerCustomerPartyActions,
    isValidRuc,
    fetchBuyerByDocument,
  } from "./buyer-customer-party.component";

  let { hidden = false } = $props();

  let name = $state("");
  let numberDocument = $state("");
  let documentType = $state("6"); // RUC por defecto
  let isReady = $state(false);
  let isLoadingBuyer = $state(false);
  let buyerError = $state("");
  let hydrateToken = 0;

  const isRucValid = $derived.by(() => {
    if (documentType !== "6") return true;
    if (numberDocument.length < 11) return true;
    return isValidRuc(numberDocument);
  });

  const maxLength = $derived(documentType === "6" ? 11 : documentType === "1" ? 8 : undefined);

  const isDocumentComplete = $derived.by(() => {
    if (documentType === "6" && numberDocument.length === 11) return true;
    if (documentType === "1" && numberDocument.length === 8) return true;
    return false;
  });

  // Cargar datos cuando el documento está listo
  $effect(() => {
    if ($documentLoaded) {
      const token = hydrateToken + 1;
      hydrateToken = token;

      const data = getBuyerCustomerPartyData();

      name = data.name;
      numberDocument = data.numberDocument;
      documentType = data.documentType;

      requestAnimationFrame(() => {
        if (token === hydrateToken) {
          isReady = true;
        }
      });
    }
  });

  // Sincronizar con el store cuando cambian los valores
  $effect(() => {
    const n = name.trim();
    const nd = numberDocument.trim();
    const dt = documentType;
    const ready = isReady;

    if (!ready) return;

    untrack(() => {
      setBuyerCustomerPartyActions({
        name: n,
        numberDocument: nd,
        documentType: dt,
      });
    });
  });

  // Buscar comprador por documento automáticamente
  $effect(() => {
    const td = documentType;
    const nd = numberDocument;
    const token = hydrateToken;
    buyerError = "";

    if (!isReady || !isDocumentComplete) return;

    const hadPrefill = Boolean(name.trim());
    isLoadingBuyer = true;

    fetchBuyerByDocument(td, nd)
      .then((data) => {
        if (token !== hydrateToken) return;
        if (data) {
          name = data.name ?? name;
        } else if (!hadPrefill) {
          buyerError = "No se encontraron datos para este documento.";
        }
      })
      .finally(() => {
        if (token === hydrateToken) {
          isLoadingBuyer = false;
        }
      });
  });
</script>

<div class:hidden>
  <div class="grid gap-3 md:grid-cols-[220px_220px_minmax(0,1fr)]">
    <Select
      placeholder="Tipo de Documento"
      showLabel={false}
      options={CATALOGO06}
      bind:value={documentType}
    />

    <Input
      placeholder="Número de Documento"
      showLabel={false}
      bind:value={numberDocument}
      icon={identificationIcon}
      maxLength={maxLength}
      onlyNumbers={documentType === "6" || documentType === "1"}
    />

    <Input
      placeholder="Razón Social / Nombre"
      showLabel={false}
      bind:value={name}
      icon={buildingIcon}
    />
  </div>

  {#if documentType === "6" && numberDocument && !isRucValid}
    <span class="text-xs text-red-500 mt-1 block">
      El RUC debe comenzar con 10, 15, 16, 17 o 20 y tener 11 dígitos.
    </span>
  {/if}

  {#if buyerError}
    <span class="text-xs text-red-500 mt-1 block">{buyerError}</span>
  {/if}
</div>
