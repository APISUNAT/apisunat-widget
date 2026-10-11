<script lang="ts">
  import { validationErrorsStore } from '$lib/store/validation-errors.store';

  let {
    label = '',
    value = $bindable(),
    options = [],
    placeholder = 'Seleccione una opción',
    showLabel = true,
    disabled = false,
    required = false,
    fieldName = undefined,
  } = $props();

  // Obtener errores del store
  const errors = $derived($validationErrorsStore);
  const hasError = $derived(fieldName ? errors.some(e => e.field === fieldName) : false);

  const selectClass = $derived(
    hasError
      ? 'block w-full rounded-xl border-2 border-red-500 bg-[var(--form-field-bg)] px-4 py-3 text-sm font-medium text-[var(--form-text-color)] outline-none disabled:opacity-50 disabled:cursor-not-allowed'
      : 'block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 text-sm font-medium text-[var(--form-text-color)] outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  );
</script>

<div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
  {#if showLabel}
    <span class="font-medium">
      {label}
      {#if required}*{/if}
    </span>
  {/if}

    <select
        bind:value
        {disabled}
        {required}
        class={selectClass}
    >
        {#each options as option}
            <option value={option.value}>
            {option.label}
            </option>
        {/each}
    </select>
</div>