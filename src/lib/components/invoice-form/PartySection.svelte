<script lang="ts">
  import {
    buildingIcon,
    documentIcon,
    mailIcon,
    phoneIcon,
    userIcon,
  } from "./icons";
  import type { InvoiceParty } from "./types";

  let {
    party,
    title,
    showExtended = false,
  }: {
    party: InvoiceParty;
    title: string;
    showExtended?: boolean;
  } = $props();

  const fieldInputClass =
    "block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-color-1)] px-4 py-3 ps-11 text-sm font-medium text-white outline-none sm:py-3";
</script>

<section
  class="space-y-3 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] pt-5"
>
  <p
    class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-color-3)]"
  >
    {title}
  </p>
  {#if showExtended}
    <div class="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_220px]">
      <div class="grid gap-1.5 text-[13px] text-white/70">
        <span class="font-medium">Nombre / Razón social</span>
        <div class="relative">
          <input
            class={fieldInputClass}
            readonly
            type="text"
            value={party.name}
          />
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
            >{@html userIcon}</span
          >
        </div>
      </div>
      <div class="grid gap-1.5 text-[13px] text-white/70">
        <span class="font-medium">Número de documento</span>
        <div class="relative">
          <input
            class={fieldInputClass}
            readonly
            type="text"
            value={party.documentNumber ?? ""}
          />
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
            >{@html documentIcon}</span
          >
        </div>
      </div>
    </div>
    <div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px]">
      <div class="grid gap-1.5 text-[13px] text-white/70">
        <span class="font-medium">Dirección fiscal</span>
        <div class="relative">
          <input
            class={fieldInputClass}
            readonly
            type="text"
            value={party.address ?? ""}
          />
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
            >{@html buildingIcon}</span
          >
        </div>
      </div>
      <div class="grid gap-1.5 text-[13px] text-white/70">
        <span class="font-medium">Email</span>
        <div class="relative">
          <input
            class={fieldInputClass}
            readonly
            type="email"
            value={party.email ?? ""}
          />
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
            >{@html mailIcon}</span
          >
        </div>
      </div>
      <div class="grid gap-1.5 text-[13px] text-white/70">
        <span class="font-medium">Teléfono</span>
        <div class="relative">
          <input
            class={fieldInputClass}
            readonly
            type="tel"
            value={party.phone ?? ""}
          />
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
            >{@html phoneIcon}</span
          >
        </div>
      </div>
    </div>
  {:else}
    <div class="grid gap-3 md:grid-cols-2">
      <div class="md:col-span-2">
        <div class="grid gap-1.5 text-[13px] text-white/70">
          <span class="font-medium">Emisor</span>
          <div class="relative">
            <input
              class={fieldInputClass}
              readonly
              type="text"
              value={party.name}
            />
            <span
              class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
              >{@html buildingIcon}</span
            >
          </div>
        </div>
      </div>
      <div class="grid gap-1.5 text-[13px] text-white/70">
        <span class="font-medium">RUC emisor</span>
        <div class="relative">
          <input
            class={fieldInputClass}
            readonly
            type="text"
            value={party.documentNumber ?? ""}
          />
          <span
            class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-color-3)]"
            >{@html documentIcon}</span
          >
        </div>
      </div>
    </div>
  {/if}
</section>
