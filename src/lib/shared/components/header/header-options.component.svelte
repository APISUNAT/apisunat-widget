<script lang="ts">
  import { CATALOGO02 } from "$lib/constants/catalagos";
  import DatePicker from "$lib/shared/ui/date-picker.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentStore, documentLoaded, documentTypeStore } from "$lib/store/document.store";
  import { buildHeaderOptionsAction, resolveHeaderOptions } from "./header-options.component";

  let { hidden = false } = $props();

  let date     = $state("");
  let currency = $state("");
  let time     = $state<string | undefined>(undefined);
  let deliveryDate = $state("");
  let initialized = $state(false);

  const isGuia = $derived($documentTypeStore === "09" || $documentTypeStore === "31");

  $effect(() => {
    const doc = $documentStore;
    if (Object.keys(doc).length === 0) return;

    const { values, needsSync } = resolveHeaderOptions(doc);
    date     = values.date;
    time     = values.time;
    currency = values.currency;
    deliveryDate = values.deliveryDate;

    if (needsSync) {
      documentStore.update((body) => ({
        ...body,
        ...buildHeaderOptionsAction({ ...values, isGuia }),
      }));
    }

    initialized = true;
  });

  $effect(() => {
    if (!initialized || !date) return;
    if (!isGuia && !currency) return;
    if (isGuia && !deliveryDate) return;

    documentStore.update((body) => ({
      ...body,
      ...buildHeaderOptionsAction({ date, currency, time, deliveryDate, isGuia }),
    }));
  });
</script>

<section class="space-y-3" class:hidden>
  <div class="grid gap-3 sm:grid-cols-2">
    <DatePicker label="Fecha de emisión" showLabel={false} bind:value={date} required />
    {#if isGuia}
      <DatePicker label="Fecha de entrega al transportista" showLabel={false} bind:value={deliveryDate} required />
    {:else}
      <Select placeholder="Moneda" showLabel={false} bind:value={currency} options={CATALOGO02} required />
    {/if}
  </div>
</section>