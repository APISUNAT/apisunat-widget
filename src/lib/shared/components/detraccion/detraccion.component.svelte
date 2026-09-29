<script lang="ts">
  import { untrack } from 'svelte'
  import CustomSelect from '$lib/shared/ui/custom-select.svelte'
  import Input from '$lib/shared/ui/input.svelte'
  import { CATALOGO54, catalogo59 } from '$lib/constants/catalagos'
  import { documentStore, documentLoaded } from '$lib/store/document.store'
  import {
    setDetraccionActions,
    calcularMontoPorPorcentaje,
    calcularPorcentajePorMonto,
    getDetraccionFromDocument,
    type DetraccionData
  } from './detraccion.component'

  let { total = 0 }: { total: number } = $props()

  // Estados del formulario
  let tipoBien = $state('')
  let cuenta = $state('')
  let porcentaje = $state('0')
  let monto = $state('0')
  let metodoPago = $state('')
  let isReady = $state(false)

  // Evita que la hidratación se repita en cada cambio del store
  let hasHydrated = false

  // Flags para evitar loops en cálculos
  let updatingFromPorcentaje = false
  let updatingFromMonto = false

  // Moneda del documento: solo se acopla porcentaje↔monto cuando es PEN
  const currency = $derived($documentStore?.['cbc:DocumentCurrencyCode']?._text ?? 'PEN')
  const isPen = $derived(currency === 'PEN')

  // Obtener el bien seleccionado con su porcentaje predefinido
  const bienSeleccionado = $derived(
    CATALOGO54.find(b => b.value === tipoBien)
  )

  // Hidratar desde el documento cuando se carga (SOLO UNA VEZ por documento)
  $effect(() => {
    const loaded = $documentLoaded

    untrack(() => {
      if (!loaded) {
        hasHydrated = false
        return
      }

      if (hasHydrated) return

      const doc = $documentStore
      const detraccionData = getDetraccionFromDocument(doc)

      if (detraccionData) {
        tipoBien = detraccionData.tipoBien ?? ''
        cuenta = detraccionData.cuenta ?? ''
        porcentaje = String(detraccionData.porcentaje ?? 0)
        monto = String(detraccionData.monto ?? 0)
        metodoPago = detraccionData.metodoPago ?? ''
      }

      hasHydrated = true
      isReady = true
    })
  })

  // Auto-completar porcentaje cuando se selecciona un bien con porcentaje predefinido.
  // El monto solo se calcula automáticamente si la moneda es PEN.
  $effect(() => {
    const bien = bienSeleccionado
    const pen = isPen

    untrack(() => {
      if (bien && bien.percent !== null && bien.percent !== undefined) {
        porcentaje = String(bien.percent)

        if (pen && total > 0) {
          const nuevoMonto = calcularMontoPorPorcentaje(bien.percent, total)
          monto = String(nuevoMonto)
        }
      }
    })
  })

  // Calcular monto cuando cambia el porcentaje (solo si la moneda es PEN)
  $effect(() => {
    const p = parseFloat(porcentaje)
    const pen = isPen

    if (!pen) return
    if (updatingFromMonto) return

    untrack(() => {
      if (isReady && !isNaN(p) && p >= 0 && total > 0) {
        updatingFromPorcentaje = true
        const nuevoMonto = calcularMontoPorPorcentaje(p, total)
        monto = String(nuevoMonto)
        updatingFromPorcentaje = false
      }
    })
  })

  // Calcular porcentaje cuando cambia el monto (solo si la moneda es PEN)
  $effect(() => {
    const m = parseFloat(monto)
    const pen = isPen

    if (!pen) return
    if (updatingFromPorcentaje) return

    untrack(() => {
      if (isReady && !isNaN(m) && m >= 0 && total > 0) {
        updatingFromMonto = true
        const nuevoPorcentaje = calcularPorcentajePorMonto(m, total)
        porcentaje = String(nuevoPorcentaje)
        updatingFromMonto = false
      }
    })
  })

  // Sincronizar con el store cuando cambian los valores
  $effect(() => {
    const data: DetraccionData = {
      tipoBien,
      cuenta,
      porcentaje: parseFloat(porcentaje) || 0,
      monto: parseFloat(monto) || 0,
      metodoPago
    }

    if (!isReady) return

    untrack(() => {
      setDetraccionActions(data)
    })
  })
</script>

<div class="rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)]">
  <div class="flex items-center justify-between gap-4 border-b border-[color:color-mix(in_oklab,var(--form-color-3)_16%,transparent)] px-5 py-3 overflow-hidden rounded-t-[1.15rem]">
    <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]">
      Detracción
    </p>
  </div>

  <div class="px-5 py-4 space-y-4 overflow-visible">
    <!-- Tipo de bien/servicio sujeto a detracción -->
    <div>
      <CustomSelect
        label="Bien o servicio"
        showLabel={false}
        bind:value={tipoBien}
        options={CATALOGO54}
        placeholder="Seleccionar bien o servicio"
      />
    </div>

    <!-- Cuenta y montos -->
    <div class="grid gap-3">
      <div>
        <label for="detraccion-cuenta" class="mb-1.5 block text-[11px] text-[var(--form-text-soft)]">
          Cuenta
        </label>
        <div id="detraccion-cuenta">
          <Input
            label="Cuenta"
            showLabel={false}
            bind:value={cuenta}
            placeholder="Número de cuenta"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Porcentaje -->
        <div>
          <label for="detraccion-porcentaje" class="mb-1 block text-[11px] text-[var(--form-text-soft)]">
            Porcentaje
          </label>
          <div class="relative">
            <input
              id="detraccion-porcentaje"
              class="block h-10 w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-3 pr-8 text-sm text-[var(--form-text-color)] outline-none transition focus:border-[var(--form-color-3)]"
              type="text"
              bind:value={porcentaje}
              placeholder="0"
            />
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[11px] font-medium text-[var(--form-text-soft)]">
              %
            </span>
          </div>
        </div>

        <!-- Monto -->
        <div>
          <label for="detraccion-monto" class="mb-1 block text-[11px] text-[var(--form-text-soft)]">
            Monto
          </label>
          <div class="relative">
            <input
              id="detraccion-monto"
              class="block h-10 w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-3 pl-8 text-sm text-[var(--form-text-color)] outline-none transition focus:border-[var(--form-color-3)]"
              type="text"
              bind:value={monto}
              placeholder="0"
            />
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[11px] font-medium text-[var(--form-text-soft)]">
              S/
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Método de pago -->
    <div>
      <CustomSelect
        label="Método de pago"
        showLabel={false}
        bind:value={metodoPago}
        options={catalogo59}
        placeholder="Seleccionar método de pago"
      />
    </div>
  </div>
</div>