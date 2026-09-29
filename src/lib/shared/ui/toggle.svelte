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
      class="sr-only peer"
    />

    <div
      class="w-[46px] h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-disabled:opacity-50 transition-colors flex items-center justify-center"
    >
      <span class="text-[10px] font-semibold text-white select-none">
        {#if checked}
          Sí
        {:else}
          No
        {/if}
      </span>
    </div>
  </div>

  <span
    class="text-[13px] font-medium text-[var(--form-text-color)] select-none leading-tight min-w-0"
  >
    {label}
  </span>
</label>