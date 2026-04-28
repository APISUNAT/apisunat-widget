<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getItemAmounts } from "./logic";
  import type { InvoiceItem } from "./types";

  let { items }: { items: InvoiceItem[] } = $props();
  const dispatch = createEventDispatcher<{
    create: void;
    edit: InvoiceItem;
    remove: string;
  }>();

  function getDisplayUnitPrice(value: string): number {
    return Math.max(0, Number(value) || 0);
  }
</script>

<div
  class="rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-color-1)] px-4 py-4 xl:col-span-8"
>
  <div class="mb-2 flex items-center justify-between gap-3">
    <p
      class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-color-3)]"
    >
      Detalle
    </p>
    <button
      class="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent px-3 py-1.5 text-sm text-white transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
      onclick={() => dispatch("create")}
      type="button"
    >
      <svg
        class="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"><path d="M12 5v14" /><path d="M5 12h14" /></svg
      >
      Añadir ítem
    </button>
  </div>
  {#if items.length}
    <ul
      class="divide-y divide-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)]"
    >
      {#each items as item (item.id)}
        <li class="flex items-start justify-between gap-3 py-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <div class="truncate text-[13px] font-medium text-white">
                {item.description}
              </div>
              <span
                class="rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--form-color-3)_14%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
                >{item.affectationType}</span
              >
            </div>
            <div class="mt-1 text-[12px] text-white/66">
              {item.quantity} x S/ {getDisplayUnitPrice(item.unitPrice)} · {item.unitCode ||
                "NIU"}
            </div>
            {#if item.notes.trim()}
              <div class="mt-1 line-clamp-2 text-[12px] text-white/48">
                {item.notes}
              </div>
            {/if}
          </div>
          <div class="flex items-start gap-2">
            <div
              class="min-w-[94px] pt-0.5 text-right text-[13px] font-semibold tabular-nums text-white"
            >
              S/ {getItemAmounts(item).total}
            </div>
            <button
              aria-label="Editar ítem"
              class="inline-flex size-8 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent text-white transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
              onclick={() => dispatch("edit", item)}
              type="button"
            >
              <svg
                class="size-4 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                ><path d="M12 20h9" /><path
                  d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"
                /></svg
              >
            </button>
            <button
              aria-label={`Eliminar ${item.description || "ítem"}`}
              class="inline-flex size-8 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent text-white transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
              onclick={() => dispatch("remove", item.id)}
              type="button"
            >
              <svg
                class="size-4 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                ><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path
                  d="M19 6l-1 14H6L5 6"
                /><path d="M10 11v6" /><path d="M14 11v6" /></svg
              >
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <div
      class="rounded-[1rem] border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--form-color-3)_8%,transparent)] px-4 py-6 text-center text-sm text-white/66"
    >
      No hay items en este comprobante. Usa Añadir ítem para registrar la
      primera línea.
    </div>
  {/if}
</div>
