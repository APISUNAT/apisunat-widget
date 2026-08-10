<script lang="ts">
  import { untrack } from "svelte";
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
  let lastLoadedTimestamp = 0;
  let hydrateToken = 0;
  let isFetching = false;

  const isRucValid = $derived.by(() => {
    if (ruc.length < 11) return true;
    return isValidRuc(ruc);
  });

  function hasSupplierData(data: ReturnType<typeof getSupplierData>) {
    return Boolean(data.ruc.trim() || data.name.trim());
  }

  function applySupplierFields(data: {
    tradeName?: string;
    name?: string;
    ruc?: string;
    address?: string;
    codeAddress?: string;
  }) {
    tradeName = data.tradeName ?? "";
    name = data.name ?? "";
    ruc = data.ruc ?? "";
    address = data.address ?? "";
    codeAddress = data.codeAddress || "0000";
  }

  // Re-hidratar en cada loadDocument/initDocument/resetDocument.
  // El store es singleton: al cambiar factura→boleta el host hace loadDocument
  // sin emisor, y un check `"key" in doc` trataba `null` de la plantilla como
  // "ya cargado", dejando la UI con valores viejos y el store vacío.
  $effect(() => {
    const loaded = $documentLoaded;
    const doc = $documentStore;
    const { personaId } = $runtimeConfigStore;

    if (!loaded || !personaId) return;

    if (loaded.timestamp !== lastLoadedTimestamp) {
      lastLoadedTimestamp = loaded.timestamp;
      isReady = false;
      isFetching = false;
      hydrateToken += 1;
    }

    if (isReady) return;

    // Leer doc para que el effect dependa del store post-loadDocument.
    void doc;

    const data = getSupplierData();
    if (hasSupplierData(data)) {
      applySupplierFields(data);
      isReady = true;
      return;
    }

    if (isFetching) return;

    const token = hydrateToken;
    isFetching = true;

    getSupplierGETAsync()
      .then((supplier) => {
        if (token !== hydrateToken) return;
        applySupplierFields({
          tradeName: supplier.tradeName ?? "",
          name: supplier.name ?? "",
          ruc: supplier.RUC ?? "",
          address: supplier.address ?? "",
          codeAddress:
            supplier.isAnnex === true
              ? supplier.anexData?.codigoSUNAT ?? "0000"
              : "0000",
        });
      })
      .catch((e) => console.error("Error al obtener supplier:", e))
      .finally(() => {
        if (token !== hydrateToken) return;
        isReady = true;
        isFetching = false;
      });
  });

  $effect(() => {
    const tr = tradeName.trim();
    const n = name.trim();
    const r = ruc.trim();
    const a = address.trim();
    const ca = codeAddress;
    const ready = isReady;

    if (!ready) return;

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
