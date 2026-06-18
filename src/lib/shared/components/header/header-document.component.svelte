<script lang="ts">
  import { untrack } from "svelte";
  import { CATALOGO51 } from "$lib/constants/catalagos";
  import { documentIcon } from "$lib/constants/icons.constants";
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import {
    documentStore,
    documentTypeStore,
    documentLoaded,
  } from "$lib/store/document.store";
  import {
    buildHeaderDocumentAction,
    buildDiscrepancyAction,
    filterOperationsByDocumentType,
    filterReasonsByDocumentType,
    isNoteDocument,
    loadLastDocumentAction,
    DEFAULT_NOTE_REASON,
  } from "./header-document.component";

  let series = $state("");
  let correlative = $state("00000000");
  let documentType = $state("");
  let operationType = $state("");
  let noteReason = $state("");
  let noteDescription = $state("");
  let locked = $state(false);
  let isReady = $state(false);
  let lastType = $state("");
  let lastLoadedTimestamp = 0;

  let loadToken = 0;
  const defaultOperationType = "0101";

  const isNote = $derived(isNoteDocument(documentType));
  const filteredOperations = $derived(filterOperationsByDocumentType(documentType, CATALOGO51));
  const filteredReasons = $derived(filterReasonsByDocumentType(documentType));

  $effect(() => {
    const doc = $documentStore;
    const type = $documentTypeStore;
    const loaded = $documentLoaded;

    untrack(() => {
      if (!type) return;

      const isReset = loaded && loaded.timestamp !== lastLoadedTimestamp;

      if (type !== lastType || isReset) {
        lastType = type;
        if (loaded) lastLoadedTimestamp = loaded.timestamp;
        isReady = false;
        locked = false;
        operationType = "";
        noteReason = "";
        noteDescription = "";
        series = "";
        correlative = "00000000";
        loadToken++;
      }

      if (isReady) return;

      documentType = type;
      operationType = doc["cbc:InvoiceTypeCode"]?._attributes?.listID ?? defaultOperationType;

      if (isNoteDocument(type)) {
        noteReason = doc["cac:DiscrepancyResponse"]?.["cbc:ResponseCode"]?._text ?? DEFAULT_NOTE_REASON[type] ?? ''
        noteDescription = doc["cac:DiscrepancyResponse"]?.["cbc:Description"]?._text ?? ''
      }

      isReady = true;

      const existingId = doc["cbc:ID"]?._text ?? "";
      const parts = existingId.split("-");

      if (parts.length === 2 && parts[0].length === 4 && parts[1].length === 8) {
        series = parts[0];
        correlative = parts[1];
        locked = true;
        return;
      }

      const currentToken = loadToken;

      loadLastDocumentAction().then((result) => {
        if (loadToken !== currentToken) return;
        if (!result) return;
        series = result.series;
        correlative = result.correlative;
        locked = true;
      });
    });
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

    untrack(() => {
      documentStore.update((body) => ({
        ...body,
        ...buildHeaderDocumentAction({
          series: s,
          correlative: c,
          documentType: d,
          operationType: o,
        }),
      }));
    });
  });

  $effect(() => {
    const r = noteReason;
    const desc = noteDescription;
    if (!isReady || !isNote) return;

    untrack(() => {
      documentStore.update((body) =>
        buildDiscrepancyAction({ responseCode: r, description: desc }, body)
      );
    });
  });
</script>

<section class="space-y-3">
  <div class="grid gap-3" class:sm:grid-cols-3={!isNote} style={isNote ? 'grid-template-columns: 2fr 2fr 1fr 1fr' : ''}>
    <!-- Solo visible en notas -->
    <div class:hidden={!isNote}>
      <Select
        placeholder="Motivo"
        showLabel={false}
        bind:value={noteReason}
        options={filteredReasons}
      />
    </div>

    <div class:hidden={!isNote}>
      <Input
        placeholder="Descripción"
        showLabel={false}
        bind:value={noteDescription}
        icon={documentIcon}
      />
    </div>

    <!-- Solo visible en NO notas -->
    <div class:hidden={isNote}>
      <Select
        placeholder="Tipo de operación"
        showLabel={false}
        bind:value={operationType}
        options={filteredOperations}
      />
    </div>

    <!-- Siempre visibles -->
    <Input
      placeholder="Serie"
      showLabel={false}
      bind:value={series}
      icon={documentIcon}
      maxLength={4}
      disabled={locked}
    />

    <div
      onfocusout={() => {
        if (correlative && !locked) correlative = correlative.padStart(8, "0");
      }}
    >
      <Input
        placeholder="Correlativo"
        onlyNumbers={true}
        showLabel={false}
        bind:value={correlative}
        icon={documentIcon}
        maxLength={8}
        disabled={locked}
      />
    </div>
  </div>
</section>