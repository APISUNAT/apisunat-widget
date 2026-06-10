<script lang="ts">
  import { CATALOGO01, CATALOGO51 } from "$lib/constants/catalagos";
  import { documentIcon } from "$lib/constants/icons.constants";
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { setHeaderDocument } from "$lib/store/actions/header.actions";
  import { documentStore } from "$lib/store/document.store";
  import { filterOperationsByDocumentType } from "./header-document.component";

  let series        = $state("");
  let correlative   = $state("");
  let documentType  = $state("");
  let operationType = $state("");

  let isReady     = false;
  let isFirstLoad = true;

  const filteredOperations = $derived(
    filterOperationsByDocumentType(documentType, CATALOGO51)
  )

 $effect(() => {
  const doc = $documentStore;
  if (isReady) return;

  series      = doc["cbc:ID"]?._text?.split("-")[0] ?? "";
  correlative = (doc["cbc:ID"]?._text?.split("-")[1] ?? "").padStart(8, "0");
  documentType  = doc["cbc:InvoiceTypeCode"]?._text ?? "";
  operationType = doc["cbc:InvoiceTypeCode"]?._attributes?.listID ?? "";

  if (documentType) isReady = true;
});

  $effect(() => {
    if (!isReady) return;
    if (isFirstLoad) { isFirstLoad = false; return; }
    operationType = "";
  });

  $effect(() => {
    if (filteredOperations.length === 0) operationType = ""
  })

  $effect(() => {
    const s = series
    const c = correlative
    const d = documentType
    const o = operationType
    if (!isReady) return
    setHeaderDocument({ series: s, correlative: c, documentType: d, operationType: o })
  })
</script>

<section class="space-y-3">
  <div class="grid gap-3 sm:grid-cols-4">
    <Select
      placeholder="Tipo de comprobante"
      showLabel={false}
      bind:value={documentType}
      options={CATALOGO01}
      disabled
      required
    />
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
      required
    />
    <div onfocusout={() => { if (correlative) correlative = correlative.padStart(8, "0") }}>
      <Input
        placeholder="Correlativo"
        showLabel={false}
        bind:value={correlative}
        icon={documentIcon}
        required
      />
    </div>
  </div>
</section>