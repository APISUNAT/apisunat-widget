<svelte:options
  customElement={{
    tag: 'sunat-invoice',
    shadow: 'none',
    props: {
      config: { type: 'Object' },
    },
  }}
/>
<script lang="ts">
  import './shared/styles/web-component.css'
  import InvoiceForm from '$lib/modules/invoice/page/invoice.page.svelte'
  import ReciptForm from '$lib/modules/recipt/page/recipt.page.svelte'
  import { loadDocument, setDocumentType, documentStore, getDocumentOutput } from '$lib/store/document.store'
  import { tick } from 'svelte'
  import type { InvoiceConfig } from '$lib/config/invoice.config'

  const FORMS: Record<string, any> = {
    '01': InvoiceForm,
    '03': ReciptForm,
  }

  let { config = {} as InvoiceConfig } = $props()

  const CurrentForm = $derived(FORMS[config?.type ?? ''] ?? InvoiceForm)
  const showHeader = $derived(config?.components?.header !== false)
  const showSupplier = $derived(config?.components?.supplier !== false)
  $effect(() => {
    if (!config) return
    tick().then(() => {
      if (config.json) loadDocument(config.json)
      if (config.type) setDocumentType(config.type)
    })
  })

  $effect(() => {
    if (!config?.onchange) return
    return documentStore.subscribe(() => {
      config.onchange!(getDocumentOutput())
    })
  })
</script>

<div>
  <CurrentForm {showHeader} {showSupplier} />
</div>

<style>
  :host { display: block; }
</style>