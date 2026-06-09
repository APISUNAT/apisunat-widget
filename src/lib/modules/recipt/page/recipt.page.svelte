<script lang="ts">
  import HeaderDocument from '$lib/shared/components/header/header-document.component.svelte'
  import HeaderOptions from '$lib/shared/components/header/header-options.component.svelte'
  import Supplier from '$lib/shared/components/suplier/suplier.component.svelte'
  import Customer from '$lib/shared/components/customer/customer.component.svelte'
  import Lines from '$lib/shared/components/lines/lines.component.svelte'
  import DocumentReference from '$lib/shared/components/document-reference/document-reference.component.svelte'
  import PaymentTerms from '$lib/shared/components/payment-terms/payment-terms.component.svelte'
  import { documentStore } from '$lib/store/document.store'
  import { derived } from 'svelte/store'

  let { title = 'BOLETA SUNAT', showHeader = true , showSupplier = true } = $props()

  const totals = derived(documentStore, ($doc) => {
    const opGravada = $doc['cac:LegalMonetaryTotal']?.['cbc:LineExtensionAmount']?._text ?? 0
    const igv       = $doc['cac:TaxTotal']?.['cbc:TaxAmount']?._text ?? 0
    const total     = $doc['cac:LegalMonetaryTotal']?.['cbc:PayableAmount']?._text ?? 0
    return {
      opGravada: parseFloat(String(opGravada)).toFixed(2),
      igv:       parseFloat(String(igv)).toFixed(2),
      total:     parseFloat(String(total)),
    }
  })

  const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
  const panelClass   = "overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]"
</script>

<section class="relative isolate min-h-full p-3 [font-family:var(--form-font-family)] text-[var(--form-text-color)] md:p-4">
  <div class="bg-[var(--form-color-2)]">
    <div class="grid gap-4 px-4 py-4">

      <!-- Título -->
      <div class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] pb-4">
        <p class={sectionLabel}>Comprobante</p>
        <h4 class="mt-1 text-2xl text-[var(--form-text-color)]">{title}</h4>
      </div>

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

          <!-- Columna derecha: resumen + pago (30%) -->
          <div class="grid gap-4">

          <!-- Resumen -->
          <div class={panelClass}>
            <div class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3">
              <p class={sectionLabel}>Resumen</p>
            </div>
            <div class="px-5 py-4 space-y-2.5">
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm text-[var(--form-text-soft)]">Op. gravada</span>
                <span class="text-sm font-semibold tabular-nums text-[var(--form-text-color)]">S/ {$totals.opGravada}</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm text-[var(--form-text-soft)]">IGV (18%)</span>
                <span class="text-sm font-semibold tabular-nums text-[var(--form-text-color)]">S/ {$totals.igv}</span>
              </div>
              <div class="border-t border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] pt-2.5 flex items-center justify-between gap-4">
                <span class="text-base font-semibold text-[var(--form-text-color)]">Total</span>
                <span class="text-xl font-semibold tabular-nums text-[var(--form-text-color)]">S/ {$totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Método de pago -->
          <PaymentTerms total={$totals.total} />

          </div>
        </div>
      </section>

    </div>
  </div>
</section>