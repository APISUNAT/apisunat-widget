<script lang="ts">
  import { untrack } from 'svelte';
  import Input from "$lib/shared/ui/input.svelte";
  import { buildingIcon, documentIcon, locationIcon } from "$lib/constants/icons.constants";
  import { documentStore } from "$lib/store/document.store";
  import { getSupplierData, setSupplierActions, isValidRuc, isRucComplete } from "./supplier.component";
  import { getRUCGETAsync } from "$lib/api/documents.api";

  let name = $state("");
  let ruc = $state("");
  let address = $state("");
  let isReady = $state(false);
  let supplierError = $state("");
  let isLoadingSupplier = $state(false);

  const isRucValid = $derived.by(() => {
    if (ruc.length < 11) return true   // no mostrar error hasta que tenga 11 dígitos
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

  $effect(() => {
    const r = ruc;
    if (!isReady || !isRucComplete(r)) {
      supplierError = "";
      return;
    }

    isLoadingSupplier = true;
    supplierError = "";

    getRUCGETAsync(r)
      .then((json: any) => {
        if (!json?.success) {
          supplierError = "No se encontraron datos para este RUC.";
          return;
        }
        const d = json.data
        name = d.nombre ?? "";
        address = [d.domicilio?.direccion, d.domicilio?.distrito, d.domicilio?.provincia, d.domicilio?.departamento]
          .filter(Boolean)
          .join(', ');
      })
      .finally(() => (isLoadingSupplier = false));
  });

  function onRucInput(e: Event) {
    const val = (e.currentTarget as HTMLInputElement).value
    ruc = val.replace(/\D/g, '').slice(0, 11)  // solo números, máx 11
  }
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