<script lang="ts">
  import { CATALOGO02 } from "$lib/constants/catalagos";
  import DatePicker from "$lib/shared/ui/date-picker.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentStore } from "$lib/store/document.store";
  import {
    buildHeaderOptionsAction,
    getPeruTime,
  } from "./header-options.component";

  let date = $state("");
  let currency = $state("");
  let isReady = false;

  $effect(() => {
    const doc = $documentStore;
    if (!doc["cbc:ID"]) return;
    if (isReady) return;

    date = doc["cbc:IssueDate"]?._text ?? "";
    currency = doc["cbc:DocumentCurrencyCode"]?._text ?? "";
    isReady = true;
  });

  $effect(() => {
    const d = date;
    const c = currency;
    if (!isReady) return;
    documentStore.update((body) => ({
      ...body,
      ...buildHeaderOptionsAction({
        date: d,
        currency: c,
        time: getPeruTime(),
      }),
    }));
  });
</script>

<section class="space-y-3">
  <div class="grid gap-3 sm:grid-cols-2">
    <DatePicker
      label="Fecha de emisión"
      showLabel={false}
      bind:value={date}
      required
    />
    <Select
      placeholder="Moneda"
      showLabel={false}
      bind:value={currency}
      options={CATALOGO02}
      required
    />
  </div>
</section>
