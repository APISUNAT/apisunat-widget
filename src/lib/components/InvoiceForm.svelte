<script lang="ts">
  import DocumentSection from "./invoice-form/DocumentSection.svelte";
  import ItemEditorModal from "./invoice-form/ItemEditorModal.svelte";
  import ItemListSection from "./invoice-form/ItemListSection.svelte";
  import PartySection from "./invoice-form/PartySection.svelte";
  import SummarySection from "./invoice-form/SummarySection.svelte";
  import {
    calculateInvoiceTotals,
    createItemEditor,
    defaultCustomer,
    defaultDocumentMeta,
    defaultInvoiceNote,
    defaultSupplier,
    initialItems,
    validateItemEditor,
  } from "./invoice-form/logic";
  import type { InvoiceItem, InvoiceItemEditor } from "./invoice-form/types";

  let { title = "Factura SUNAT" } = $props();
  let isItemModalOpen = $state(false);
  let itemModalMode = $state<"create" | "edit">("create");
  let editingItemId = $state<string | null>(null);
  let nextItemId = 3;
  let items = $state<InvoiceItem[]>(initialItems);
  let itemEditor = $state<InvoiceItemEditor>(createItemEditor());
  let invoiceTotals = $derived.by(() => calculateInvoiceTotals(items));
  let isItemEditorValid = $derived.by(() => validateItemEditor(itemEditor));

  function openCreateItemModal() {
    itemModalMode = "create";
    editingItemId = null;
    itemEditor = createItemEditor();
    isItemModalOpen = true;
  }

  function openEditItemModal(item: InvoiceItem) {
    itemModalMode = "edit";
    editingItemId = item.id;
    itemEditor = createItemEditor(item);
    isItemModalOpen = true;
  }

  function closeItemModal() {
    itemModalMode = "create";
    editingItemId = null;
    itemEditor = createItemEditor();
    isItemModalOpen = false;
  }

  function saveItem() {
    if (!isItemEditorValid) {
      return;
    }

    const nextItem: InvoiceItem = {
      ...itemEditor,
      id: editingItemId ?? `item-${nextItemId++}`,
    };

    if (editingItemId) {
      items = items.map((item) =>
        item.id === editingItemId ? nextItem : item,
      );
    } else {
      items = [...items, nextItem];
    }

    closeItemModal();
  }

  function removeItem(itemId: string) {
    items = items.filter((item) => item.id !== itemId);

    if (editingItemId === itemId) {
      closeItemModal();
    }
  }
</script>

<section
  class="relative isolate min-h-full bg-[var(--form-color-1)] p-3 text-white md:p-4"
>
  <section class="grid gap-3">
    <div
      class="rounded-[22px] border border-[color:color-mix(in_oklab,var(--form-color-3)_26%,transparent)] bg-[var(--form-color-2)]"
    >
      <div class="grid gap-4 px-4 py-4">
        <div
          class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] pb-4"
        >
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-color-3)]"
          >
            Comprobante
          </p>
          <h4 class="mt-1 font-display text-2xl text-white">{title}</h4>
          <p class="mt-1 text-sm text-white/66">Vista estática del invoice</p>
        </div>

        <DocumentSection documentMeta={defaultDocumentMeta} />
        <PartySection party={defaultSupplier} title="Emisor" />
        <PartySection
          party={defaultCustomer}
          showExtended={true}
          title="Cliente"
        />

        <section
          class="grid gap-3 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] pt-5 xl:grid-cols-12"
        >
          <ItemListSection
            {items}
            on:create={openCreateItemModal}
            on:edit={(event) => openEditItemModal(event.detail)}
            on:remove={(event) => removeItem(event.detail)}
          />
          <SummarySection note={defaultInvoiceNote} totals={invoiceTotals} />
        </section>
        <ItemEditorModal
          isOpen={isItemModalOpen}
          isValid={isItemEditorValid}
          {itemEditor}
          mode={itemModalMode}
          on:close={closeItemModal}
          on:save={saveItem}
        />
      </div>
      <div
        class="flex justify-end border-t border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] px-4 py-3"
      >
        <button
          class="inline-flex rounded-full border border-[var(--form-color-3)] bg-[var(--form-color-3)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          type="button">Emitir factura</button
        >
      </div>
    </div>
  </section>
</section>
