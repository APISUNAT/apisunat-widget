<script lang="ts">
  import {
    addInvoiceLineActions,
    removeInvoiceLineActions,
  } from "./lines.component";
  import { documentStore, documentLoadSeq } from "$lib/store/document.store";
  import ItemEditor from "./item-editor.component.svelte";
  import { CATALOGO02 } from "$lib/constants/catalagos";
import { buildTotalsUBL } from "$lib/shared/components/summary/summary-panel.component";
  type EditableItem = {
    description: string;
    quantity: string;
    unitCode: string;
    valorUnitario: string;
    precioUnitario: string;
    igvRate: number;
    itemCode?: string;
  };

  type LineItem = EditableItem & { id: number };

  let items = $state<LineItem[]>([]);
  let isOpen = $state(false);
  let mode = $state<"create" | "edit">("create");
  let itemEditor = $state<LineItem | null>(null);
  let nextId = $state(1);
  let hydratedSeq = -1;
  let lastCurrency = '';

  const symbol = $derived(
    CATALOGO02.find(c => c.value === ($documentStore['cbc:DocumentCurrencyCode']?._text ?? 'PEN'))?.symbol ?? 'S/'
  );

  // Re-hidrata cuando loadDocument/initDocument reemplaza el store (p. ej. cambio factura → boleta).
  $effect(() => {
    const seq = $documentLoadSeq;
    const doc = $documentStore;
    if (seq === hydratedSeq) return;

    const lines = doc["cac:InvoiceLine"];
    if (lines === undefined) return;

    const arr = Array.isArray(lines) ? lines : [lines];

    items = arr.map((line: any, i: number) => {
      const igvPercent =
        line["cac:TaxTotal"]?.["cac:TaxSubtotal"]?.[0]?.["cac:TaxCategory"]?.[
          "cbc:Percent"
        ]?._text;

      const igvRate = igvPercent ? parseFloat(String(igvPercent)) : 18;

      const valorUnitario = String(
        line["cac:Price"]?.["cbc:PriceAmount"]?._text ?? "",
      );

      const precioRaw =
        line["cac:PricingReference"]?.["cac:AlternativeConditionPrice"]?.[
          "cbc:PriceAmount"
        ]?._text;

      const precioUnitario = precioRaw
        ? String(precioRaw)
        : valorUnitario
          ? (parseFloat(valorUnitario) * (1 + igvRate / 100)).toFixed(2)
          : "";

      const itemCode =
        line["cac:Item"]?.["cac:SellersItemIdentification"]?.["cbc:ID"]?._text;

      return {
        id: i + 1,
        description: line["cac:Item"]?.["cbc:Description"]?._text ?? "",
        quantity: String(line["cbc:InvoicedQuantity"]?._text ?? "1"),
        unitCode: line["cbc:InvoicedQuantity"]?._attributes?.unitCode ?? "NIU",
        valorUnitario,
        precioUnitario,
        igvRate,
        itemCode,
      };
    });

    nextId = items.length + 1;
    lastCurrency = doc['cbc:DocumentCurrencyCode']?._text ?? '';

    if (items.length > 0) {
      items.forEach((item) => {
        addInvoiceLineActions({
          id:             item.id,
          quantity:       parseFloat(item.quantity) || 0,
          unitCode:       item.unitCode,
          description:    item.description,
          valorUnitario:  parseFloat(item.valorUnitario) || 0,
          precioUnitario: parseFloat(item.precioUnitario) || 0,
          igvRate:        item.igvRate,
          itemCode:       item.itemCode,
        });
      });
    } else {
      const currency = doc['cbc:DocumentCurrencyCode']?._text ?? 'PEN';
      const { total, ...ubl } = buildTotalsUBL([], currency);
      documentStore.update(body => ({ ...body, ...ubl }));
    }

    hydratedSeq = seq;
  });

  // Re-sincroniza currencyID cuando cambia la moneda tras la hidratación.
  $effect(() => {
    const currency = $documentStore['cbc:DocumentCurrencyCode']?._text;
    const seq = $documentLoadSeq;
    if (!currency || hydratedSeq !== seq || currency === lastCurrency) return;

    lastCurrency = currency;

    items.forEach((item) => {
      addInvoiceLineActions({
        id:             item.id,
        quantity:       parseFloat(item.quantity) || 0,
        unitCode:       item.unitCode,
        description:    item.description,
        valorUnitario:  parseFloat(item.valorUnitario) || 0,
        precioUnitario: parseFloat(item.precioUnitario) || 0,
        igvRate:        item.igvRate,
        itemCode:       item.itemCode,
      });
    });
  });

  function lineTotal(item: LineItem): string {
    const qty = parseFloat(item.quantity) || 0;
    const precio = parseFloat(item.precioUnitario) || 0;
    return (qty * precio).toFixed(2);
  }

  const grandTotal = $derived(
    items
      .reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const precio = parseFloat(item.precioUnitario) || 0;
        return sum + qty * precio;
      }, 0)
      .toFixed(2),
  );

  function openCreate() {
    mode = "create";
    itemEditor = null;
    isOpen = true;
  }

  function openEdit(item: LineItem) {
    mode = "edit";
    itemEditor = { ...item };
    isOpen = true;
  }

  function handleClose() {
    isOpen = false;
    itemEditor = null;
  }

  function handleSave(event: CustomEvent<EditableItem>) {
    const data = event.detail;
    const id = mode === "edit" && itemEditor ? itemEditor.id : nextId++;

    const qty = parseFloat(data.quantity) || 0;
    const valorUnitario = parseFloat(data.valorUnitario) || 0;
    const precioUnitario = parseFloat(data.precioUnitario) || 0;

    if (mode === "create") {
      items = [...items, { ...data, id }];
    } else {
      items = items.map((i) => (i.id === id ? { ...data, id } : i));
    }

    addInvoiceLineActions({
      id,
      quantity: qty,
      unitCode: data.unitCode,
      description: data.description,
      valorUnitario,
      precioUnitario,
      igvRate: data.igvRate,
      itemCode: data.itemCode ?? itemEditor?.itemCode,
    });

    handleClose();
  }

  function handleRemove(id: number) {
    items = items.filter((i) => i.id !== id);
    removeInvoiceLineActions(id);
  }
