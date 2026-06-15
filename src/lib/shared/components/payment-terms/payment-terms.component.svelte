<script lang="ts">
  import {
    setPaymentContadoActions,
    setPaymentCreditoActions,
    validateCuotas,
  } from "$lib/shared/components/payment-terms/payment-terms.component";
  import type { Cuota } from "$lib/shared/components/payment-terms/payment-terms.component";
  import { documentStore } from "$lib/store/document.store";
  import DatePicker from "$lib/shared/ui/date-credit.svelte";

  let { total = 0 }: { total: number } = $props();

  type MetodoPago = "Contado" | "Credito";

  let metodo = $state<MetodoPago>("Contado");
  let cuotas = $state<Cuota[]>([{ id: 1, monto: "", vencimiento: "" }]);
  let nextId = $state(2);

  const emisionDate = $derived($documentStore["cbc:IssueDate"]?._text ?? "");

  const errors = $derived(
    metodo === "Credito" ? validateCuotas(cuotas, total, emisionDate) : {},
  );

  const sumaCuotas = $derived(
    cuotas.reduce((s, c) => s + (parseFloat(c.monto) || 0), 0),
  );

  const montoExcede = $derived(sumaCuotas > total + 0.01);
  const montoNoCubre = $derived(
    Math.abs(sumaCuotas - total) > 0.01 && !montoExcede,
  );

  function setMetodo(m: MetodoPago) {
    metodo = m;
    if (m === "Contado") {
      setPaymentContadoActions();
    } else {
      syncCuotas();
    }
  }

  function syncCuotas() {
    setPaymentCreditoActions(
      total,
      cuotas.map((c) => ({ ...c })),
    );
  }

  function addCuota() {
    cuotas = [...cuotas, { id: nextId++, monto: "", vencimiento: "" }];
    syncCuotas();
  }

  function removeCuota(id: number) {
    if (cuotas.length > 1) {
      cuotas = cuotas.filter((c) => c.id !== id);
      syncCuotas();
    }
  }

  function updateCuota(
    id: number,
    field: keyof Omit<Cuota, "id">,
    value: string,
  ) {
    cuotas = cuotas.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    syncCuotas();
  }

  const inputClass =
    "block h-10 w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-3 text-sm text-[var(--form-text-color)] outline-none transition focus:border-[var(--form-color-3)]";

  const inputErrorClass =
    "block h-10 w-full rounded-xl border border-red-400/60 bg-[var(--form-field-bg)] px-3 text-sm text-[var(--form-text-color)] outline-none transition focus:border-red-500";
</script>

<div
  class="overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]"
>
  <div
    class="flex items-center justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3"
  >
    <p
      class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
    >
      Método de pago
    </p>
    <div
      class="flex items-center gap-1 rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-[var(--form-field-bg)] p-1"
    >
      {#each ["Contado", "Credito"] as MetodoPago[] as m}
        <button
          class="rounded-full px-3 py-1 text-[12px] font-medium transition {metodo ===
          m
            ? 'bg-[var(--form-color-3)] text-white shadow-sm'
            : 'text-[var(--form-text-soft)] hover:text-[var(--form-text-color)]'}"
          onclick={() => setMetodo(m)}
          type="button">{m}</button
        >
      {/each}
    </div>
  </div>

  {#if metodo === "Contado"}
    <div class="flex items-center gap-3 px-5 py-4">
      <div
        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--form-color-3)_12%,transparent)] text-[var(--form-text-soft)]"
      >
        <svg
          class="size-4"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2.5" />
        </svg>
      </div>
      <p class="text-sm text-[var(--form-text-soft)]">
        Pago al contado — monto total al momento de la entrega.
      </p>
    </div>
  {:else}
    <div class="px-5 py-4 space-y-3">
      {#each cuotas as cuota, i (cuota.id)}
        {@const err = errors[cuota.id]}
        <div class="grid grid-cols-[1fr_1fr_28px] items-start gap-2">
          <div>
            <div class="mb-1 flex items-center gap-1.5">
              <span
                class="flex size-4 items-center justify-center rounded-full bg-[color:color-mix(in_oklab,var(--form-color-3)_14%,transparent)] text-[10px] font-semibold tabular-nums text-[var(--form-text-soft)]"
                >{i + 1}</span
              >
              <span class="text-[11px] text-[var(--form-text-soft)]">Monto</span
              >
            </div>
            <div class="relative">
              <input
                class="{err?.monto
                  ? inputErrorClass
                  : inputClass} ps-7 tabular-nums"
                inputmode="decimal"
                placeholder="0.00"
                type="text"
                value={cuota.monto}
                oninput={(e) =>
                  updateCuota(
                    cuota.id,
                    "monto",
                    (e.currentTarget as HTMLInputElement).value,
                  )}
              />
              <span
                class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2.5 text-[11px] font-medium text-[var(--form-text-soft)]"
                >S/</span
              >
            </div>
          </div>

          <!-- Vencimiento -->
          <div>
            <div class="mb-1 text-[11px] text-[var(--form-text-soft)]">
              Vencimiento
            </div>
            <DatePicker
              bind:value={cuotas[i].vencimiento}
              showLabel={false}
              onchange={() => {
                cuotas = [...cuotas];
                syncCuotas();
              }}
            />
            {#if err?.vencimiento}
              <p class="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                <svg
                  class="size-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" /><line
                    x1="12"
                    x2="12"
                    y1="8"
                    y2="12"
                  /><line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                {err.vencimiento}
              </p>
            {/if}
          </div>

          <button
            aria-label="Eliminar cuota"
            class="mt-6 inline-flex size-7 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-transparent text-[var(--form-text-soft)] transition hover:border-red-400/40 hover:text-red-500 disabled:pointer-events-none disabled:opacity-25"
            disabled={cuotas.length === 1}
            onclick={() => removeCuota(cuota.id)}
            type="button"
          >
            <svg
              class="size-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      {/each}

      <button
        class="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] px-3 py-1.5 text-[12px] text-[var(--form-text-soft)] transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_50%,transparent)] hover:text-[var(--form-text-color)]"
        onclick={addCuota}
        type="button"
      >
        <svg
          class="size-3 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14" /><path d="M5 12h14" />
        </svg>
        Agregar cuota
      </button>

      {#if montoExcede}
        <div
          class="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-50/60 px-3 py-2 text-[12px] text-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          <svg
            class="size-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" /><line
              x1="12"
              x2="12"
              y1="8"
              y2="12"
            /><line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          La suma de cuotas (S/ {sumaCuotas.toFixed(2)}) excede el total (S/ {total.toFixed(
            2,
          )}).
        </div>
      {:else if montoNoCubre}
        <div
          class="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-50/60 px-3 py-2 text-[12px] text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
        >
          <svg
            class="size-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            /><line x1="12" x2="12" y1="9" y2="13" /><line
              x1="12"
              x2="12.01"
              y1="17"
              y2="17"
            />
          </svg>
          La suma de cuotas (S/ {sumaCuotas.toFixed(2)}) no coincide con el
          total (S/ {total.toFixed(2)}).
        </div>
      {/if}
    </div>
  {/if}
</div>