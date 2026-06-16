<script lang="ts">
  import { untrack } from 'svelte';
  import Input from "$lib/shared/ui/input.svelte";
  import { buildingIcon, documentIcon, locationIcon } from "$lib/constants/icons.constants";
  import { documentStore } from "$lib/store/document.store";
  import { getSupplierData, setSupplierActions, isValidRuc } from "./supplier.component";

  let name = $state("");
  let ruc = $state("");
  let address = $state("");
  let isReady = $state(false);

  const isRucValid = $derived.by(() => {
    if (ruc.length < 11) return true
    return isValidRuc(ruc)
  })

  $effect(() => {
    const doc = $documentStore;

    untrack(() => {
      if (isReady) return;
      if (!doc["cac:AccountingSupplierParty"]) return;

      const data = getSupplierData();
      if (!data.name && !data.ruc && !data.address) return;

      name = data.name;
      ruc = data.ruc;
      address = data.address;
      isReady = true;
    });
  });

  $effect(() => {
    const n = name.trim();
    const r = ruc.trim();
    const a = address.trim();
    const ready = isReady;

    if (!ready || !r) return;

    untrack(() => {
      setSupplierActions({
        supplier: n,
        numberDocument: r,
        address: a,
      });
    });
  });
</script>

<div class="grid gap-3 md:grid-cols-[2fr_280px_3fr]">
  <Input placeholder="Emisor" showLabel={false} bind:value={name} icon={buildingIcon} />
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
  <Input placeholder="Dirección" showLabel={false} bind:value={address} icon={locationIcon} />
</div>