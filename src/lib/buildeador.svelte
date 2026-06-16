<svelte:options
  customElement={{
    tag: "sunat-invoice",
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
  };

  let { config = {} as InvoiceConfig } = $props();

  $effect(() => {
    if (!config?.personaId || !config?.personaToken) return;

    runtimeConfigStore.set({
      personaId: config.personaId,
      personaToken: config.personaToken,
      type: config.type,
      serie: config.serie ?? "",
    });
  });

  const CurrentForm = $derived(FORMS[config?.type ?? ""] ?? InvoiceForm);
  const showHeader = $derived(config?.components?.header !== false);
  const showRetention = $derived(config?.components?.retention !== false);
  const showSupplier = $derived(config?.components?.supplier !== false);
  const showCustomer = $derived(config?.components?.customer !== false);
  const showLines = $derived(config?.components?.lines !== false);
  const showPaymentTerms = $derived(config?.components?.paymentTerms !== false);

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
      {showSupplier}
      {showCustomer}
      {showLines}
      {showPaymentTerms}
      {showRetention}
      onEmitClick={config?.onEmit ? emitDocument : undefined}
    />
  {/key}
</div>

<style>
  :host {
    display: block;
  }
</style>