<script lang="ts">
  import HeaderDocument from "$lib/shared/components/header/header-document.component.svelte";
  import HeaderOptions from "$lib/shared/components/header/header-options.component.svelte";
  import Supplier from "$lib/shared/components/supplier/supplier.component.svelte";
  import Customer from "$lib/shared/components/customer/customer.component.svelte";
  import Lines from "$lib/shared/components/lines/lines.component.svelte";
  import DocumentReference from "$lib/shared/components/document-reference/document-reference.component.svelte";
  import NotesPanel from "$lib/shared/components/notes/notes-panel.component.svelte";
  import PaymentTerms from "$lib/shared/components/payment-terms/payment-terms.component.svelte";
  import EmitButton from "$lib/shared/components/emit/emit-button.component.svelte";
  import SummaryPanel from '$lib/shared/components/summary/summary-panel.component.svelte';
  import { documentStore } from "$lib/store/document.store";

  let {
    showHeader = true,
    showSupplier = true,
    showRetention = true,   // ← añadido
    onEmitClick = undefined as (() => Promise<any>) | undefined,
  } = $props();

  const sectionLabel =
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]";
  const panelClass =
    "overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]";
</script>

<section
  class="relative isolate min-h-full p-3 [font-family:var(--form-font-family)] text-[var(--form-text-color)] md:p-4"
>
  <div class="bg-[var(--form-color-2)]">
    <div class="grid gap-4 px-4 py-4">

      {#if showHeader}
        <section class="space-y-3 pt-1">
          <p class={sectionLabel}>Documento</p>
          <HeaderDocument />
        </section>
      {/if}

      <section class="space-y-3 pt-1">
        <p class={sectionLabel}></p>
        <HeaderOptions />
      </section>

      {#if showSupplier}
        <section class="space-y-3 pt-1">
          <p class={sectionLabel}>Emisor</p>
          <Supplier />
        </section>
      {/if}

      <section class="space-y-3 pt-1">
        <p class={sectionLabel}>Cliente</p>
        <Customer />
      </section>

      <section class="space-y-3 pt-1">
        <p class={sectionLabel}>Ítems</p>
        <div class="grid gap-4 lg:grid-cols-[70%_1fr] lg:items-start">
          <Lines />

          <div class="grid gap-4">
            <NotesPanel />

            <SummaryPanel />
            
            <PaymentTerms
              total={$documentStore['cac:LegalMonetaryTotal']?.['cbc:PayableAmount']?._text ?? 0}
            />
          </div>
        </div>
      </section>

      {#if onEmitClick}
        <section class="pt-1 pb-2 flex justify-end">
          <EmitButton {onEmitClick} />
        </section>
      {/if}

    </div>
  </div>
</section>