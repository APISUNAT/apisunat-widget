<script lang="ts">
  let {
    label = '',
    value = $bindable(),
    options = [],
    placeholder = 'Seleccione una opción',
    showLabel = true,
    disabled = false,
    required = false,
  } = $props();

  let isOpen = $state(false)
  let searchQuery = $state('')

  const selectedOption = $derived(
    options.find(opt => opt.value === value)
  )

  const filteredOptions = $derived(
    searchQuery.trim() === ''
      ? options
      : options.filter(opt =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
  )

  function toggleDropdown() {
    if (disabled) return
    isOpen = !isOpen
    console.log('Dropdown toggled:', isOpen)
    if (!isOpen) searchQuery = ''
  }

  function selectOption(optionValue: string) {
    value = optionValue
    isOpen = false
    searchQuery = ''
  }

  let wrapperElement: HTMLElement

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (wrapperElement && !wrapperElement.contains(target)) {
      console.log('Click outside detected, closing dropdown')
      isOpen = false
      searchQuery = ''
    }
  }

  $effect(() => {
    if (isOpen) {
      // Delay para evitar que el mismo click que abre el dropdown también lo cierre
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  })
</script>

<div bind:this={wrapperElement} class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)] custom-select-wrapper">
  {#if showLabel}
    <span class="font-medium">
      {label}
      {#if required}*{/if}
    </span>
  {/if}

  <div class="relative">
    <!-- Botón principal del select -->
    <button
      type="button"
      class="flex h-10 w-full items-center justify-between rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 text-sm font-medium text-[var(--form-text-color)] outline-none transition hover:border-[color:color-mix(in_oklab,var(--form-color-3)_45%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
      class:border-[var(--form-color-3)]={isOpen}
      onclick={(e) => {
        e.stopPropagation()
        toggleDropdown()
      }}
      {disabled}
    >
      <span class:text-[var(--form-text-soft)]={!selectedOption}>
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <svg
        class="size-4 shrink-0 transition-transform text-[var(--form-text-soft)]"
        class:rotate-180={isOpen}
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

    <!-- Dropdown de opciones -->
    {#if isOpen}
      <div class="absolute z-[9999] mt-1 w-full overflow-hidden rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] shadow-lg">
        <!-- Campo de búsqueda -->
        <div class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] p-2">
          <input
            type="text"
            class="block h-8 w-full rounded-lg border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-color-2)] px-3 text-sm text-[var(--form-text-color)] outline-none placeholder:text-[var(--form-text-soft)] focus:border-[var(--form-color-3)]"
            placeholder="Buscar..."
            bind:value={searchQuery}
            onclick={(e) => e.stopPropagation()}
          />
        </div>

        <!-- Lista de opciones -->
        <div class="max-h-60 overflow-y-auto">
          {#if filteredOptions.length === 0}
            <div class="px-4 py-3 text-sm text-[var(--form-text-soft)]">
              Sin resultados
            </div>
          {:else}
            {#each filteredOptions as option}
              <button
                type="button"
                class="flex w-full items-center px-4 py-2.5 text-left text-sm text-[var(--form-text-color)] transition hover:bg-[color:color-mix(in_oklab,var(--form-color-3)_8%,transparent)]"
                class:bg-[color:color-mix(in_oklab,var(--form-color-3)_12%,transparent)]={value === option.value}
                class:font-medium={value === option.value}
                onclick={() => selectOption(option.value)}
              >
                {option.label}
              </button>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
