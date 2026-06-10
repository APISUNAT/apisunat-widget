<script lang="ts">
  import { setNote, removeNote } from '$lib/store/actions/notes.actions'
  import { noteIcon } from '$lib/constants/icons.constants'
  import { CATALOGO52 } from '$lib/constants/catalagos'
  import { documentStore } from '$lib/store/document.store'
  import { derived } from 'svelte/store'

  let { open = $bindable(false) } = $props()

  type Tab = 'predefined' | 'custom'
  let activeTab     = $state<Tab>('predefined')
  let selectedCodes = $state<Set<string>>(new Set())
  let customNote    = $state('')

  const savedNotes = derived(documentStore, ($doc) =>
    ($doc['cbc:Note'] ?? [])
      .map((n: any, i: number) => ({ ...n, _originalIndex: i }))
      .filter((n: any) => n._attributes?.languageLocaleID !== '1000')
  )

  const savedCodes = derived(documentStore, ($doc) =>
    new Set(
      ($doc['cbc:Note'] ?? [])
        .filter((n: any) => n._attributes?.noteCode)
        .map((n: any) => String(n._attributes.noteCode))
    )
  )

  function toggleCode(code: string) {
    if ($savedCodes.has(code)) return
    const next = new Set(selectedCodes)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    selectedCodes = next
  }

  function confirm() {
    if (activeTab === 'predefined' && selectedCodes.size > 0) {
      for (const code of selectedCodes) {
        const found = CATALOGO52.find((n) => n.value === code)
        if (found) setNote({ notecode: found.value, note: found.label })
      }
    } else if (activeTab === 'custom' && customNote.trim()) {
      setNote({ note: customNote.trim() })
    }
    reset()
  }

  function reset() {
    open          = false
    selectedCodes = new Set()
    customNote    = ''
    activeTab     = 'predefined'
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'predefined', label: 'Notas predeterminadas' },
    { id: 'custom',     label: 'Nota personalizada'   },
  ]

  const canConfirm = $derived(
    (activeTab === 'predefined' && selectedCodes.size > 0) ||
    (activeTab === 'custom'     && customNote.trim().length > 0)
  )
</script>

{#if open}
<div
  role="dialog"
  aria-modal="true"
  aria-label="Agregar nota al comprobante"
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
        <span class="text-[var(--form-text-soft)]">{@html noteIcon}</span>
        <span class="text-[15px] font-semibold">Agregar nota</span>
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

    <!-- Notas ya agregadas -->
    {#if $savedNotes.length > 0}
    <div class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] px-5 py-3 space-y-2">
      <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--form-text-soft)]">Notas agregadas</p>
      {#each $savedNotes as note}
        <div class="flex items-start justify-between gap-3 rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-field-bg)] px-3 py-2">
          <span class="text-[12px] leading-snug text-[var(--form-text-color)]">{note._text}</span>
          <button
            class="shrink-0 text-[var(--form-text-soft)] transition hover:text-red-400"
            onclick={() => removeNote(note._originalIndex)}
            aria-label="Eliminar nota"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M1 1l11 11M12 1L1 12"/>
            </svg>
          </button>
        </div>
      {/each}
    </div>
    {/if}

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] px-5 pt-3">
      {#each tabs as t}
        <button
          class="relative pb-2.5 text-[13px] font-medium transition px-1 mr-3
            {activeTab === t.id
              ? 'text-[var(--form-text-color)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-[var(--form-color-accent,#6366f1)]'
              : 'text-[var(--form-text-soft)] hover:text-[var(--form-text-color)]'}"
          onclick={() => (activeTab = t.id)}
        >
          {t.label}
        </button>
      {/each}
    </div>

    <!-- Body -->
    <div class="px-5 py-4">

      {#if activeTab === 'predefined'}
        <p class="mb-3 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--form-text-soft)]">Selecciona una o varias</p>
        <ul class="max-h-64 space-y-2 overflow-y-auto pr-1">
          {#each CATALOGO52.filter(n => n.value !== '1000') as n}
            {@const alreadySaved = $savedCodes.has(n.value)}
            {@const isSelected   = selectedCodes.has(n.value)}
            <li>
              <button
                class="w-full rounded-xl border px-4 py-3 text-left transition
                  {alreadySaved
                    ? 'cursor-not-allowed border-[color:color-mix(in_oklab,var(--form-color-3)_18%,transparent)] bg-[var(--form-field-bg)] opacity-40'
                    : isSelected
                      ? 'border-[var(--form-color-accent,#6366f1)] bg-[color:color-mix(in_oklab,var(--form-color-accent,#6366f1)_8%,transparent)]'
                      : 'border-[color:color-mix(in_oklab,var(--form-color-3)_28%,transparent)] bg-[var(--form-field-bg)] hover:border-[color:color-mix(in_oklab,var(--form-color-3)_45%,transparent)]'}"
                onclick={() => toggleCode(n.value)}
                disabled={alreadySaved}
              >
                <div class="flex items-start gap-2.5">
                  <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border
                    {isSelected
                      ? 'border-[var(--form-color-accent,#6366f1)] bg-[var(--form-color-accent,#6366f1)]'
                      : 'border-[color:color-mix(in_oklab,var(--form-color-3)_40%,transparent)]'}">
                    {#if isSelected}
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 3.5l2.5 2.5L8 1"/>
                      </svg>
                    {/if}
                  </span>
                  <span class="block text-[12px] leading-snug text-[var(--form-text-color)]">{n.label}</span>
                </div>
              </button>
            </li>
          {/each}
        </ul>

      {:else}
        <p class="mb-3 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--form-text-soft)]">Escribe tu nota</p>
        <div class="relative">
          <textarea
            class="block min-h-28 w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm text-[var(--form-text-color)] outline-none focus:border-[color:color-mix(in_oklab,var(--form-color-3)_55%,transparent)]"
            placeholder="Ingresa la observación para el comprobante..."
            bind:value={customNote}
            rows="4"
          ></textarea>
          <span class="pointer-events-none absolute inset-y-0 start-0 flex items-start ps-4 pt-3 text-[var(--form-text-soft)]">
            {@html noteIcon}
          </span>
        </div>
      {/if}
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
        {activeTab === 'predefined' && selectedCodes.size > 1 ? `Agregar ${selectedCodes.size} notas` : 'Agregar nota'}
      </button>
    </div>

  </div>
</div>
{/if}