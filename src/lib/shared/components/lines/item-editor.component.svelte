<script lang="ts">
  import { packageIcon, quantityIcon } from "$lib/constants/icons.constants";
  import { createEventDispatcher } from "svelte";
  import {
    CATALOGO02,
    CATALOGO03,
    CATALOGO05,
    CATALOGOIGVPercents,
  } from "$lib/constants/catalagos";
  import Input from "$lib/shared/ui/input.svelte";
  import SelectString from "$lib/shared/ui/select.svelte";
  import { documentStore, documentTypeStore } from "$lib/store/document.store";
  import {
    createEditableItem,
    calcItemAmounts,
    calcPrecioFromValor,
    calcValorFromPrecio,
    calcPrecioOnRateChange,
  } from "./item-editor.utils";

  let { isOpen = false, itemEditor = null, mode = "create" } = $props();

  const dispatch = createEventDispatcher();

  const symbol = $derived(
    CATALOGO02.find(
      (c) =>
        c.value ===
        ($documentStore["cbc:DocumentCurrencyCode"]?._text ?? "PEN"),
    )?.symbol ?? "S/",
  );

  const fieldLabelClass = "font-medium";

  let editorItem = $state(createEditableItem());
  let lastEdited = $state<"valor" | "precio" | null>(null);

  $effect(() => {
    editorItem = isOpen
      ? createEditableItem(itemEditor ?? {})
      : createEditableItem();
    lastEdited = null;
  });

  $effect(() => {
    const val = editorItem.valorUnitario;
    if (lastEdited !== "valor") return;
    editorItem.precioUnitario = calcPrecioFromValor(val, editorItem.igvRate);
  });

  $effect(() => {
    const precio = editorItem.precioUnitario;
    if (lastEdited !== "precio") return;
    editorItem.valorUnitario = calcValorFromPrecio(precio, editorItem.igvRate);
  });

  const itemAmounts = $derived.by(() =>
    calcItemAmounts(
      editorItem.quantity,
      editorItem.precioUnitario,
      editorItem.igvRate,
    ),
  );

  const isZeroPriceAllowed = $derived(
    $documentTypeStore === '07' &&
    $documentStore['cac:DiscrepancyResponse']?.['cbc:ResponseCode']?._text === '03'
  );

  const isValid = $derived(
    editorItem.description.trim().length > 0 &&
      parseFloat(editorItem.quantity) > 0 &&
      (isZeroPriceAllowed || parseFloat(editorItem.precioUnitario) > 0),
  );

  function onRateChange(newRate: number) {
    editorItem.igvRate = newRate;
    editorItem.precioUnitario = calcPrecioOnRateChange(
      editorItem.valorUnitario,
      newRate,
    );
  }
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
      class="relative w-full max-w-4xl overflow-hidden rounded-[1.2rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-panel-bg)] p-2"
      role="dialog"
      tabindex="-1"
    >
      <div
        class="relative rounded-[1.1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] bg-[var(--form-color-2)]"
      >
        <!-- Header -->
        <div
          class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] px-4 py-4"
        >
          <div class="space-y-1">
            <p
              class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
            >
              Ítem
            </p>
            <h5
              class="[font-family:var(--form-font-family)] text-[1.6rem] leading-none text-[var(--form-text-color)]"
              id="new-item-modal-title"
            >
              {mode === "edit" ? "Editar ítem" : "Nuevo ítem"}
            </h5>
            <p class="max-w-xl text-sm leading-6 text-[var(--form-text-soft)]">
              Completa los datos antes de agregar al comprobante.
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
            >
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="space-y-4 px-4 py-4">
          <!-- Fila 1: Cantidad + Unidad + Descripción -->
          <div class="grid gap-3 sm:grid-cols-[100px_200px_minmax(0,1fr)]">
            <Input
              label="Cantidad"
              bind:value={editorItem.quantity}
              icon={quantityIcon}
              onlyNumbers={true}
              maxDecimals={10}
            />

            <SelectString
              label="Unidad"
              bind:value={editorItem.unitCode}
              options={CATALOGO03}
            />

            <Input
              label="Descripción"
              bind:value={editorItem.description}
              icon={packageIcon}
            />
          </div>

          <!-- Fila 2: Precios + Panel totales -->
          <div
            class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start"
          >
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
                <span class={fieldLabelClass}>
                  Valor unitario
                  <span class="font-normal text-[var(--form-text-soft)]">(sin IGV)</span>
                </span>
                <Input
                  showLabel={false}
                  placeholder="0.00"
                  bind:value={editorItem.valorUnitario}
                  maxDecimals={10}
                  icon={symbol}
                  onlyNumbers={true}
                  oninput={() => (lastEdited = "valor")}
                />
              </div>

              <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
                <span class={fieldLabelClass}>
                  Precio unitario
                  <span class="font-normal text-[var(--form-text-soft)]">(con IGV)</span>
                </span>
                <Input
                  showLabel={false}
                  placeholder="0.00"
                  bind:value={editorItem.precioUnitario}
                  maxDecimals={10}
                  icon={symbol}
                  onlyNumbers={true}
                  oninput={() => (lastEdited = "precio")}
                />
              </div>
            </div>

            <!-- Panel totales -->
            <div
              class="rounded-[1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-panel-bg)] px-4 py-4"
            >
              <div class="space-y-2.5">

                <!-- Tipo de operación -->
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]">Tipo op.</span>
                  <div class="flex gap-1">
                    {#each CATALOGO05 as cat}
                      <button
                        type="button"
                        disabled={cat.value !== '1000'}
                        onclick={() => { editorItem.taxSchemeValue = cat.value }}
                        class="rounded-md px-2 py-1 text-xs font-medium border transition
                          {editorItem.taxSchemeValue === cat.value
                            ? 'border-[var(--form-color-3)] bg-[var(--form-color-3)] text-white'
                            : 'border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-transparent text-[var(--form-text-soft)]'}
                          disabled:opacity-35 disabled:cursor-not-allowed"
                      >
                        {cat.label}
                      </button>
                    {/each}
                  </div>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]">Tasa IGV</span>
                  <select
                    class="rounded-lg border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-2 py-1 text-sm text-[var(--form-text-color)] outline-none focus:border-[var(--form-color-3)]"
                    value={String(editorItem.igvRate)}
                    onchange={(e) =>
                      onRateChange(
                        Number((e.currentTarget as HTMLSelectElement).value),
                      )}
                  >
                    {#each CATALOGOIGVPercents as opt}
                      <option
                        value={String(opt.value)}
                        selected={opt.value === editorItem.igvRate}
                      >
                        {opt.label}
                      </option>
                    {/each}
                  </select>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]">Op. gravada</span>
                  <span class="text-sm font-semibold text-[var(--form-text-color)]">
                    {symbol} {itemAmounts.subtotal}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]">
                    IGV ({editorItem.igvRate}%)
                  </span>
                  <span class="text-sm font-semibold text-[var(--form-text-color)]">
                    {symbol} {itemAmounts.tax}
                  </span>
                </div>
                <div
                  class="border-t border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pt-2.5"
                >
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-base font-semibold text-[var(--form-text-color)]">
                      Importe total
                    </span>
                    <span class="text-lg font-semibold text-[var(--form-text-color)]">
                      {symbol} {itemAmounts.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
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
            onclick={() => dispatch("save", editorItem)}
            type="button"
          >
            {mode === "edit" ? "Guardar ítem" : "Agregar ítem"}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}