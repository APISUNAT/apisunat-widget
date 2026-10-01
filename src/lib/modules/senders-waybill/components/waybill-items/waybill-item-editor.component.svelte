<script lang="ts">
  import { packageIcon, quantityIcon } from "$lib/constants/icons.constants";
  import { createEventDispatcher } from "svelte";
  import { CATALOGO03 } from "$lib/constants/catalagos";
  import Input from "$lib/shared/ui/input.svelte";
  import SelectString from "$lib/shared/ui/select.svelte";
  import {
    createEditableWaybillItem,
    type WaybillItem,
    type EditableWaybillItem,
  } from "./waybill-items.component";

  let {
    isOpen = false,
    itemEditor = null,
    mode = "create",
  }: { isOpen?: boolean; itemEditor?: WaybillItem | null; mode?: "create" | "edit" } =
    $props();

  const dispatch = createEventDispatcher();

  let editorItem = $state(createEditableWaybillItem());

  const isValid = $derived(
    editorItem.description.trim().length > 0 &&
      parseFloat(editorItem.quantity) > 0
  );

  $effect(() => {
    editorItem = isOpen
      ? createEditableWaybillItem(itemEditor ?? {})
      : createEditableWaybillItem();
  });

  function onSave() {
    const payload: EditableWaybillItem = { ...editorItem };
    dispatch("save", payload);
  }

  function onClose() {
    dispatch("close");
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button
      aria-label="Cerrar modal"
      class="absolute inset-0 bg-[color:color-mix(in_oklab,var(--form-color-1)_74%,transparent)]"
      onclick={onClose}
      type="button"
    ></button>

    <div
      aria-labelledby="new-item-modal-title"
      aria-modal="true"
      class="relative w-full max-w-2xl overflow-hidden rounded-[1.2rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-panel-bg)] p-2"
      role="dialog"
      tabindex="-1"
    >
      <div
        class="relative rounded-[1.1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] bg-[var(--form-color-2)]"
      >
        <!-- Header -->
        <div
          class="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] px-4 py-4"
        >
          <div class="space-y-1">
            <p
              class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
            >
              Bien a Transportar
            </p>
            <h5
              class="[font-family:var(--form-font-family)] text-[1.6rem] leading-none text-[var(--form-text-color)]"
              id="new-item-modal-title"
            >
              {mode === "edit" ? "Editar bien" : "Nuevo bien"}
            </h5>
            <p class="max-w-xl text-sm leading-6 text-[var(--form-text-soft)]">
              Completa los datos del bien a transportar.
            </p>
          </div>
          <button
            aria-label="Cerrar modal"
            class="inline-flex size-9 items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
            onclick={onClose}
            type="button"
          >
            <svg
              class="size-4 shrink-0"
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

        <!-- Body -->
        <div class="space-y-4 px-4 py-6">
          <!-- Fila: Cantidad + Unidad + Descripción -->
          <div class="grid gap-3 sm:grid-cols-[120px_180px_minmax(0,1fr)]">
            <Input
              label="Cantidad"
              bind:value={editorItem.quantity}
              icon={quantityIcon}
              onlyNumbers={true}
              maxDecimals={10}
            />

            <SelectString
              label="Unidad"
              bind:value={editorItem.unitCode}
              options={CATALOGO03}
            />

            <Input
              label="Descripción"
              bind:value={editorItem.description}
              icon={packageIcon}
            />
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex flex-col-reverse gap-3 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] px-4 py-4 sm:flex-row sm:justify-end"
        >
          <button
            class="inline-flex items-center justify-center rounded-full border border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
            onclick={onClose}
            type="button">Cancelar</button
          >
          <button
            class="inline-flex items-center justify-center rounded-full border border-[var(--form-color-3)] bg-[var(--form-color-3)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!isValid}
            onclick={onSave}
            type="button"
          >
            {mode === "edit" ? "Guardar bien" : "Agregar bien"}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
