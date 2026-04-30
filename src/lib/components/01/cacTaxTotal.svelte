<script>
  let { totals } = $props();
</script>

<div class="space-y-2.5">
  <div
    class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
  >
    <span class="text-sm text-[var(--form-text-soft)]">Valor gravado</span>
    <span class="text-sm font-semibold text-[var(--form-text-color)]"
      >S/ {totals.taxableSubtotal}</span
    >
  </div>
  <div
    class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
  >
    <span class="text-sm text-[var(--form-text-soft)]">Valor exonerado</span>
    <span class="text-sm font-semibold text-[var(--form-text-color)]"
      >S/ {totals.exoneratedSubtotal}</span
    >
  </div>
  <div
    class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
  >
    <span class="text-sm text-[var(--form-text-soft)]">Valor inafecto</span>
    <span class="text-sm font-semibold text-[var(--form-text-color)]"
      >S/ {totals.unaffectedSubtotal}</span
    >
  </div>
  <div
    class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
  >
    <span class="text-sm text-[var(--form-text-soft)]">IGV</span>
    <span class="text-sm font-semibold text-[var(--form-text-color)]"
      >S/ {totals.tax}</span
    >
  </div>
</div>
