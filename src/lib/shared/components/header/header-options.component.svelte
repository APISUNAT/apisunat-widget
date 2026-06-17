<script lang="ts">
  import { CATALOGO02 } from "$lib/constants/catalagos";
  import DatePicker from "$lib/shared/ui/date-picker.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentStore } from "$lib/store/document.store";
  import {
    buildHeaderOptionsAction,
    getCurrentTime,
  } from "./header-options.component";

  let date = $state("");
  let currency = $state("");
  let time = $state("");
  let isReady = false;
  //Dia actual en formato ISO para usar como valor por defecto si el JSON no trae fecha
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Lima",
  });
  // valor por defecto para la moneda, en caso no venga en el JSON externo
  const defaultCurrency = "PEN";
  $effect(() => {
    const doc = $documentStore;
    if (!doc["cbc:ID"]) return;
    if (isReady) return;

    const jsonDate = doc["cbc:IssueDate"]?._text;
    const jsonTime = doc["cbc:IssueTime"]?._text;

    if (jsonDate) {
      // El JSON trae fecha: respetar fecha y hora tal cual vengan
      date = jsonDate;
      time = jsonTime ?? "";
    } else {
      // No vino fecha: generar fecha y hora actuales
      date = today;
      time = getCurrentTime();
    }

    currency = doc["cbc:DocumentCurrencyCode"]?._text ?? defaultCurrency;
    isReady = true;
  });

  $effect(() => {
    const d = date;
    const c = currency;
    const t = time;
    if (!isReady) return;
    documentStore.update((body) => ({
      ...body,
      ...buildHeaderOptionsAction({
        date: d,
        currency: c,
        time: t,
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
