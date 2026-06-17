<script lang="ts">
  import { get } from "svelte/store";
  import { onMount, untrack } from "svelte";
  import Input from "$lib/shared/ui/input.svelte";
  import {
    buildingIcon,
    documentIcon,
    locationIcon,
  } from "$lib/constants/icons.constants";
  import { documentStore, documentLoaded } from "$lib/store/document.store";
  import { runtimeConfigStore } from "$lib/store/config.store";
  import {
    getSupplierData,
    setSupplierActions,
    isValidRuc,
  } from "./supplier.component";
  import { getSupplierGETAsync } from "$lib/api/documents.api";

  let tradeName = $state("");
  let name = $state("");
  let ruc = $state("");
  let address = $state("");
  let codeAddress = $state("0000");
  let isReady = $state(false);
  let isFetching = false;

  const isRucValid = $derived.by(() => {
    if (ruc.length < 11) return true;
    return isValidRuc(ruc);
  });

  onMount(() => {
    const unsubscribe = documentLoaded.subscribe((event) => {
      if (!event) return;

      const { personaId } = get(runtimeConfigStore);
      if (!personaId) return;

      const doc = get(documentStore);

      if ("cac:AccountingSupplierParty" in doc) {
        const data = getSupplierData();
        tradeName = data.tradeName;
        name = data.name;
        ruc = data.ruc;
        address = data.address;
        codeAddress = data.codeAddress;
        isReady = true;
        return;
      }

      if (isFetching) return;
      isFetching = true;

      getSupplierGETAsync()
        .then((supplier) => {
          tradeName = supplier.tradeName ?? "";
          name = supplier.name ?? "";
          ruc = supplier.RUC ?? "";
          address = supplier.address ?? "";
          codeAddress =
            supplier.isAnnex === true
              ? supplier.anexData?.codigoSUNAT ?? "0000"
              : "0000";
        })
        .catch((e) => console.error("Error al obtener supplier:", e))
        .finally(() => {
          isReady = true;
          isFetching = false;
        });
    });

    return unsubscribe;
  });

  $effect(() => {
    const tr = tradeName.trim();
    const n = name.trim();
    const r = ruc.trim();
    const a = address.trim();
    const ca = codeAddress;
    const ready = isReady;

    if (!ready || !r) return;

    untrack(() => {
      setSupplierActions({
        tradeName: tr,
        supplier: n,
        numberDocument: r,
        address: a,
        codeAddress: ca,
      });
    });
  });
</script>

<div class="grid gap-3 md:grid-cols-[2fr_280px_3fr]">
  <Input
    placeholder="Razon social"
    showLabel={false}
    bind:value={name}
    icon={buildingIcon}
  />
  <div class="grid gap-1">
    <Input
      placeholder="RUC emisor"
      showLabel={false}
      bind:value={ruc}
      icon={documentIcon}
      maxLength={11}
      onlyNumbers={true}
    />
    {#if ruc && !isRucValid}
      <span class="text-xs text-red-500">
        El RUC debe comenzar con 10, 15, 17 o 20 y tener 11 dígitos.
      </span>
    {/if}
  </div>
  <Input
    placeholder="Dirección"
    showLabel={false}
    bind:value={address}
    icon={locationIcon}
  />
</div>