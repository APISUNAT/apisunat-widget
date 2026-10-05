<script lang="ts">
  import HeaderDocument from "$lib/shared/components/header/header-document.component.svelte";
  import HeaderOptions from "$lib/shared/components/header/header-options.component.svelte";
  import Supplier from "$lib/shared/components/supplier/supplier.component.svelte";
  import Customer from "$lib/shared/components/customer/customer.component.svelte";
  import DeliveryOptions from "$lib/modules/senders-waybill/components/delivery-options/delivery-options.component.svelte";
  import Addresses from "$lib/modules/senders-waybill/components/addresses/addresses.component.svelte";
  import WaybillItems from "$lib/modules/senders-waybill/components/waybill-items/waybill-items.component.svelte";
  import GrossWeight from "$lib/modules/senders-waybill/components/gross-weight/gross-weight.component.svelte";
  import NotesPanel from "$lib/shared/components/notes/notes-panel.component.svelte";
  import EmitButton from "$lib/shared/components/emit/emit-button.component.svelte";

  let {
    showHeader = true,
    showSupplier = true,
    showCustomer = true,
    showDeliveryOptions = true,
    onEmitClick = undefined as (() => Promise<any>) | undefined,
  } = $props();

  const sectionLabel =
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]";
</script>

<section
  class="relative isolate min-h-full p-3 [font-family:var(--form-font-family)] text-[var(--form-text-color)] md:p-4"
>
  <div class="bg-[var(--form-color-2)]">
    <div class="grid gap-4 px-4 py-4">
      <section class="space-y-3 pt-1" class:hidden={!showHeader}>
        <p class={sectionLabel}>Documento</p>
        <HeaderDocument hidden={!showHeader} />
      </section>

      <section class="space-y-3 pt-1">
        <HeaderOptions />
      </section>

      <!-- Supplier oculto por defecto pero presente en el DOM para mantener datos -->
      <section class="space-y-3 pt-1" class:hidden={!showSupplier}>
        <p class={sectionLabel}>Emisor</p>
        <Supplier hidden={!showSupplier} />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showCustomer}>
        <Customer hidden={!showCustomer} />
      </section>

      <section class="space-y-3 pt-1" class:hidden={!showDeliveryOptions}>
        <p class={sectionLabel}>Opciones de Entrega</p>
        <DeliveryOptions hidden={!showDeliveryOptions} />
      </section>

      <section class="space-y-3 pt-1">
        <p class={sectionLabel}>Punto de Partida y Llegada</p>
        <Addresses />
      </section>

      <section class="space-y-3 pt-1">
        <p class={sectionLabel}>Bienes a Transportar</p>
        <WaybillItems />
      </section>

      <section class="space-y-3 pt-1">
        <p class={sectionLabel}>Peso Bruto Total</p>
        <GrossWeight />
      </section>

      <section class="space-y-3 pt-1">
        <p class={sectionLabel}>Notas / Observaciones</p>
        <NotesPanel />
      </section>

      {#if onEmitClick}
        <section class="pt-1 pb-2 flex justify-end">
          <EmitButton {onEmitClick} />
        </section>
      {/if}
    </div>
  </div>
</section>
