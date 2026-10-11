<script lang="ts">
  import HeaderDocument from "$lib/shared/components/header/header-document.component.svelte";
  import HeaderOptions from "$lib/shared/components/header/header-options.component.svelte";
  import Supplier from "$lib/shared/components/supplier/supplier.component.svelte";
  import Customer from "$lib/shared/components/customer/customer.component.svelte";
  import DeliveryOptions from "$lib/modules/senders-waybill/components/delivery-options/delivery-options.component.svelte";
  import Addresses from "$lib/modules/senders-waybill/components/addresses/addresses.component.svelte";
  import WaybillItems from "$lib/modules/senders-waybill/components/waybill-items/waybill-items.component.svelte";
  import GrossWeight from "$lib/modules/senders-waybill/components/gross-weight/gross-weight.component.svelte";
  import NotesPanel from "$lib/shared/components/notes/notes-panel.component.svelte";
  import RelatedDocumentsPanel from "$lib/shared/components/related-documents/related-documents-panel.component.svelte";
  import EmitButton from "$lib/shared/components/emit/emit-button.component.svelte";

  let {
    showHeader = true,
    showSupplier = true,
    showDeliveryCustomer = true,
    showDeliveryOptions = true,
    showAddresses = true,
    showWaybillItems = true,
    showGrossWeight = true,
    showNotes = true,
    showRelatedDocuments = true,
    componentOrder = null as string[] | null,
    onEmitClick = undefined as (() => Promise<any>) | undefined,
  } = $props();

  const sectionLabel =
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]";

  // Helper para obtener el orden CSS de cada componente
  function getOrder(componentName: string): number {
    if (!componentOrder) return 999; // Sin orden especificado, va al final
    const index = componentOrder.indexOf(componentName);
    return index >= 0 ? index : 999; // Si está en el array, usa su índice, sino va al final
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
      </section>

      <!-- Supplier oculto por defecto pero presente en el DOM para mantener datos -->
      <section class="space-y-3 pt-1" class:hidden={!showSupplier} style="order: {getOrder('supplier')}">
        <p class={sectionLabel}>Emisor</p>
        <Supplier hidden={!showSupplier} />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showDeliveryCustomer} style="order: {getOrder('deliveryCustomer')}">
        <Customer hidden={!showDeliveryCustomer} />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showDeliveryOptions} style="order: {getOrder('deliveryOptions')}">
        <DeliveryOptions hidden={!showDeliveryOptions} />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showAddresses} style="order: {getOrder('addresses')}">
        <p class={sectionLabel}>Punto de Partida y Llegada</p>
        <Addresses />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showWaybillItems} style="order: {getOrder('waybillItems')}">
        <p class={sectionLabel}>Bienes a Transportar</p>
        <WaybillItems />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showGrossWeight} style="order: {getOrder('grossWeight')}">
        <p class={sectionLabel}>Peso Bruto Total</p>
        <GrossWeight />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showNotes} style="order: {getOrder('notes')}">
        <p class={sectionLabel}>Notas / Observaciones</p>
        <NotesPanel />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showRelatedDocuments} style="order: {getOrder('relatedDocuments')}">
        <p class={sectionLabel}>Documentos Relacionados</p>
        <RelatedDocumentsPanel />
      </section>

      {#if onEmitClick}
        <section class="pt-1 pb-2 flex justify-end" style="order: 9999">
          <EmitButton {onEmitClick} />
        </section>
      {/if}
    </div>
  </div>
</section>
