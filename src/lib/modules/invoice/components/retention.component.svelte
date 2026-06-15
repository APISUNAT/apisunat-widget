<script lang="ts">
  import { documentStore } from "$lib/store/document.store";
  import { setRetentionActions } from "./retention.component";

  let active = $state(false);
  let isReady = false;

  // Solo lectura inicial
  $effect(() => {
    const doc = $documentStore;
    if (isReady) return;
    const existing = (doc['cac:AllowanceCharge'] as any[])?.[0];
    if (existing?.['cbc:AllowanceChargeReasonCode']?._text === '62') {
      active = true;
    }
    isReady = true;
  });

  // Derivados de solo display
  const total = $derived(
    ($documentStore['cac:LegalMonetaryTotal']?.['cbc:TaxInclusiveAmount']?._text as number) ?? 0
  );
  const retentionAmount = $derived(parseFloat((total * 0.03).toFixed(2)));
  const payable = $derived(parseFloat((total - retentionAmount).toFixed(2)));

  function toggle() {
    active = !active;
    setRetentionActions(active);
  }
</script>

<div class="overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)] px-5 py-3.5">
  <div class="flex items-center justify-between gap-4">
    <span class="text-sm font-medium text-[var(--form-text-soft)]">
      Retención (3%)
    </span>

    <div class="flex items-center gap-4">
      {#if active}
        <span class="text-xl font-semibold tabular-nums text-[var(--form-text-color)]">
          S/ {retentionAmount.toFixed(2)}
        </span>
      {/if}

      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label="Activar retención del 3%"
        onclick={toggle}
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 {active
          ? 'bg-[var(--form-color-3)]'
          : 'bg-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)]'}"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 {active
            ? 'translate-x-5'
            : 'translate-x-0'}"
        ></span>
      </button>
    </div>
  </div>
</div>