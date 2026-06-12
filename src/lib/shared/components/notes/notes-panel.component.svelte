<script lang="ts">
  import Note from '$lib/shared/components/notes/notes.component.svelte'
  import { removeNoteActions } from './notes.component'
  import { documentStore } from '$lib/store/document.store'
  import { derived } from 'svelte/store'

  const panelClass = "overflow-hidden rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]"
  const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"

  let openNotes = $state(false)

  const savedNotes = derived(documentStore, ($doc) =>
    ($doc['cbc:Note'] ?? []).filter((n: any) => n._attributes?.languageLocaleID !== '1000')
    )
</script>

<!-- Botón -->
<button
  class="flex w-full items-center justify-center gap-2 rounded-[1.15rem] border border-dashed border-[color:color-mix(in_oklab,var(--form-color-3)_35%,transparent)] px-4 py-3 text-[13px] font-medium text-[var(--form-text-soft)] transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)] hover:text-[var(--form-text-color)]"
  onclick={() => (openNotes = true)}
>
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M7.5 2v11M2 7.5h11"/>
  </svg>
  Agregar nota
</button>

<!-- Notas guardadas -->
{#if $savedNotes.length > 0}
<div class={panelClass}>
  <div class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3 flex items-center justify-between">
    <p class={sectionLabel}>Notas</p>
    <span class="text-[11px] tabular-nums text-[var(--form-text-soft)]">{$savedNotes.length}</span>
  </div>
  <ul class="divide-y divide-[color:color-mix(in_oklab,var(--form-color-3)_10%,transparent)]">
    {#each $savedNotes as note, i}
      <li class="flex items-start justify-between gap-3 px-5 py-3">
        <div class="min-w-0">
          <p class="text-[12px] leading-snug text-[var(--form-text-color)]">{note._text}</p>
        </div>
        <button
          class="mt-0.5 shrink-0 text-[var(--form-text-soft)] transition hover:text-red-400"
          onclick={() => removeNoteActions(i)}
          aria-label="Eliminar nota"
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
<Note bind:open={openNotes} />