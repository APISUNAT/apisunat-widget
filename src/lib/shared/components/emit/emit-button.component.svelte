<script lang="ts">
  import {
    validateDocument,
    type ValidationError,
  } from "$lib/shared/utils/validate-documents";
  import { resetDocument } from "$lib/store/document.store";

  let { onEmitClick = undefined as (() => Promise<any>) | undefined } =
    $props();

  let emitting = $state(false);
  let errors = $state<ValidationError[]>([]);
  let errorTimeout: ReturnType<typeof setTimeout> | null = null;

  async function handleEmitASYNC() {
  if (!onEmitClick) return

  const result = validateDocument()

  if (result.length > 0) {
    errors = result

    if (errorTimeout) clearTimeout(errorTimeout)

    errorTimeout = setTimeout(() => errors = [], 4000)

    return
  }

  emitting = true

  try {
    const response = await onEmitClick()

    if (response?.status === 'PENDIENTE') {
      resetDocument()
    }
  } finally {
    emitting = false
  }
}
</script>

<!-- Toast -->
{#if errors.length > 0}
  <div class="fixed top-6 right-6 z-50 flex flex-col gap-2">
    {#each errors as error}
      <div
        class="flex items-center gap-3 rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-panel-bg)] px-4 py-3 shadow-lg"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0"></span>
        <p class="text-[13px] text-[var(--form-text-color)]">{error.message}</p>
      </div>
    {/each}
  </div>
{/if}
<!-- Botón -->
<button
  onclick={handleEmitASYNC}
  disabled={emitting}
  class="flex items-center justify-center gap-2 rounded-[1.15rem] border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_35%,transparent)] px-4 py-3 text-[13px] font-medium text-[var(--form-text-soft)] transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)] hover:text-[var(--form-text-color)] disabled:opacity-40 disabled:cursor-not-allowed"
>
  {emitting ? "Emitiendo..." : "Emitir comprobante"}
</button>
