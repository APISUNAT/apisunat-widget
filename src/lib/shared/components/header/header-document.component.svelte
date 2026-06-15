<script lang="ts">
  import { CATALOGO51 } from "$lib/constants/catalagos";
  import { documentIcon } from "$lib/constants/icons.constants";
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentStore, documentTypeStore } from "$lib/store/document.store";
  import { buildHeaderDocumentAction, filterOperationsByDocumentType, loadLastDocumentAction } from "./header-document.component";

  let series        = $state("");
  let correlative   = $state("00000000");
  let documentType  = $state("");
  let operationType = $state("");
  let locked        = $state(false);

  let isReady     = false;
  let isFirstLoad = true;

  const filteredOperations = $derived(
    filterOperationsByDocumentType(documentType, CATALOGO51)
  );

  $effect(() => {
    const doc  = $documentStore;
    const type = $documentTypeStore;

    if (isReady) return;
    if (!type) return;

    documentType  = type;
    operationType = doc["cbc:InvoiceTypeCode"]?._attributes?.listID ?? "";

    isReady = true;

    loadLastDocumentAction().then(result => {
      if (!result) return;
      series      = result.series;
      correlative = result.correlative;
      locked      = true;
    });
  });

  $effect(() => {
    if (!isReady) return;
    if (isFirstLoad) { isFirstLoad = false; return; }
    operationType = "";
  });

  $effect(() => {
    if (filteredOperations.length === 0) operationType = "";
  });

  $effect(() => {
    const s = series;
    const c = correlative;
    const d = documentType;
    const o = operationType;
    if (!isReady) return;
    documentStore.update(body => ({
      ...body,
      ...buildHeaderDocumentAction({ series: s, correlative: c, documentType: d, operationType: o })
    }));
  });
</script>

<section class="space-y-3">
  <div class="grid gap-3 sm:grid-cols-3">

    <Select
      placeholder="Tipo de operación"
      showLabel={false}
      bind:value={operationType}
      options={filteredOperations}
      required
    />

    <Input
      placeholder="Serie"
      showLabel={false}
      bind:value={series}
      icon={documentIcon}
      maxLength={4}
      disabled={locked}
      required
    />

    <div onfocusout={() => { if (correlative && !locked) correlative = correlative.padStart(8, "0") }}>
      <Input
        placeholder="Correlativo"
        onlyNumbers={true}
        showLabel={false}
        bind:value={correlative}
        icon={documentIcon}
        maxLength={8}
        disabled={locked}
        required
      />
    </div>

  </div>
</section>