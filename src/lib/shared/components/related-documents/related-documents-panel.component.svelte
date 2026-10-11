<script lang="ts">
  import RelatedDocuments from '$lib/shared/components/related-documents/related-documents.component.svelte'
  import { removeRelatedDocumentAction, savedRelatedDocuments } from './related-documents.component'
  import { catalogo61 } from '$lib/constants/catalagos'

  const panelClass = "overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]"
  const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"

  let openRelatedDocuments = $state(false)
</script>

<!-- Botón -->
<button
  class="flex w-full items-center justify-center gap-2 rounded-[1.15rem] border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_35%,transparent)] px-4 py-3 text-[13px] font-medium text-[var(--form-text-soft)] transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)] hover:text-[var(--form-text-color)]"
  onclick={() => (openRelatedDocuments = true)}
>
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M7.5 2v11M2 7.5h11"/>
  </svg>
  Agregar documento relacionado
</button>

<!-- Documentos guardados -->
{#if $savedRelatedDocuments.length > 0}
<div class={panelClass}>
  <div class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3 flex items-center justify-between">
    <p class={sectionLabel}>Documentos Relacionados</p>
    <span class="text-[11px] tabular-nums text-[var(--form-text-soft)]">{$savedRelatedDocuments.length}</span>
  </div>
  <ul class="divide-y divide-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]">
    {#each $savedRelatedDocuments as doc, i}
      {@const typeLabel = catalogo61.find(c => c.value === doc['cbc:DocumentTypeCode']?._text)?.label ?? doc['cbc:DocumentTypeCode']?._text}
      <li class="flex items-start justify-between gap-3 px-5 py-3">
        <div class="min-w-0">
          <p class="text-[11px] font-medium text-[var(--form-text-soft)]">{typeLabel}</p>
          <p class="text-[12px] leading-snug text-[var(--form-text-color)]">{doc['cbc:ID']?._text}</p>
          {#if doc['cbc:DocumentType']?._text}
            <p class="mt-1 text-[11px] text-[var(--form-text-soft)]">{doc['cbc:DocumentType']._text}</p>
          {/if}
        </div>
        <button
          class="mt-0.5 shrink-0 text-[var(--form-text-soft)] transition hover:text-red-400"
          onclick={() => removeRelatedDocumentAction(i)}
          aria-label="Eliminar documento relacionado"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M1 1l10 10M11 1L1 11"/>
          </svg>
        </button>
      </li>
    {/each}
  </ul>
</div>
{/if}

<!-- Modal -->
<RelatedDocuments bind:open={openRelatedDocuments} />
