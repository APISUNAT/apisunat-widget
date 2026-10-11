<script lang="ts">
  let {
    label = '',
    checked = $bindable(false),
    disabled = false,
  }: {
    label?: string;
    checked?: boolean;
    disabled?: boolean;
  } = $props();
</script>

<label class="flex items-center gap-2 cursor-pointer min-w-0">
  <div class="relative shrink-0">
    <input
      type="checkbox"
      bind:checked
      {disabled}
      class="sr-only"
    />

    <div
      class="w-[46px] h-6 rounded-full transition-colors relative flex items-center px-1.5"
      class:bg-gray-300={!checked}
      class:bg-blue-600={checked}
      class:opacity-50={disabled}
      class:justify-end={!checked}
      class:justify-start={checked}
    >
      <!-- Círculo deslizante -->
      <div
        class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200"
        class:left-0.5={!checked}
        class:left-[22px]={checked}
      ></div>

      <!-- Texto Sí/No -->
      <span class="text-[10px] font-semibold text-white select-none z-10">
        {#if checked}
          Sí
        {:else}
          No
        {/if}
      </span>
    </div>
  </div>

  <span
    class="text-[11px] font-medium text-[var(--form-text-color)] select-none leading-tight min-w-0"
  >
    {label}
  </span>
</label>