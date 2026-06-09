<script lang="ts">
  import { packageIcon, quantityIcon, moneyIcon } from "$lib/constants/icons.constants";
  import { createEventDispatcher } from "svelte";
  import { CATALOGO03, CATALOGOIGVPercents } from "$lib/constants/catalagos";
  import SelectString from "$lib/shared/ui/select.svelte";

  let {
    isOpen = false,
    itemEditor = null,
    mode = "create",
  } = $props();

  const dispatch = createEventDispatcher();

  const fieldInputClass =
    "peer block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm text-[var(--form-text-color)] outline-none transition focus:border-[var(--form-color-3)] sm:py-3";

  const fieldLabelClass = "font-medium";

  function normalizeIgvRate(raw: any): number {
    const n = Number(raw);
    if (isNaN(n)) return 18;
    // si viene como decimal (0.18) convertir a entero (18)
    return n < 1 ? Math.round(n * 100) : n;
  }

  function createEditableItem(source: any = {}) {
    return {
      description:    source.description    ?? "",
      quantity:       source.quantity       ?? "1",
      unitCode:       source.unitCode       ?? "NIU",
      valorUnitario:  source.valorUnitario  ?? "",
      precioUnitario: source.precioUnitario ?? "",
      igvRate:        normalizeIgvRate(source.igvRate ?? 18),
    };
  }

  let editorItem = $state(createEditableItem());

  $effect(() => {
    if (!isOpen) {
      editorItem = createEditableItem();
    } else {
      editorItem = createEditableItem(itemEditor);
    }
  });

  const itemAmounts = $derived.by(() => {
    const qty    = parseFloat(editorItem.quantity) || 0;
    const rate   = editorItem.igvRate / 100;
    const precio = parseFloat(editorItem.precioUnitario) || 0;

    const total    = qty * precio;
    const subtotal = total / (1 + rate);
    const tax      = total - subtotal;

    return {
      subtotal: subtotal.toFixed(2),
      tax:      tax.toFixed(2),
      total:    total.toFixed(2),
    };
  });

  const isValid = $derived(
    editorItem.description.trim().length > 0 &&
    parseFloat(editorItem.precioUnitario) > 0 &&
    parseFloat(editorItem.quantity) > 0
  );

  function onValorInput(raw: string) {
    editorItem.valorUnitario = raw;
    const valor = parseFloat(raw) || 0;
    const rate  = editorItem.igvRate / 100;
    editorItem.precioUnitario = valor > 0 ? (valor * (1 + rate)).toFixed(2) : "";
  }

  function onPrecioInput(raw: string) {
    editorItem.precioUnitario = raw;
    const precio = parseFloat(raw) || 0;
    const rate   = editorItem.igvRate / 100;
    editorItem.valorUnitario = precio > 0 ? (precio / (1 + rate)).toFixed(2) : "";
  }

  function onIgvRateChange(newRate: number) {
    editorItem.igvRate = newRate;
    const precio = parseFloat(editorItem.precioUnitario) || 0;
    editorItem.valorUnitario = precio > 0 ? (precio / (1 + newRate / 100)).toFixed(2) : "";
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
      <div class="relative rounded-[1.1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] bg-[var(--form-color-2)]">

        <!-- Header -->
        <div class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] px-4 py-4">
          <div class="space-y-1">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]">
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
            <svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="space-y-4 px-4 py-4">

          <!-- Fila 1: Cantidad + Unidad + Descripción -->
          <div class="grid gap-3 sm:grid-cols-[100px_200px_minmax(0,1fr)]">

            <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
              <span class={fieldLabelClass}>Cantidad</span>
              <div class="relative">
                <input
                  class={fieldInputClass}
                  inputmode="decimal"
                  type="text"
                  value={editorItem.quantity}
                  oninput={(e) => (editorItem.quantity = (e.currentTarget as HTMLInputElement).value)}
                />
                <span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]">
                  {@html quantityIcon}
                </span>
              </div>
            </div>

            <SelectString
              label="Unidad"
              bind:value={editorItem.unitCode}
              options={CATALOGO03}
            />

            <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
              <span class={fieldLabelClass}>Descripción</span>
              <div class="relative">
                <input
                  class={fieldInputClass}
                  type="text"
                  value={editorItem.description}
                  oninput={(e) => (editorItem.description = (e.currentTarget as HTMLInputElement).value)}
                />
                <span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]">
                  {@html packageIcon}
                </span>
              </div>
            </div>
          </div>

          <!-- Fila 2: Precios + Panel totales -->
          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
                <span class={fieldLabelClass}>
                  Valor unitario
                  <span class="font-normal text-[var(--form-text-soft)]">(sin IGV)</span>
                </span>
                <div class="relative">
                  <input
                    class={fieldInputClass}
                    inputmode="decimal"
                    type="text"
                    value={editorItem.valorUnitario}
                    placeholder="0.00"
                    oninput={(e) => onValorInput((e.currentTarget as HTMLInputElement).value)}
                  />
                  <span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]">
                    {@html moneyIcon}
                  </span>
                </div>
              </div>
              <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
                <span class={fieldLabelClass}>
                  Precio unitario
                  <span class="font-normal text-[var(--form-text-soft)]">(con IGV)</span>
                </span>
                <div class="relative">
                  <input
                    class={fieldInputClass}
                    inputmode="decimal"
                    type="text"
                    value={editorItem.precioUnitario}
                    placeholder="0.00"
                    oninput={(e) => onPrecioInput((e.currentTarget as HTMLInputElement).value)}
                  />
                  <span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]">
                    {@html moneyIcon}
                  </span>
                </div>
              </div>
            </div>

            <!-- Panel totales -->
            <div class="rounded-[1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-panel-bg)] px-4 py-4">
              <div class="space-y-2.5">

                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]">Tasa IGV</span>
                  <select
                    class="rounded-lg border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-2 py-1 text-sm text-[var(--form-text-color)] outline-none focus:border-[var(--form-color-3)]"
                    value={String(editorItem.igvRate)}
                    onchange={(e) => {
                      const newRate = Number((e.currentTarget as HTMLSelectElement).value);
                      editorItem.igvRate = newRate;
                      const precio = parseFloat(editorItem.precioUnitario) || 0;
                      editorItem.valorUnitario = precio > 0 ? (precio / (1 + newRate / 100)).toFixed(2) : "";
                    }}
                  >
                    {#each CATALOGOIGVPercents as opt}
                      <option value={String(opt.value)} selected={opt.value === editorItem.igvRate}>
                        {opt.label}
                      </option>
                    {/each}
                  </select>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]">Op. gravada</span>
                  <span class="text-sm font-semibold text-[var(--form-text-color)]">S/ {itemAmounts.subtotal}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]">IGV ({editorItem.igvRate}%)</span>
                  <span class="text-sm font-semibold text-[var(--form-text-color)]">S/ {itemAmounts.tax}</span>
                </div>
                <div class="border-t border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pt-2.5">
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-base font-semibold text-[var(--form-text-color)]">Importe total</span>
                    <span class="text-lg font-semibold text-[var(--form-text-color)]">S/ {itemAmounts.total}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex flex-col-reverse gap-3 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] px-4 py-4 sm:flex-row sm:justify-end">
          <button
            class="inline-flex items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
            onclick={() => dispatch("close")}
            type="button"
          >Cancelar</button>
          <button
            class="inline-flex items-center justify-center rounded-full border border-[var(--form-color-3)] bg-[var(--form-color-3)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!isValid}
            onclick={() => dispatch("save", editorItem)}
            type="button"
          >{mode === "edit" ? "Guardar ítem" : "Agregar ítem"}</button>
        </div>

      </div>
    </div>
  </div>
{/if}