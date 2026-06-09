<script lang="ts">
  let {
    label = '',
    value = $bindable(),
    options = [],
    placeholder = 'Seleccione una opción',
    showLabel = true,
    disabled = false,
    required = false,
  } = $props();

  const selectClass =
    'block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 text-sm font-medium text-[var(--form-text-color)] outline-none';
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
    <option value="">
      {placeholder || label}
    </option>

    {#each options as option}
      <option value={option.value}>
        {option.label}
      </option>
    {/each}
  </select>
</div>