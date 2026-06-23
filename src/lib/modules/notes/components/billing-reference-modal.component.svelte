<script lang="ts">
    import Input from "$lib/shared/ui/input.svelte";
    import DateInput from "$lib/shared/ui/date-picker-select.svelte";
    import {
        EMPTY_FORM,
        type BillingReferenceForm,
        addBillingReferenceActions,
        isFormValid,
    } from "./billing-reference.component";
    import {
        isSerieCompatible,
        getExpectedSeriePrefix,
    } from "./billing-reference-validations.component";
    import { documentIcon } from "$lib/constants/icons.constants";

    let { open = $bindable(false) } = $props();

    let form = $state<BillingReferenceForm>({ ...EMPTY_FORM });

    const expectedPrefix = getExpectedSeriePrefix();
    const serieCompatible = $derived(
        form.serie.trim().length === 0 || isSerieCompatible(form.serie),
    );
    const canConfirm = $derived(isFormValid(form) && serieCompatible);

    function handleConfirm() {
        addBillingReferenceActions(form);
        handleClose();
    }

    function handleClose() {
        open = false;
        form = { ...EMPTY_FORM };
    }
</script>

{#if open}
    <div
        role="dialog"
        aria-modal="true"
        aria-label="Documento que modifica"
        tabindex="-1"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center"
        onkeydown={(e) => e.key === "Escape" && handleClose()}
        onclick={handleClose}
    >
        <div
        class="w-full max-w-lg overflow-hidden rounded-t-[1.4rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-color-2)] shadow-xl sm:rounded-[1.4rem]"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="presentation"
        >
        <!-- Header -->
        <div
            class="flex items-center justify-between border-b border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] px-5 py-4"
        >
            <div class="flex items-center gap-2.5 text-[var(--form-text-color)]">
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <rect x="2" y="1" width="10" height="13" rx="1.5" />
                <path d="M5 5h4M5 8h4M5 11h2" />
            </svg>
            <span class="text-[15px] font-semibold">Documento que modifica</span>
            </div>
            <button
            class="flex h-7 w-7 items-center justify-center rounded-full text-[var(--form-text-soft)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] hover:text-[var(--form-text-color)]"
            onclick={handleClose}
            aria-label="Cerrar"
            >
            <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            >
                <path d="M1 1l12 12M13 1L1 13" />
            </svg>
            </button>
        </div>

        <!-- Body -->
        <div class="space-y-4 px-5 py-5">
            {#if form.serie.trim().length > 0 && !serieCompatible}
            <p class="text-[12px] text-red-400">
                El documento que modifica debe ser {expectedPrefix === "F"
                ? "una Factura (F)"
                : "una Boleta (B)"}
            </p>
            {/if}

            <div class="grid grid-cols-2 gap-3">
            <Input
                label="Serie"
                placeholder="F001"
                bind:value={form.serie}
                maxLength={4}
                icon={documentIcon}
                showLabel={true}
            />
            <Input
                label="Correlativo"
                placeholder="00000001"
                bind:value={form.correlativo}
                maxLength={8}
                onlyNumbers={true}
                icon={documentIcon}
                showLabel={true}
            />
            </div>

            <DateInput
            label="Fecha de emisión (Opcional)"
            bind:value={form.issueDate}
            showLabel={true}
            pastOnly={true}
            />
        </div>

        <!-- Footer -->
        <div
            class="flex items-center justify-end gap-2 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] px-5 py-3"
        >
            <button
            class="rounded-xl px-4 py-2 text-[13px] font-medium text-[var(--form-text-soft)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_14%,transparent)] hover:text-[var(--form-text-color)]"
            onclick={handleClose}
            >
            Cancelar
            </button>
            <button
            class="rounded-xl px-5 py-2 text-[13px] font-semibold transition
            {canConfirm
                ? 'bg-[var(--form-color-accent,#6366f1)] text-white hover:opacity-90'
                : 'cursor-not-allowed bg-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] text-[var(--form-text-soft)]'}"
            disabled={!canConfirm}
            onclick={handleConfirm}
            >
            Agregar referencia
            </button>
        </div>
        </div>
    </div>
{/if}
