<script lang="ts">
  import { addRelatedDocumentAction, removeRelatedDocumentAction, savedRelatedDocuments } from './related-documents.component'
  import { catalogo61 } from '$lib/constants/catalagos'
  import { documentIcon } from '$lib/constants/icons.constants'

  let { open = $bindable(false) } = $props()

  // Filtrar solo los documentos permitidos para guías de remisión
  const allowedDocumentCodes = ['09', '49', '50', '52', '80']
  const filteredCatalog = catalogo61.filter(doc => allowedDocumentCodes.includes(doc.value))

  let documentTypeCode = $state('')
  let documentId = $state('')
  let documentType = $state('')

  function confirm() {
    if (documentTypeCode && documentId.trim()) {
      addRelatedDocumentAction({
        documentTypeCode,
        documentId: documentId.trim(),
        documentType: documentType.trim() || undefined
      })
      reset()
    }
  }

  function reset() {
    open = false
    documentTypeCode = ''
    documentId = ''
    documentType = ''
  }

  const canConfirm = $derived(
    documentTypeCode.length > 0 && documentId.trim().length > 0
  )
</script>

{#if open}
<div
  role="dialog"
  aria-modal="true"
  aria-label="Agregar documento relacionado"
  tabindex="-1"
  class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center"
  onkeydown={(e) => e.key === 'Escape' && reset()}
>
  <div
    class="w-full max-w-lg overflow-hidden rounded-t-[1.4rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-color-2)] shadow-xl sm:rounded-[1.4rem]"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    role="presentation"
  >

    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] px-5 py-4">
      <div class="flex items-center gap-2.5 text-[var(--form-text-color)]">
        <span class="text-[var(--form-text-soft)]">{@html documentIcon}</span>
        <span class="text-[15px] font-semibold">Agregar documento relacionado</span>
      </div>
      <button
        class="flex h-7 w-7 items-center justify-center rounded-full text-[var(--form-text-soft)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] hover:text-[var(--form-text-color)]"
        onclick={reset}
        aria-label="Cerrar"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M1 1l12 12M13 1L1 13"/>
        </svg>
      </button>
    </div>

    <!-- Documentos ya agregados -->
    {#if $savedRelatedDocuments.length > 0}
    <div class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] px-5 py-3 space-y-2">
      <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--form-text-soft)]">Documentos agregados</p>
      {#each $savedRelatedDocuments as doc}
        {@const typeLabel = catalogo61.find(c => c.value === doc['cbc:DocumentTypeCode']?._text)?.label ?? doc['cbc:DocumentTypeCode']?._text}
        <div class="flex items-start justify-between gap-3 rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-field-bg)] px-3 py-2">
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium text-[var(--form-text-soft)]">{typeLabel}</p>
            <p class="text-[12px] leading-snug text-[var(--form-text-color)]">{doc['cbc:ID']?._text}</p>
          </div>
          <button
            class="shrink-0 text-[var(--form-text-soft)] transition hover:text-red-400"
            onclick={() => removeRelatedDocumentAction(doc._originalIndex)}
            aria-label="Eliminar documento"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M1 1l11 11M12 1L1 12"/>
            </svg>
          </button>
        </div>
      {/each}
    </div>
    {/if}

    <!-- Body -->
    <div class="px-5 py-4 space-y-4">
      <!-- Tipo de Documento -->
      <div>
        <label for="documentTypeCode" class="mb-2 block text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--form-text-soft)]">
          Tipo de Documento
        </label>
        <div class="relative">
          <select
            id="documentTypeCode"
            class="block w-full appearance-none rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 text-sm text-[var(--form-text-color)] outline-none focus:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)]"
            bind:value={documentTypeCode}
          >
            <option value="">Seleccionar tipo de documento</option>
            {#each filteredCatalog as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          <svg class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--form-text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      <!-- Número y Serie -->
      <div>
        <label for="documentId" class="mb-2 block text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--form-text-soft)]">
          Número y Serie
        </label>
        <div class="relative">
          <input
            id="documentId"
            type="text"
            class="block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm text-[var(--form-text-color)] outline-none focus:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)]"
            placeholder="Ej: 999-9999-10-999999"
            bind:value={documentId}
          />
          <span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]">
            {@html documentIcon}
          </span>
        </div>
      </div>

      <!-- Descripción (Opcional) -->
      <div>
        <label for="documentType" class="mb-2 block text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--form-text-soft)]">
          Descripción <span class="text-[10px] normal-case">(opcional)</span>
        </label>
        <input
          id="documentType"
          type="text"
          class="block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 text-sm text-[var(--form-text-color)] outline-none focus:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)]"
          placeholder="Descripción adicional del documento"
          bind:value={documentType}
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-end gap-2 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] px-5 py-3">
      <button
        class="rounded-xl px-4 py-2 text-[13px] font-medium text-[var(--form-text-soft)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_14%,transparent)] hover:text-[var(--form-text-color)]"
        onclick={reset}
      >
        Cancelar
      </button>
      <button
        class="rounded-xl px-5 py-2 text-[13px] font-semibold transition
          {canConfirm
            ? 'bg-[var(--form-color-accent,#6366f1)] text-white hover:opacity-90'
            : 'cursor-not-allowed bg-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] text-[var(--form-text-soft)]'}"
        disabled={!canConfirm}
        onclick={confirm}
      >
        Agregar documento
      </button>
    </div>

  </div>
</div>
{/if}
