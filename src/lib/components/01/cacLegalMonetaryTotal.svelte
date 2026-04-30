<script>
  let { totals } = $props();
</script>

<div class="space-y-2.5">
  <div
    class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pb-2.5"
  >
    <span class="text-sm text-[var(--form-text-soft)]">Total esperado</span>
    <span class="text-sm font-semibold text-[var(--form-text-color)]"
      >S/ {totals.expectedSubtotal}</span
    >
  </div>
  <div class="flex items-start justify-between gap-4 pt-1">
    <span class="text-sm font-semibold text-[var(--form-text-color)]"
      >Importe total</span
    >
    <span class="text-xl font-semibold text-[var(--form-text-color)]"
      >S/ {totals.payable}</span
    >
  </div>
</div>
