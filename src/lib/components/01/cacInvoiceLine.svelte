<script>
  import { createEventDispatcher } from "svelte";
  import {
    moneyIcon,
    noteIcon,
    packageIcon,
    quantityIcon,
    unitIcon,
  } from "./icons";

  let {
    affectationOptions = [],
    isOpen = false,
    isValid = false,
    itemAmounts = {
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    itemEditor = null,
    items = [],
    mode = "create",
    variant = "list",
  } = $props();

  const dispatch = createEventDispatcher();

  const fieldLabelClass = "font-medium";
  const fieldInputClass =
    "peer block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm text-[var(--form-text-color)] outline-none transition focus:border-[var(--form-color-3)] sm:py-3";
  const areaInputClass =
    "peer block min-h-32 w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm text-[var(--form-text-color)] outline-none transition focus:border-[var(--form-color-3)] sm:py-3";

  function createEditableItem(source = {}) {
    return {
      affectationType: affectationOptions[0] ?? "GRAVADA",
      description: "",
      notes: "",
      quantity: "1",
      unitCode: "NIU",
      unitPrice: "",
      ...source,
    };
  }

  let editorItem = $state(createEditableItem());

  $effect(() => {
    if (variant !== "editor") {
      return;
    }

    editorItem = createEditableItem(itemEditor);
  });
</script>

{#if variant === "list"}
  <div
    class="rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)] px-4 py-4 xl:col-span-8"
  >
    <div class="mb-2 flex items-center justify-between gap-3">
      <p
        class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
      >
        Detalle
      </p>
      <button
        class="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent px-3 py-1.5 text-sm text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
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
                <div
                  class="truncate text-[13px] font-medium text-[var(--form-text-color)]"
                >
                  {item.description}
                </div>
                <span
                  class="rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--form-color-3)_14%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--form-text-color)]"
                  >{item.affectationType}</span
                >
              </div>
              <div class="mt-1 text-[12px] text-[var(--form-text-soft)]">
                {item.quantity} x S/ {item.displayUnitPrice} · {item.unitCode ||
                  "NIU"}
              </div>
              {#if item.notes.trim()}
                <div
                  class="mt-1 line-clamp-2 text-[12px] text-[var(--form-text-faint)]"
                >
                  {item.notes}
                </div>
              {/if}
            </div>
            <div class="flex items-start gap-2">
              <div
                class="min-w-[94px] pt-0.5 text-right text-[13px] font-semibold tabular-nums text-[var(--form-text-color)]"
              >
                S/ {item.total}
              </div>
              <button
                aria-label="Editar ítem"
                class="inline-flex size-8 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
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
                class="inline-flex size-8 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
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
        class="rounded-[1rem] border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-[color:color-mix(in_oklab,var(--form-color-3)_8%,transparent)] px-4 py-6 text-center text-sm text-[var(--form-text-soft)]"
      >
        No hay items en este comprobante. Usa Añadir ítem para registrar la
        primera línea.
      </div>
    {/if}
  </div>
{:else if variant === "editor" && itemAmounts}
  {#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar modal"
        class="absolute inset-0 bg-[color:color-mix(in_oklab,var(--form-color-1)_74%,transparent)]"
        onclick={() => dispatch("close")}
        type="button"
      ></button>
      <div
        aria-labelledby="new-item-modal-title"
        aria-modal="true"
        class="relative w-full max-w-4xl overflow-hidden rounded-[1.2rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-panel-bg)] p-2"
        role="dialog"
        tabindex="-1"
      >
        <div
          class="relative rounded-[1.1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] bg-[var(--form-color-2)]"
        >
          <div
            class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] px-4 py-4"
          >
            <div class="space-y-1">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
              >
                Modal
              </p>
              <h5
                class="[font-family:var(--form-font-family)] text-[1.6rem] leading-none text-[var(--form-text-color)]"
                id="new-item-modal-title"
              >
                {mode === "edit" ? "Editar ítem" : "Nuevo ítem"}
              </h5>
              <p
                class="max-w-xl text-sm leading-6 text-[var(--form-text-soft)]"
              >
                Completa los datos de la línea antes de incorporarla al
                comprobante.
              </p>
            </div>
            <button
              aria-label="Cerrar modal"
              class="inline-flex size-9 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
              onclick={() => dispatch("close")}
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
                ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
              >
            </button>
          </div>

          <div class="space-y-4 px-4 py-4">
            <div
              class="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-[1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-panel-bg)] p-1.5"
            >
              {#each affectationOptions as option}
                <button
                  class={editorItem.affectationType === option
                    ? "rounded-[0.85rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-[var(--form-color-3)] px-3 py-2 text-sm font-semibold text-white"
                    : "rounded-[0.85rem] px-3 py-2 text-sm font-medium text-[var(--form-text-soft)]"}
                  onclick={() => (editorItem.affectationType = option)}
                  type="button"
                  >{option === "GRAVADA"
                    ? "Gravada"
                    : option === "EXONERADA"
                      ? "Exonerada"
                      : "Inafecta"}</button
                >
              {/each}
            </div>

            <div class="grid gap-3 sm:grid-cols-[120px_160px_minmax(0,1fr)]">
              <div
                class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]"
              >
                <span class={fieldLabelClass}>Cantidad</span>
                <div class="relative">
                  <input
                    class={fieldInputClass}
                    inputmode="decimal"
                    oninput={(event) =>
                      (editorItem.quantity = event.currentTarget.value)}
                    type="text"
                    value={editorItem.quantity}
                  />
                  <span
                    class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
                    >{@html quantityIcon}</span
                  >
                </div>
              </div>
              <div
                class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]"
              >
                <span class={fieldLabelClass}>Unidad</span>
                <div class="relative">
                  <input
                    class={fieldInputClass}
                    maxlength="4"
                    oninput={(event) =>
                      (editorItem.unitCode =
                        event.currentTarget.value.toUpperCase())}
                    type="text"
                    value={editorItem.unitCode}
                  />
                  <span
                    class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
                    >{@html unitIcon}</span
                  >
                </div>
              </div>
              <div
                class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]"
              >
                <span class={fieldLabelClass}>Precio unitario</span>
                <div class="relative">
                  <input
                    class={fieldInputClass}
                    inputmode="decimal"
                    oninput={(event) =>
                      (editorItem.unitPrice = event.currentTarget.value)}
                    type="text"
                    value={editorItem.unitPrice}
                  />
                  <span
                    class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
                    >{@html moneyIcon}</span
                  >
                </div>
              </div>
            </div>

            <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
              <span class={fieldLabelClass}>Descripción</span>
              <div class="relative">
                <input
                  class={fieldInputClass}
                  oninput={(event) =>
                    (editorItem.description = event.currentTarget.value)}
                  type="text"
                  value={editorItem.description}
                />
                <span
                  class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
                  >{@html packageIcon}</span
                >
              </div>
            </div>

            <div
              class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start"
            >
              <div
                class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]"
              >
                <span class={fieldLabelClass}>Detalle adicional</span>
                <div class="relative">
                  <textarea
                    class={areaInputClass}
                    oninput={(event) =>
                      (editorItem.notes = event.currentTarget.value)}
                    rows="4">{editorItem.notes}</textarea
                  >
                  <span
                    class="pointer-events-none absolute inset-y-0 start-0 flex items-start ps-4 pt-3 text-[var(--form-text-soft)]"
                    >{@html noteIcon}</span
                  >
                </div>
              </div>

              <div
                class="rounded-[1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-panel-bg)] px-4 py-4"
              >
                <div class="mb-3 flex items-center gap-3">
                  <div
                    class="h-px flex-1 bg-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)]"
                  ></div>
                  <p
                    class="text-sm font-semibold text-[var(--form-text-color)]"
                  >
                    Totales
                  </p>
                  <div
                    class="h-px flex-1 bg-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)]"
                  ></div>
                </div>

                <div class="space-y-2.5">
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-sm text-[var(--form-text-soft)]"
                      >Base imponible</span
                    >
                    <span
                      class="text-sm font-semibold text-[var(--form-text-color)]"
                      >S/ {itemAmounts.subtotal}</span
                    >
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-sm text-[var(--form-text-soft)]">IGV</span
                    >
                    <span
                      class="text-sm font-semibold text-[var(--form-text-color)]"
                      >S/ {itemAmounts.tax}</span
                    >
                  </div>
                  <div
                    class="border-t border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pt-2.5"
                  >
                    <div class="flex items-center justify-between gap-4">
                      <span
                        class="text-base font-semibold text-[var(--form-text-color)]"
                        >Importe total</span
                      >
                      <span
                        class="text-lg font-semibold text-[var(--form-text-color)]"
                        >S/ {itemAmounts.total}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex flex-col-reverse gap-3 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] px-4 py-4 sm:flex-row sm:justify-end"
          >
            <button
              class="inline-flex items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
              onclick={() => dispatch("close")}
              type="button">Cancelar</button
            >
            <button
              class="inline-flex items-center justify-center rounded-full border border-[var(--form-color-3)] bg-[var(--form-color-3)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!isValid}
              onclick={() => dispatch("save")}
              type="button"
              >{mode === "edit" ? "Guardar ítem" : "Agregar ítem"}</button
            >
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}
