<script lang="ts">
  import HeaderDocument from "$lib/shared/components/header/header-document.component.svelte";
  import HeaderOptions from "$lib/shared/components/header/header-options.component.svelte";
  import Supplier from "$lib/shared/components/suplier/supplier.component.svelte";
  import Customer from "$lib/shared/components/customer/customer.component.svelte";
  import Lines from "$lib/shared/components/lines/lines.component.svelte";
  import PaymentTerms from "$lib/shared/components/payment-terms/payment-terms.component.svelte";
  import NotesPanel from "$lib/shared/components/notes/notes-panel.component.svelte";
  import Retention from "$lib/modules/invoice/components/retention.component.svelte";
  import { documentStore } from "$lib/store/document.store";
  import { derived } from "svelte/store";

  let {
    showHeader = true,
    showSupplier = true,
    showRetention = true,
    onEmitClick = undefined as (() => Promise<any>) | undefined,
  } = $props();

  let emitting = $state(false);

  const totals = derived(documentStore, ($doc) => {
    const opGravada =
      $doc["cac:LegalMonetaryTotal"]?.["cbc:LineExtensionAmount"]?._text ?? 0;
    const igv = $doc["cac:TaxTotal"]?.["cbc:TaxAmount"]?._text ?? 0;
    const total =
      $doc["cac:LegalMonetaryTotal"]?.["cbc:PayableAmount"]?._text ?? 0;
    return {
      opGravada: parseFloat(String(opGravada)).toFixed(2),
      igv: parseFloat(String(igv)).toFixed(2),
      total: parseFloat(String(total)),
    };
  });

  const sectionLabel =
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]";
  const panelClass =
    "overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]";

  async function handleEmit() {
    if (!onEmitClick) return;
    emitting = true;
    try {
      await onEmitClick();
    } finally {
      emitting = false;
    }
  }
</script>

<section
  class="relative isolate min-h-full p-3 [font-family:var(--form-font-family)] text-[var(--form-text-color)] md:p-4"
>
  <div class="bg-[var(--form-color-2)]">
    <div class="grid gap-4 px-4 py-4">
      <!-- Documento -->
      {#if showHeader}
        <section class="space-y-3 pt-1">
          <p class={sectionLabel}>Documento</p>
          <HeaderDocument />
        </section>
      {/if}

      <!-- Opciones del documento -->
      <section class="space-y-3 pt-1">
        <p class={sectionLabel}></p>
        <HeaderOptions />
      </section>

      <!-- Emisor -->
      {#if showSupplier}
        <section class="space-y-3 pt-1">
          <p class={sectionLabel}>Emisor</p>
          <Supplier />
        </section>
      {/if}

      <!-- Cliente -->
      <section class="space-y-3 pt-1">
        <p class={sectionLabel}>Cliente</p>
        <Customer />
      </section>

      <!-- Ítems + sidebar derecha (resumen + pago) -->
      <section class="space-y-3 pt-1">
        <p class={sectionLabel}>Ítems</p>
        <div class="grid gap-4 lg:grid-cols-[70%_1fr] lg:items-start">
          <!-- Columna izquierda: ítems (70%) -->
          <Lines />

          <!-- Columna derecha: notas + resumen + pago (30%) -->
          <div class="grid gap-4">
            <!-- Botón notas — arriba del resumen -->
            <NotesPanel />

            <!-- Resumen -->
            <div class={panelClass}>
              <div
                class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3"
              >
                <p class={sectionLabel}>Resumen</p>
              </div>
              <div class="px-5 py-4 space-y-2.5">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]"
                    >Op. gravada</span
                  >
                  <span
                    class="text-sm font-semibold tabular-nums text-[var(--form-text-color)]"
                  >
                    S/ {$totals.opGravada}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-[var(--form-text-soft)]">IGV</span>
                  <span
                    class="text-sm font-semibold tabular-nums text-[var(--form-text-color)]"
                  >
                    S/ {$totals.igv}
                  </span>
                </div>
                <div
                  class="border-t border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] pt-2.5 flex items-center justify-between gap-4"
                >
                  <span
                    class="text-base font-semibold text-[var(--form-text-color)]"
                    >Total</span
                  >
                  <span
                    class="text-xl font-semibold tabular-nums text-[var(--form-text-color)]"
                  >
                    S/ {$totals.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <!-- Retención -->
            {#if showRetention}
              <Retention />
            {/if}

            <!-- Método de pago -->
            <PaymentTerms total={$totals.total} />
          </div>
        </div>
      </section>

      <!-- Botón emitir -->
      {#if onEmitClick}
        <section class="pt-1 pb-2 flex justify-end">
          <button
            onclick={handleEmit}
            disabled={emitting}
            class="flex items-center justify-center gap-2 rounded-[1.15rem] border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_35%,transparent)] px-4 py-3 text-[13px] font-medium text-[var(--form-text-soft)] transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)] hover:text-[var(--form-text-color)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {#if emitting}
              Emitiendo...
            {:else}
              Emitir comprobante
            {/if}
          </button>
        </section>
      {/if}
    </div>
  </div>
</section>
