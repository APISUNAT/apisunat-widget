<script lang="ts">
  import {
    createEditableAllowanceCharge,
    type EditableAllowanceCharge,
    type AllowanceChargeSide,
  } from "./charge-discount.component";

  let {
    value = $bindable<EditableAllowanceCharge[]>([
      createEditableAllowanceCharge(),
    ]),
    symbol = "S/",
  } = $props();

  function updateSide(
    index: number,
    side: "base" | "noBase",
    patch: Partial<AllowanceChargeSide>,
  ) {
    value = value.map((item, i) =>
      i === index ? { ...item, [side]: { ...item[side], ...patch } } : item,
    );
  }
</script>

{#snippet sideRow(
  item: EditableAllowanceCharge,
  index: number,
  side: "base" | "noBase",
  placeholder: string,
)}
  {@const data = item[side]}
  <div class="flex items-center gap-2">
    <button
      type="button"
      onclick={() =>
        updateSide(index, side, { chargeIndicator: !data.chargeIndicator })}
      class="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-[12px] font-semibold transition
      {data.chargeIndicator
        ? 'border-[var(--form-color-3)] bg-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] text-[var(--form-color-3)]'
        : 'border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] text-[var(--form-text-soft)]'}"
      aria-pressed={data.chargeIndicator}
    >
      <span class="uppercase tracking-[0.08em]">
        {data.chargeIndicator ? "Cargo" : "Descuento"}
      </span>
      <span
        class="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition
        {data.chargeIndicator
          ? 'bg-[var(--form-color-3)]'
          : 'bg-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)]'}"
      >
        <span
          class="absolute size-3 rounded-full bg-white shadow transition
          {data.chargeIndicator ? 'translate-x-3.5' : 'translate-x-0.5'}"
        ></span>
      </span>
    </button>

    <div class="relative flex-1">
      <input
        class="block w-full rounded-lg border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-2 py-1.5 ps-7 text-[13px] text-[var(--form-text-color)] outline-none focus:border-[var(--form-color-3)]"
        inputmode="decimal"
        {placeholder}
        value={data.amount}
        oninput={(e) =>
          updateSide(index, side, {
            amount: (e.currentTarget as HTMLInputElement).value,
          })}
      />
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2 text-[12px] text-[var(--form-text-soft)]"
      >
        {symbol}
      </span>
    </div>
  </div>
{/snippet}

<div class="grid gap-2">
  <span
    class="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--form-text-soft)]"
  >
    Cargos / descuentos
  </span>

  <ul class="grid gap-3">
    {#each value as item, i (i)}
      <li
        class="grid gap-2.5 rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] px-3 py-2.5"
      >
        {@render sideRow(item, i, "base", "Afecta la base")}
        {@render sideRow(item, i, "noBase", "No afecta la base")}
      </li>
    {/each}
  </ul>
</div>