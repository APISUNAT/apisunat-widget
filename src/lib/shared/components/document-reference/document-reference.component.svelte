<script lang="ts">
  import Select from '$lib/shared/ui/select.svelte'
  import Input from '$lib/shared/ui/input.svelte'
  import { setDocumentReference } from '$lib/store/actions/document-reference.actions'
  import { CATALOGO12 } from '$lib/constants/catalagos'
  import { referenceIcon, plusIcon, trashIcon } from '$lib/constants/icons.constants'

  let docType   = $state('')
  let docNumber = $state('')
  let docDesc   = $state('')
  let error     = $state('')

  // Lista local que se va construyendo
  let references = $state<{ type: string; number: string; desc: string }[]>([])

  function add() {
    if (!docType || !docNumber.trim()) {
      error = 'Tipo de documento y serie/número son obligatorios.'
      return
    }
    error = ''

    const entry = { type: docType, number: docNumber.trim(), desc: docDesc.trim() }
    references = [...references, entry]

    // Actualiza el store acumulando
    setDocumentReference({
      id: entry.number,
      documentTypeCode: entry.type,
      documentType: entry.desc || entry.type,
    })

    docType = ''
    docNumber = ''
    docDesc = ''
  }

  function remove(i: number) {
    references = references.filter((_, idx) => idx !== i)
    // Opcional: re-sincronizar el store si necesitas
  }
</script>

<section class="space-y-3">
  <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4 items-end">
    <Select
      label="Tipo de documento"
      bind:value={docType}
      options={CATALOGO12}
      required
    />
    <Input
      label="Serie y número"
      bind:value={docNumber}
      placeholder="Ej: F001-00000123"
      required
    />
    <Input
      label="Descripción"
      bind:value={docDesc}
      placeholder="Ej: Documento sustentatorio"
    />
<button
  class="inline-flex w-fit items-center gap-2 rounded-full border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
  type="button"
  onclick={add}
>
  {@html plusIcon}
  <span>Agregar</span>
</button>
  </div>

  {#if error}
    <p class="text-sm text-red-500">{error}</p>
  {/if}

  <!-- Lista de referencias agregadas -->
  {#if references.length === 0}
    <p class="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
      Sin documentos de referencia
    </p>
  {:else}
    <ul class="space-y-2">
      {#each references as ref, i}
        <li class="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
          <div class="flex gap-4 items-center flex-wrap">
            <span class="badge badge-info">{ref.type}</span>
            <span class="font-medium">{ref.number}</span>
            {#if ref.desc}
              <span class="text-muted-foreground">{ref.desc}</span>
            {/if}
          </div>
          <button class="text-muted-foreground hover:text-destructive" onclick={() => remove(i)}>
            ✕
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</section>