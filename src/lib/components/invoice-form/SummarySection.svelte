<script lang="ts">
  import type { InvoiceTotals } from "./types";

  let {
    note,
    totals,
  }: {
    note: string;
    totals: InvoiceTotals;
  } = $props();
</script>

<div
  class="rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-color-1)] px-4 py-4 xl:col-span-4"
>
  <p
    class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-color-3)]"
  >
    Notas
  </p>
  <div class="grid w-full gap-1.5 text-[13px] text-white/70">
    <span class="font-medium">Observación</span>
    <div class="relative">
      <textarea
        class="block min-h-32 w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-color-1)] px-4 py-3 ps-11 text-sm text-white outline-none"
        rows="5">{note}</textarea
      >
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-start ps-4 pt-3 text-[var(--form-color-3)]"
        ><svg
          class="size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          ><path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          /><path d="M14 2v6h6" /><path d="M16 13H8" /><path
            d="M16 17H8"
          /><path d="M10 9H8" /></svg
        ></span
      >
    </div>
  </div>
  <div
    class="rounded-[1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-color-1)] px-4 py-4"
  >
    <div class="space-y-2.5">
      <div
        class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
      >
        <span class="text-sm text-white/66">Valor gravado</span>
        <span class="text-sm font-semibold text-white"
          >S/ {totals.taxableSubtotal}</span
        >
      </div>
      <div
        class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
      >
        <span class="text-sm text-white/66">Valor exonerado</span>
        <span class="text-sm font-semibold text-white"
          >S/ {totals.exoneratedSubtotal}</span
        >
      </div>
      <div
        class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
      >
        <span class="text-sm text-white/66">Valor inafecto</span>
        <span class="text-sm font-semibold text-white"
          >S/ {totals.unaffectedSubtotal}</span
        >
      </div>
      <div
        class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
      >
        <span class="text-sm text-white/66">IGV</span>
        <span class="text-sm font-semibold text-white">S/ {totals.tax}</span>
      </div>
      <div
        class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
      >
        <span class="text-sm text-white/66">Total esperado</span>
        <span class="text-sm font-semibold text-white"
          >S/ {totals.expectedSubtotal}</span
        >
      </div>
      <div class="flex items-start justify-between gap-4 pt-1">
        <span class="text-sm font-semibold text-white">Importe total</span>
        <span class="text-xl font-semibold text-white">S/ {totals.payable}</span
        >
      </div>
    </div>
  </div>
</div>
