<script lang="ts">
  import Input from "$lib/shared/ui/input.svelte";
  import { buildingIcon, documentIcon, locationIcon } from "$lib/constants/icons.constants";
  import { documentStore } from "$lib/store/document.store";
  import { getSupplierData } from "./supplier.component";

  let name = $state("");
  let ruc = $state("");
  let address = $state("");

  let isReady = false;

  $effect(() => {
    $documentStore;
    if (isReady) return;

    const data = getSupplierData();
    if (!data.name && !data.ruc && !data.address) return;

    name = data.name;
    ruc = data.ruc;
    address = data.address;
    isReady = true;
  });
</script>

<div class="grid gap-3 md:grid-cols-[2fr_280px_3fr]">
  <Input placeholder="Emisor" showLabel={false} value={name} icon={buildingIcon} disabled />
  <Input placeholder="RUC emisor" showLabel={false} value={ruc} icon={documentIcon} disabled />
  <Input placeholder="Dirección" showLabel={false} value={address} icon={locationIcon} disabled />
</div>