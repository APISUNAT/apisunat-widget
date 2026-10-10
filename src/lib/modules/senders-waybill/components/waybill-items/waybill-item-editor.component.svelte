<script lang="ts">
  import { packageIcon, quantityIcon, documentIcon } from "$lib/constants/icons.constants";
  import { createEventDispatcher, untrack } from "svelte";
  import { CATALOGO03, catalogo65 } from "$lib/constants/catalagos";
  import { documentStore } from "$lib/store/document.store";
  import Input from "$lib/shared/ui/input.svelte";
  import CustomSelect from "$lib/shared/ui/custom-select.svelte";
  import SelectString from "$lib/shared/ui/select.svelte";
  import Toggle from "$lib/shared/ui/toggle.svelte";
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
  let additionalDataType = $state<string>("");
  let isAdditionalDataOpen = $state(false);
  let previousAdditionalDataType = $state<string>("");

  // Detectar si es importación (08) o exportación (09) para usar catálogo de aduanas
  const handlingCode = $derived($documentStore?.["cac:Shipment"]?.["cbc:HandlingCode"]?._text || "");
  const isImportExport = $derived(handlingCode === "08" || handlingCode === "09");
  const unitCatalog = $derived(isImportExport ? catalogo65 : CATALOGO03);

  const isValid = $derived(
    editorItem.description.trim().length > 0 &&
      parseFloat(editorItem.quantity) > 0
  );

  $effect(() => {
    if (isOpen) {
      const newItem = createEditableWaybillItem(itemEditor ?? {});

      // Establecer unidad por defecto según el tipo de operación
      // Si no tiene unitCode, usar UNI para importación/exportación, NIU para otros
      if (!itemEditor || !itemEditor.unitCode) {
        newItem.unitCode = isImportExport ? "UNI" : "NIU";
      }

      editorItem = newItem;

      // Detectar qué tipo de dato adicional está presente
      if (newItem.partidaArancelaria && newItem.partidaArancelaria.trim()) {
        additionalDataType = "partida";
        previousAdditionalDataType = "partida";
      } else if ((newItem.damSerie && newItem.damSerie.trim()) || (newItem.damNumero && newItem.damNumero.trim())) {
        additionalDataType = "dam";
        previousAdditionalDataType = "dam";
      } else if (newItem.bienNormalizado === "1") {
        additionalDataType = "bienNormalizado";
        previousAdditionalDataType = "bienNormalizado";
      } else {
        additionalDataType = "";
        previousAdditionalDataType = "";
      }
    } else {
      const newItem = createEditableWaybillItem();
      newItem.unitCode = isImportExport ? "UNI" : "NIU";
      editorItem = newItem;
      additionalDataType = "";
      previousAdditionalDataType = "";
    }
  });

  // Limpiar campos cuando cambia el tipo de dato adicional
  $effect(() => {
    const currentType = additionalDataType;

    // Solo limpiar si el tipo realmente cambió (no en la inicialización)
    if (previousAdditionalDataType !== "" && currentType !== previousAdditionalDataType) {
      untrack(() => {
        // Limpiar campos que no corresponden al tipo seleccionado
        if (currentType !== "partida") {
          editorItem.partidaArancelaria = "";
        }
        if (currentType !== "dam") {
          editorItem.damSerie = "";
          editorItem.damNumero = "";
        }
        if (currentType !== "bienNormalizado") {
          editorItem.bienNormalizado = "0";
        }

        previousAdditionalDataType = currentType;
      });
    }
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

            <CustomSelect
              label="Unidad"
              bind:value={editorItem.unitCode}
              options={unitCatalog}
              placeholder="Buscar unidad..."
            />

            <Input
              label="Descripción"
              bind:value={editorItem.description}
              icon={packageIcon}
            />
          </div>

          <!-- Datos Adicionales (DAM/DS) -->
          <div class="border-t border-[color:color-mix(in_oklab,var(--form-color-3)_20%,transparent)] pt-4">
            <button
              type="button"
              onclick={() => (isAdditionalDataOpen = !isAdditionalDataOpen)}
              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]"
            >
              <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]">
                Datos Adicionales
              </span>
              <svg
                class="size-4 shrink-0 transition-transform duration-200"
                class:rotate-180={isAdditionalDataOpen}
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {#if isAdditionalDataOpen}
              <div class="mt-3 px-3">
                <div class="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <SelectString
                    label="Tipo de dato"
                    bind:value={additionalDataType}
                    options={[
                      { value: "", label: "Ninguno" },
                      { value: "partida", label: "Partida arancelaria" },
                      { value: "dam", label: "DAM/DS" },
                      { value: "bienNormalizado", label: "Bien normalizado" }
                    ]}
                  />

                  {#if additionalDataType === "partida"}
                    <Input
                      label="Partida arancelaria"
                      bind:value={editorItem.partidaArancelaria}
                      placeholder="1-10 dígitos"
                      maxLength={10}
                      onlyNumbers={true}
                      icon={documentIcon}
                    />
                  {:else if additionalDataType === "dam"}
                    <div class="grid gap-3 sm:grid-cols-[1fr_2fr]">
                      <Input
                        label="Serie"
                        bind:value={editorItem.damSerie}
                        placeholder="1-4 dígitos"
                        maxLength={4}
                        onlyNumbers={true}
                        icon={documentIcon}
                      />
                      <Input
                        label="Número de DAM/DS"
                        bind:value={editorItem.damNumero}
                        placeholder="999-9999-99-999999"
                        icon={documentIcon}
                      />
                    </div>
                  {:else if additionalDataType === "bienNormalizado"}
                    <div class="flex items-center h-full pt-6">
                      <Toggle
                        label="Indicador de bien normalizado"
                        checked={editorItem.bienNormalizado === '1'}
                        onchange={(e) => {
                          editorItem.bienNormalizado = e.target.checked ? '1' : '0';
                        }}
                      />
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
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
