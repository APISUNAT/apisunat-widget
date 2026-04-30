<script>
  import { documentIcon } from "./icons";

  let { value = $bindable("") } = $props();

  const fieldInputClass =
    "block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm font-medium text-[var(--form-text-color)] outline-none sm:py-3";
</script>

<div class="xl:col-span-2">
  <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
    <span class="font-medium">Fecha de emisión</span>
    <div class="relative">
      <input
        class={fieldInputClass}
        oninput={(event) => (value = event.currentTarget.value)}
        type="text"
        {value}
      />
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
        >{@html documentIcon}</span
      >
    </div>
  </div>
</div>
