<svelte:options
  customElement={{
    tag: "apisunat-widget",
    shadow: "none",
    props: {
      config: { type: "Object" },
    },
  }}
/>

<script lang="ts">
  import "./shared/styles/web-component.css";
  import InvoiceForm from "$lib/modules/invoice/page/invoice.page.svelte";
  import ReceiptForm from "$lib/modules/receipt/page/receipt.page.svelte";
  import NoteForm from "$lib/modules/notes/page/notes.page.svelte";
  import SendersWaybillForm from "$lib/modules/senders-waybill/page/senders-waybill.page.svelte";
  import {
    loadDocument,
    initDocument,
    documentStore,
    getDocumentOutput,
    documentResetKey
  } from "$lib/store/document.store";
  import { get } from 'svelte/store'
  import { sendBillPOSTASYNC } from "$lib/api/emit.api"
  import { tick } from "svelte";
  import type { InvoiceConfig } from "$lib/config/invoice.config";
  import { runtimeConfigStore } from "$lib/store/config.store";

  const FORMS: Record<string, any> = {
    "01": InvoiceForm,
    "03": ReceiptForm,
    "07": NoteForm,
    "08": NoteForm,
    "09": SendersWaybillForm,
    "31": SendersWaybillForm,
  };

  let { config = {} as InvoiceConfig } = $props();

  $effect(() => {
    runtimeConfigStore.set({
      personaId: config.personaId,
      personaToken: config.personaToken,
      type: config.type,
      serie: config.serie ?? "",
    });
  });

  const CurrentForm = $derived(FORMS[config?.type ?? ""] ?? InvoiceForm);

  // Props simples que se pasan a las páginas (config.config.display sobreescribe defaults)
  const showHeader = $derived(config?.config?.display?.header ?? true);
  const showHeaderOptions = $derived(config?.config?.display?.headerOptions ?? true);
  const showSupplier = $derived(config?.config?.display?.supplier ?? true);
  const showCustomer = $derived(config?.config?.display?.customer ?? true);
  const showLines = $derived(config?.config?.display?.lines ?? true);
  const showPaymentTerms = $derived(config?.config?.display?.paymentTerms ?? true);
  const showDetraccion = $derived(config?.config?.display?.detraccion ?? true);
  const showRetention = $derived(config?.config?.display?.retention ?? true);
  const showNotes = $derived(config?.config?.display?.notes ?? true);
  const showSummary = $derived(config?.config?.display?.summary ?? true);
  const showBillingReference = $derived(config?.config?.display?.billingReference ?? true);
  const showDeliveryCustomer = $derived(config?.config?.display?.deliveryCustomer ?? true);
  const showDeliveryOptions = $derived(config?.config?.display?.deliveryOptions ?? true);
  const showAddresses = $derived(config?.config?.display?.addresses ?? true);
  const showWaybillItems = $derived(config?.config?.display?.waybillItems ?? true);
  const showGrossWeight = $derived(config?.config?.display?.grossWeight ?? true);
  const showRelatedDocuments = $derived(config?.config?.display?.relatedDocuments ?? true);

  // Orden de componentes (si se especifica)
  const componentOrder = $derived(config?.config?.order ?? null);

  $effect(() => {
    if (!config?.type) return;

    const controller = new AbortController();
    const { signal } = controller;

    tick().then(async () => {
      if (signal.aborted) return;

      if (config.json) {
        loadDocument(config.json as Record<string, any>, config.type);
      } else {
        initDocument(config.type);
      }
    });

    return () => controller.abort();
  });

  $effect(() => {
    if (!config?.onchange) return;
    return documentStore.subscribe(() => {
      config.onchange!(getDocumentOutput());
    });
  });

  export async function emitDocument() {
    const { personaId, personaToken } = get(runtimeConfigStore);

    if (!personaId || !personaToken) {
      const error = new Error("personaId y personaToken son requeridos para emitir el documento");
      config?.onError?.(error);
      throw error;
    }

    try {
      const result = await sendBillPOSTASYNC();
      config?.onEmit?.(result);
      return result;
    } catch (error) {
      config?.onError?.(error);
      throw error;
    }
  }
</script>

<div>
  {#key `${config?.type ?? ""}-${config?.serie ?? ""}-${$documentResetKey}`}
    <CurrentForm
      {showHeader}
      {showHeaderOptions}
      {showSupplier}
      {showCustomer}
      {showLines}
      {showPaymentTerms}
      {showDetraccion}
      {showRetention}
      {showNotes}
      {showSummary}
      {showBillingReference}
      {showDeliveryCustomer}
      {showDeliveryOptions}
      {showAddresses}
      {showWaybillItems}
      {showGrossWeight}
      {showRelatedDocuments}
      {componentOrder}
      onEmitClick={config?.onEmit ? emitDocument : undefined}
    />
  {/key}
</div>

<style>
  :host {
    display: block;
  }
</style>