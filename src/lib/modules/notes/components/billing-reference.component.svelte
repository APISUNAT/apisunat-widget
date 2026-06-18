<script lang="ts">
    import BillingReferenceModal from "./billing-reference-modal.component.svelte";
    import { documentStore } from "$lib/store/document.store";
    import { CATALOGO01 } from "$lib/constants/catalagos";
    import { derived } from "svelte/store";
    import { removeBillingRefActions } from "./billing-reference.component";
    import {
        trashIcon,
        referenceIcon,
    } from "$lib/constants/icons.constants";

    let openModal = $state(false);
    //Buscamos si ya hay un documento referenciado en el store
    const billingRef = derived(
        documentStore,
        ($doc) =>
        $doc["cac:BillingReference"]?.["cac:InvoiceDocumentReference"] ?? null,
    );
    //Retorna el label del tipo de documento a partir del código, usando el catálogo 01
    function resolveDocTypeLabel(code: string): string {
        return CATALOGO01.find((d) => d.value === code)?.label ?? code;
    }
</script>
<!-- Se bloquea el botón si ya hay un documento referenciado -->
<button
    class="flex w-full items-center justify-center gap-2 rounded-[1.15rem] border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_35%,transparent)] px-4 py-3 text-[13px] font-medium text-[var(--form-text-soft)] transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)] hover:text-[var(--form-text-color)] disabled:cursor-not-allowed disabled:opacity-40"
    onclick={() => (openModal = true)}
    disabled={!!$billingRef}
    >
    {@html referenceIcon}
    Agregar documento que modifica
</button>

{#if $billingRef}
<div
    class="overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]"
>
    <div
    class="flex items-center justify-between border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3"
    >
    <p
        class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
    >
        Documento que modifica
    </p>
    </div>

    <div class="flex items-center justify-between gap-4 px-5 py-3.5">
    <!-- Serie / ID -->
    <div class="min-w-0">
        <p class="text-[11px] text-[var(--form-text-soft)]">Serie</p>
        <p
        class="text-[13px] font-semibold tabular-nums text-[var(--form-text-color)]"
        >
        {$billingRef["cbc:ID"]?._text ?? "—"}
        </p>
    </div>

    <!-- Tipo -->
    <div class="min-w-0">
        <p class="text-[11px] text-[var(--form-text-soft)]">Tipo</p>
        <p class="text-[13px] font-medium text-[var(--form-text-color)]">
        {resolveDocTypeLabel($billingRef["cbc:DocumentTypeCode"]?._text)}
        </p>
    </div>

    <!-- Fecha -->
    <div class="min-w-0">
        <p class="text-[11px] text-[var(--form-text-soft)]">Emisión</p>
        <p class="text-[13px] tabular-nums text-[var(--form-text-color)]">
        {$billingRef["cbc:IssueDate"]?._text ?? "—"}
        </p>
    </div>

    <!-- Eliminar -->
    <button
        class="shrink-0 text-[var(--form-text-soft)] transition hover:text-red-400"
        onclick={removeBillingRefActions}
        aria-label="Eliminar referencia"
    >
        {@html trashIcon}
    </button>
    </div>
</div>
{/if}
<BillingReferenceModal bind:open={openModal} />
