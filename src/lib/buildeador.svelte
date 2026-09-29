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
  import NoteForm from "$lib/modules/notes/page/notes.page.svelte";
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
  const showHeader = $derived(config?.components?.header !== false);
  const showRetention = $derived(config?.components?.retention !== false);
  const showSupplier = $derived(config?.components?.supplier !== false);

  // Customer puede ser boolean o configurarse con notación de punto (customer.ruc, customer.name, etc.)
  const customerConfig = $derived(config?.components?.customer);
  const components = $derived(config?.components);

  const showCustomer = $derived.by(() => {
    // Si customer es un objeto, mostrar si al menos un campo está en true
    if (typeof customerConfig === 'object' && customerConfig !== null) {
      return Object.values(customerConfig).some(v => v !== false);
    }
    // Si customer es boolean, usar ese valor
    if (typeof customerConfig === 'boolean') return customerConfig;

    // Si hay algún campo customer.* en true, mostrar la sección
    if (components && typeof components === 'object') {
      const customerFields = ['customer.ruc', 'customer.name', 'customer.address', 'customer.email', 'customer.phone'];
      const hasAnyCustomerField = customerFields.some(field => (components as any)[field] === true);
      if (hasAnyCustomerField) return true;
    }

    return true; // Por defecto mostrar
  });

  const showCustomerRuc = $derived.by(() => {
    // Primero verificar si existe customer.ruc en components
    if (components && typeof components === 'object' && 'customer.ruc' in components) {
      return (components as any)['customer.ruc'] !== false;
    }
    // Si customer es un objeto, verificar la propiedad ruc
    if (typeof customerConfig === 'object' && customerConfig !== null && 'ruc' in customerConfig) {
      return customerConfig.ruc !== false;
    }
    // Si customer es boolean, usar ese valor
    if (typeof customerConfig === 'boolean') {
      return customerConfig !== false;
    }
    return true;
  });

  const showCustomerName = $derived.by(() => {
    if (components && typeof components === 'object' && 'customer.name' in components) {
      return (components as any)['customer.name'] !== false;
    }
    if (typeof customerConfig === 'object' && customerConfig !== null && 'name' in customerConfig) {
      return customerConfig.name !== false;
    }
    if (typeof customerConfig === 'boolean') {
      return customerConfig !== false;
    }
    return true;
  });

  const showCustomerAddress = $derived.by(() => {
    if (components && typeof components === 'object' && 'customer.address' in components) {
      return (components as any)['customer.address'] !== false;
    }
    if (typeof customerConfig === 'object' && customerConfig !== null && 'address' in customerConfig) {
      return customerConfig.address !== false;
    }
    if (typeof customerConfig === 'boolean') {
      return customerConfig !== false;
    }
    return true;
  });

  const showCustomerEmail = $derived.by(() => {
    if (components && typeof components === 'object' && 'customer.email' in components) {
      return (components as any)['customer.email'] !== false;
    }
    if (typeof customerConfig === 'object' && customerConfig !== null && 'email' in customerConfig) {
      return customerConfig.email !== false;
    }
    if (typeof customerConfig === 'boolean') {
      return customerConfig !== false;
    }
    return true;
  });

  const showCustomerPhone = $derived.by(() => {
    if (components && typeof components === 'object' && 'customer.phone' in components) {
      return (components as any)['customer.phone'] !== false;
    }
    if (typeof customerConfig === 'object' && customerConfig !== null && 'phone' in customerConfig) {
      return customerConfig.phone !== false;
    }
    if (typeof customerConfig === 'boolean') {
      return customerConfig !== false;
    }
    return true;
  });

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
      {showCustomerRuc}
      {showCustomerName}
      {showCustomerAddress}
      {showCustomerEmail}
      {showCustomerPhone}
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