<script lang="ts">
  import { summary } from './summary-panel.component'
</script>

<div class="overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]">
  <div class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3">
    <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]">Resumen</p>
  </div>
  <div class="px-5 py-4 space-y-2.5">
    <div class="flex items-center justify-between gap-4">
      <span class="text-sm text-[var(--form-text-soft)]">Op. gravada</span>
      <span class="text-sm font-semibold tabular-nums text-[var(--form-text-color)]">
        {$summary.symbol} {$summary.opGravada}
      </span>
    </div>
    <div class="flex items-center justify-between gap-4">
      <span class="text-sm text-[var(--form-text-soft)]">IGV</span>
      <span class="text-sm font-semibold tabular-nums text-[var(--form-text-color)]">
        {$summary.symbol} {$summary.igv}
      </span>
    </div>
    <div class="border-t border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] pt-2.5 flex items-center justify-between gap-4">
      <span class="text-base font-semibold text-[var(--form-text-color)]">Total</span>
      <span class="text-xl font-semibold tabular-nums text-[var(--form-text-color)]">
        {$summary.symbol} {$summary.total}
      </span>
    </div>
  </div>
</div>