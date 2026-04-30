<script>
  import { noteIcon } from "./icons";

  let { note = $bindable("") } = $props();
</script>

<div class="grid w-full gap-1.5 text-[13px] text-[var(--form-text-muted)]">
  <span class="font-medium">Observación</span>
  <div class="relative">
    <textarea
      class="block min-h-32 w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm text-[var(--form-text-color)] outline-none"
      oninput={(event) => (note = event.currentTarget.value)}
      rows="5">{note}</textarea
    >
    <span
      class="pointer-events-none absolute inset-y-0 start-0 flex items-start ps-4 pt-3 text-[var(--form-text-soft)]"
      >{@html noteIcon}</span
    >
  </div>
</div>
