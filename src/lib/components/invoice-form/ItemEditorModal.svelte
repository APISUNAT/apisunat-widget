<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    moneyIcon,
    noteIcon,
    packageIcon,
    quantityIcon,
    unitIcon,
  } from "./icons";
  import { affectationOptions, getItemAmounts } from "./logic";
  import type { InvoiceItemEditor } from "./types";

  let {
    isOpen,
    isValid,
    itemEditor,
    mode,
  }: {
    isOpen: boolean;
    isValid: boolean;
    itemEditor: InvoiceItemEditor;
    mode: "create" | "edit";
  } = $props();

  const dispatch = createEventDispatcher<{ close: void; save: void }>();
  const fieldLabelClass = "font-medium";
  const fieldInputClass =
    "peer block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-color-1)] px-4 py-3 ps-11 text-sm text-white outline-none transition focus:border-[var(--form-color-3)] sm:py-3";
  const areaInputClass =
    "peer block min-h-32 w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-color-1)] px-4 py-3 ps-11 text-sm text-white outline-none transition focus:border-[var(--form-color-3)] sm:py-3";
  let itemAmounts = $derived.by(() => getItemAmounts(itemEditor));
</script>

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
      class="relative w-full max-w-4xl overflow-hidden rounded-[1.2rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-color-1)] p-2"
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
              class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-color-3)]"
            >
              Modal
            </p>
            <h5
              class="font-display text-[1.6rem] leading-none text-white"
              id="new-item-modal-title"
            >
              {mode === "edit" ? "Editar ítem" : "Nuevo ítem"}
            </h5>
            <p class="max-w-xl text-sm leading-6 text-white/66">
              Completa los datos de la línea antes de incorporarla al
              comprobante.
            </p>
          </div>
          <button
            aria-label="Cerrar modal"
            class="inline-flex size-9 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent text-white transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
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
            class="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-[1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-color-1)] p-1.5"
          >
            {#each affectationOptions as option}
              <button
                class={itemEditor.affectationType === option
                  ? "rounded-[0.85rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-[var(--form-color-3)] px-3 py-2 text-sm font-semibold text-white"
                  : "rounded-[0.85rem] px-3 py-2 text-sm font-medium text-white/64"}
                onclick={() => (itemEditor.affectationType = option)}
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
            <div class="grid gap-1.5 text-[13px] text-white/70">
              <span class={fieldLabelClass}>Cantidad</span>
              <div class="relative">
                <input
                  bind:value={itemEditor.quantity}
                  class={fieldInputClass}
                  inputmode="decimal"
                  type="text"
                />
                <span
                  class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
                  >{@html quantityIcon}</span
                >
              </div>
            </div>
            <div class="grid gap-1.5 text-[13px] text-white/70">
              <span class={fieldLabelClass}>Unidad</span>
              <div class="relative">
                <input
                  bind:value={itemEditor.unitCode}
                  class={fieldInputClass}
                  maxlength="4"
                  oninput={() =>
                    (itemEditor.unitCode = itemEditor.unitCode.toUpperCase())}
                  type="text"
                />
                <span
                  class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
                  >{@html unitIcon}</span
                >
              </div>
            </div>
            <div class="grid gap-1.5 text-[13px] text-white/70">
              <span class={fieldLabelClass}>Precio unitario</span>
              <div class="relative">
                <input
                  bind:value={itemEditor.unitPrice}
                  class={fieldInputClass}
                  inputmode="decimal"
                  type="text"
                />
                <span
                  class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
                  >{@html moneyIcon}</span
                >
              </div>
            </div>
          </div>

          <div class="grid gap-1.5 text-[13px] text-white/70">
            <span class={fieldLabelClass}>Descripción</span>
            <div class="relative">
              <input
                bind:value={itemEditor.description}
                class={fieldInputClass}
                type="text"
              />
              <span
                class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
                >{@html packageIcon}</span
              >
            </div>
          </div>

          <div
            class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start"
          >
            <div class="grid gap-1.5 text-[13px] text-white/70">
              <span class={fieldLabelClass}>Detalle adicional</span>
              <div class="relative">
                <textarea
                  bind:value={itemEditor.notes}
                  class={areaInputClass}
                  rows="4"
                ></textarea>
                <span
                  class="pointer-events-none absolute inset-y-0 start-0 flex items-start ps-4 pt-3 text-[var(--form-color-3)]"
                  >{@html noteIcon}</span
                >
              </div>
            </div>

            <div
              class="rounded-[1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-color-1)] px-4 py-4"
            >
              <div class="mb-3 flex items-center gap-3">
                <div
                  class="h-px flex-1 bg-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)]"
                ></div>
                <p class="text-sm font-semibold text-white">Totales</p>
                <div
                  class="h-px flex-1 bg-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)]"
                ></div>
              </div>

              <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-white/66">Base imponible</span>
                  <span class="text-sm font-semibold text-white"
                    >S/ {itemAmounts.subtotal}</span
                  >
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-white/66">IGV</span>
                  <span class="text-sm font-semibold text-white"
                    >S/ {itemAmounts.tax}</span
                  >
                </div>
                <div
                  class="border-t border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pt-2.5"
                >
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-base font-semibold text-white"
                      >Importe total</span
                    >
                    <span class="text-lg font-semibold text-white"
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
            class="inline-flex items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
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
