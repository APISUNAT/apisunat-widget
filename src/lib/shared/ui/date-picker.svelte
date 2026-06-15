<script lang="ts">
  import { calendarIcon } from "$lib/constants/icons.constants";

  let {
    label = "",
    value = $bindable(""),
    showLabel = true,
    disabled = false,
    required = false,
  } = $props<{
    label?: string;
    value?: string;
    showLabel?: boolean;
    disabled?: boolean;
    required?: boolean;
  }>();

  const inputClass =
    "block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] ps-12 pe-4 py-3 text-sm font-medium text-[var(--form-text-color)] outline-none [appearance:textfield] [&::-webkit-calendar-picker-indicator]:hidden";
</script>

<div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
  {#if showLabel}
    <span class="font-medium">
      {label}
      {#if required}*{/if}
    </span>
  {/if}

  <div class="relative">
    <input
      bind:value
      type="date"
      autocomplete="off"
      spellcheck="false"
      aria-label={label}
      {disabled}
      {required}
      class={inputClass}
    />

    <span
      class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
    >
      {@html calendarIcon}
    </span>
  </div>
</div>