<script lang="ts">
  import { CATALOGO02 } from "$lib/constants/catalagos";
  import DatePicker from "$lib/shared/ui/date-picker.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentStore, documentLoaded } from "$lib/store/document.store";
  import { buildHeaderOptionsAction, resolveHeaderOptions } from "./header-options.component";

  let date     = $state("");
  let currency = $state("");
  let time     = $state<string | undefined>(undefined);
  let initialized = $state(false);

  $effect(() => {
    const doc = $documentStore;
    if (Object.keys(doc).length === 0) return;

    const { values, needsSync } = resolveHeaderOptions(doc);
    date     = values.date;
    time     = values.time;
    currency = values.currency;

    if (needsSync) {
      documentStore.update((body) => ({
        ...body,
        ...buildHeaderOptionsAction(values),
      }));
    }

    initialized = true;
  });

  $effect(() => {
    if (!initialized || !date || !currency) return;
    documentStore.update((body) => ({
      ...body,
      ...buildHeaderOptionsAction({ date, currency, time }),
    }));
  });
</script>

<section class="space-y-3">
  <div class="grid gap-3 sm:grid-cols-2">
    <DatePicker label="Fecha de emisión" showLabel={false} bind:value={date} required />
    <Select placeholder="Moneda" showLabel={false} bind:value={currency} options={CATALOGO02} required />
  </div>
</section>