<script lang="ts">
  import {
    addWaybillItemActions,
    removeWaybillItemActions,
    hydrateWaybillItems,
    type WaybillItem,
    type EditableWaybillItem,
  } from "./waybill-items.component";
  import { documentStore, documentLoaded } from "$lib/store/document.store";
  import WaybillItemEditor from "./waybill-item-editor.component.svelte";

  let { hidden = false } = $props();

  let items = $state<WaybillItem[]>([]);
  let isOpen = $state(false);
  let mode = $state<"create" | "edit">("create");
  let itemEditor = $state<WaybillItem | null>(null);
  let nextId = $state(1);
  let lastLoaded: { type: string; timestamp: number } | null = null;

  function toItemPayload(id: number, data: EditableWaybillItem): WaybillItem {
    return {
      id,
      quantity: data.quantity,
      unitCode: data.unitCode,
      description: data.description,
      damSerie: data.damSerie,
      damNumero: data.damNumero,
      partidaArancelaria: data.partidaArancelaria,
      bienNormalizado: data.bienNormalizado,
    };
  }

  $effect(() => {
    const loaded = $documentLoaded;
    const doc = $documentStore;
    if (!loaded || loaded === lastLoaded) return;

    items = hydrateWaybillItems(doc);
    nextId = items.length + 1;

    if (items.length > 0) {
      items.forEach((item) => {
        addWaybillItemActions(item);
      });
    }

    lastLoaded = loaded;
  });

  function openCreate() {
    mode = "create";
    itemEditor = null;
    isOpen = true;
  }

  function openEdit(item: WaybillItem) {
    mode = "edit";
    itemEditor = { ...item };
    isOpen = true;
  }

  function handleClose() {
    isOpen = false;
    itemEditor = null;
  }

  function handleSave(event: CustomEvent<EditableWaybillItem>) {
    const data = event.detail;
    const id = mode === "edit" && itemEditor ? itemEditor.id : nextId++;

    const newItem: WaybillItem = toItemPayload(id, data);

    items =
      mode === "create"
        ? [...items, newItem]
        : items.map((i) => (i.id === id ? newItem : i));

    addWaybillItemActions(newItem);

    handleClose();
  }

  function handleRemove(id: number) {
    items = items.filter((i) => i.id !== id);
    removeWaybillItemActions(id);
  }
</script>

<div class="overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]" class:hidden>
  <!-- Header -->
  <div class="flex items-center justify-between gap-3 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3">
    <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]">
      Bienes a Transportar
    </p>
    <button
      class="inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent px-3 py-1.5 text-[13px] font-medium text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
      onclick={openCreate}
      type="button"
    >
      <svg class="size-3.5 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24">
        <path d="M12 5v14" /><path d="M5 12h14" />
      </svg>
      Añadir bien
    </button>
  </div>

  {#if items.length}
    <!-- Column headers -->
    <div class="grid grid-cols-[80px_120px_1fr_72px] gap-2 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_12%,transparent)] px-5 py-2">
      <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--form-text-soft)]">Cant.</span>
      <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--form-text-soft)]">Unidad</span>
      <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--form-text-soft)]">Descripción</span>
      <span></span>
    </div>

    <ul class="divide-y divide-[color:color-mix(in_oklab,var(--form-color-3)_12%,transparent)]">
      {#each items as item, i (item.id)}
        <li class="grid grid-cols-[80px_120px_1fr_72px] items-center gap-2 px-5 py-3 transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_5%,transparent)]">
          <div class="text-[13px] tabular-nums text-[var(--form-text-color)]">{item.quantity}</div>
          <div class="text-[13px] text-[var(--form-text-soft)]">{item.unitCode}</div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--form-color-3)_14%,transparent)] text-[10px] font-semibold tabular-nums text-[var(--form-text-soft)]">{i + 1}</span>
              <span class="truncate text-[13px] font-medium text-[var(--form-text-color)]">{item.description}</span>
            </div>
          </div>
          <div class="flex items-center justify-end gap-1">
            <button
              aria-label="Editar bien"
              class="inline-flex size-7 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-transparent text-[var(--form-text-soft)] transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_40%,transparent)] hover:text-[var(--form-text-color)]"
              onclick={() => openEdit(item)}
              type="button"
            >
              <svg class="size-3.5 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              aria-label={`Eliminar ${item.description || "bien"}`}
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
      <span class="text-[12px] text-[var(--form-text-soft)]">{items.length} {items.length === 1 ? "bien" : "bienes"}</span>
    </div>
  {:else}
    <div class="flex flex-col items-center gap-3 px-5 py-10 text-center">
      <div class="flex size-10 items-center justify-center rounded-full border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] text-[var(--form-text-soft)]">
        <svg class="size-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </div>
      <div>
        <p class="text-[13px] font-medium text-[var(--form-text-color)]">Sin bienes aún</p>
        <p class="mt-0.5 text-[12px] text-[var(--form-text-soft)]">Usa "Añadir bien" para registrar los productos a transportar.</p>
      </div>
    </div>
  {/if}
</div>

<WaybillItemEditor {isOpen} {itemEditor} {mode} on:close={handleClose} on:save={handleSave} />