</script>

<div
  class="overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]"
>
  <!-- Header -->
  <div
    class="flex items-center justify-between gap-3 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3"
  >
    <p
      class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
    >
      Detalle
    </p>
    <button
      class="inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent px-3 py-1.5 text-[13px] font-medium text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
      onclick={openCreate}
      type="button"
    >
      <svg
        class="size-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.5"
        viewBox="0 0 24 24"
      >
        <path d="M12 5v14" /><path d="M5 12h14" />
      </svg>
      Añadir ítem
    </button>
  </div>

  {#if items.length}
    <!-- Column headers -->
    <div
      class="grid grid-cols-[1fr_80px_110px_110px_72px] gap-2 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_12%,transparent)] px-5 py-2"
    >
      <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--form-text-soft)]">Descripción</span>
      <span class="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--form-text-soft)]">Cant.</span>
      <span class="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--form-text-soft)]">V. unitario</span>
      <span class="text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--form-text-soft)]">Total</span>
      <span></span>
    </div>

    <ul class="divide-y divide-[color:color-mix(in_oklab,var(--form-color-3)_12%,transparent)]">
      {#each items as item, i (item.id)}
        <li class="grid grid-cols-[1fr_80px_110px_110px_72px] items-center gap-2 px-5 py-3 transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_5%,transparent)]">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--form-color-3)_14%,transparent)] text-[10px] font-semibold tabular-nums text-[var(--form-text-soft)]">{i + 1}</span>
              <span class="truncate text-[13px] font-medium text-[var(--form-text-color)]">{item.description}</span>
            </div>
            <div class="mt-0.5 ps-7 text-[11px] text-[var(--form-text-soft)]">
              {item.unitCode || "NIU"}
            </div>
          </div>
          <div class="text-right text-[13px] tabular-nums text-[var(--form-text-color)]">{item.quantity}</div>
          <div class="text-right text-[13px] tabular-nums text-[var(--form-text-soft)]">{symbol} {parseFloat(item.valorUnitario).toFixed(2)}</div>
          <div class="text-right text-[13px] font-semibold tabular-nums text-[var(--form-text-color)]">{symbol} {lineTotal(item)}</div>
          <div class="flex items-center justify-end gap-1">
            <button
              aria-label="Editar ítem"
              class="inline-flex size-7 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-transparent text-[var(--form-text-soft)] transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_40%,transparent)] hover:text-[var(--form-text-color)]"
              onclick={() => openEdit(item)}
              type="button"
            >
              <svg class="size-3.5 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              aria-label={`Eliminar ${item.description || "ítem"}`}
              class="inline-flex size-7 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-transparent text-[var(--form-text-soft)] transition hover:border-red-400/40 hover:text-red-500"
              onclick={() => handleRemove(item.id)}
              type="button"
            >
              <svg class="size-3.5 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
              </svg>
            </button>
          </div>
        </li>
      {/each}
    </ul>

    <!-- Footer totals -->
    <div class="flex items-center justify-between gap-4 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] bg-[color:color-mix(in_oklab,var(--form-color-3)_6%,transparent)] px-5 py-3">
      <span class="text-[12px] text-[var(--form-text-soft)]">{items.length} {items.length === 1 ? "ítem" : "ítems"}</span>
      <div class="flex items-center gap-2">
        <span class="text-[12px] text-[var(--form-text-soft)]">Total</span>
        <span class="text-[15px] font-semibold tabular-nums text-[var(--form-text-color)]">{symbol} {grandTotal}</span>
      </div>
    </div>
  {:else}
    <div class="flex flex-col items-center gap-3 px-5 py-10 text-center">
      <div class="flex size-10 items-center justify-center rounded-full border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] text-[var(--form-text-soft)]">
        <svg class="size-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect width="6" height="4" x="9" y="3" rx="1" ry="1" /><path d="M9 12h6" /><path d="M9 16h4" />
        </svg>
      </div>
      <div>
        <p class="text-[13px] font-medium text-[var(--form-text-color)]">Sin ítems aún</p>
        <p class="mt-0.5 text-[12px] text-[var(--form-text-soft)]">Usa "Añadir ítem" para registrar la primera línea.</p>
      </div>
    </div>
  {/if}
</div>

<ItemEditor
  {isOpen}
  {itemEditor}
  {mode}
  on:close={handleClose}
  on:save={handleSave}
/>