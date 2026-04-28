<script lang="ts">
  import { documentIcon, moneyIcon } from "./icons";
  import type { InvoiceDocumentMeta } from "./types";

  let { documentMeta }: { documentMeta: InvoiceDocumentMeta } = $props();

  const fieldInputClass =
    "block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-color-1)] px-4 py-3 ps-11 text-sm font-medium text-white outline-none sm:py-3";
</script>

<section class="space-y-3 pt-1">
  <p
    class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-color-3)]"
  >
    Documento
  </p>
  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <div class="grid gap-1.5 text-[13px] text-white/70">
      <span class="font-medium">Tipo de comprobante</span>
      <div class="relative">
        <input
          class={fieldInputClass}
          readonly
          type="text"
          value={documentMeta.typeLabel}
        />
        <span
          class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
          >{@html documentIcon}</span
        >
      </div>
    </div>
    <div class="grid gap-1.5 text-[13px] text-white/70">
      <span class="font-medium">Tipo de operación</span>
      <div class="relative">
        <input
          class={fieldInputClass}
          readonly
          type="text"
          value={documentMeta.operationType}
        />
        <span
          class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
          >{@html documentIcon}</span
        >
      </div>
    </div>
    <div class="grid gap-1.5 text-[13px] text-white/70">
      <span class="font-medium">Serie</span>
      <div class="relative">
        <input
          class={fieldInputClass}
          readonly
          type="text"
          value={documentMeta.series}
        />
        <span
          class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
          >{@html documentIcon}</span
        >
      </div>
    </div>
    <div class="grid gap-1.5 text-[13px] text-white/70">
      <span class="font-medium">Correlativo</span>
      <div class="relative">
        <input
          class={fieldInputClass}
          readonly
          type="text"
          value={documentMeta.correlative}
        />
        <span
          class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
          >{@html documentIcon}</span
        >
      </div>
    </div>
    <div class="xl:col-span-2">
      <div class="grid gap-1.5 text-[13px] text-white/70">
        <span class="font-medium">Fecha de emisión</span>
        <div class="relative">
          <input
            class={fieldInputClass}
            readonly
            type="text"
            value={documentMeta.issueDate}
          />
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
            >{@html documentIcon}</span
          >
        </div>
      </div>
    </div>
    <div class="grid gap-1.5 text-[13px] text-white/70">
      <span class="font-medium">Moneda</span>
      <div class="relative">
        <input
          class={fieldInputClass}
          readonly
          type="text"
          value={documentMeta.currency}
        />
        <span
          class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
          >{@html moneyIcon}</span
        >
      </div>
    </div>
  </div>
</section>
