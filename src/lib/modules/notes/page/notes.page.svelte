<script lang="ts">
  import HeaderDocument from "$lib/shared/components/header/header-document.component.svelte";
  import HeaderOptions from "$lib/shared/components/header/header-options.component.svelte";
  import Supplier from "$lib/shared/components/supplier/supplier.component.svelte";
  import Customer from "$lib/shared/components/customer/customer.component.svelte";
  import Lines from "$lib/shared/components/lines/lines.component.svelte";
  import PaymentTerms from "$lib/shared/components/payment-terms/payment-terms.component.svelte";
  import NotesPanel from "$lib/shared/components/notes/notes-panel.component.svelte";
  import Retention from "$lib/modules/invoice/components/retention.component.svelte";
  import EmitButton from "$lib/shared/components/emit/emit-button.component.svelte";
  import SummaryPanel from "$lib/shared/components/summary/summary-panel.component.svelte";
  import BillingReference from "$lib/modules/notes/components/billing-reference.component.svelte";
  import { documentStore } from "$lib/store/document.store";

  let {
    showHeader = true,
    showBillingReference = true,
    showSupplier = true,
    showCustomer = true,
    showLines = true,
    showNotes = true,
    showSummary = true,
    componentOrder = null as string[] | null,
    onEmitClick = undefined as (() => Promise<any>) | undefined,
  } = $props();

  const sectionLabel =
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]";

  // Helper para obtener el orden CSS de cada componente
  function getOrder(componentName: string): number {
    if (!componentOrder) return 999;
    const index = componentOrder.indexOf(componentName);
    return index >= 0 ? index : 999;
  }
</script>

<section
  class="relative isolate min-h-full p-3 [font-family:var(--form-font-family)] text-[var(--form-text-color)] md:p-4"
>
  <div class="bg-[var(--form-color-2)]">
    <div class="grid gap-4 px-4 py-4" style="display: flex; flex-direction: column;">
      <section class="space-y-3 pt-1" class:hidden={!showHeader} style="order: {getOrder('header')}">
        <p class={sectionLabel}>Documento</p>
        <HeaderDocument hidden={!showHeader} />
      </section>

      <section class="space-y-3 pt-1" style="order: {getOrder('headerOptions')}">
        <HeaderOptions />
        <BillingReference hidden={!showBillingReference} />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showSupplier} style="order: {getOrder('supplier')}">
        <p class={sectionLabel}>Emisor</p>
        <Supplier hidden={!showSupplier} />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showCustomer} style="order: {getOrder('customer')}">
        <Customer hidden={!showCustomer} />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showLines} style="order: {getOrder('lines')}">
        <p class={sectionLabel}>Ítems</p>
        <div class="grid gap-4 lg:grid-cols-[70%_1fr] lg:items-start">
          <Lines hidden={!showLines} />

          <div class="grid gap-4">
            <NotesPanel hidden={!showNotes} />

            <SummaryPanel hidden={!showSummary} />


          </div>
        </div>
      </section>

      {#if onEmitClick}
        <section class="pt-1 pb-2 flex justify-end" style="order: 9999">
          <EmitButton {onEmitClick} />
        </section>
      {/if}
    </div>
  </div>
</section>
