<script>
  import CacAccountingCustomerParty from "../components/01/cacAccountingCustomerParty.svelte";
  import CacInvoiceLine from "../components/01/cacInvoiceLine.svelte";
  import CacLegalMonetaryTotal from "../components/01/cacLegalMonetaryTotal.svelte";
  import CacTaxTotal from "../components/01/cacTaxTotal.svelte";
  import CbcCustomizationID from "../components/01/cbcCustomizationID.svelte";
  import CbcDocumentCurrencyCode from "../components/01/cbcDocumentCurrencyCode.svelte";
  import CbcID from "../components/01/cbcID.svelte";
  import CbcInvoiceTypeCode from "../components/01/cbcInvoiceTypeCode.svelte";
  import CbcIssueDate from "../components/01/cbcIssueDate.svelte";
  import CbcNote from "../components/01/cbcNote.svelte";

  let {
    affectationOptions = ["GRAVADA", "EXONERADA", "INAFECTA"],
    customer = $bindable({
      address: "",
      documentNumber: "",
      email: "",
      name: "",
      phone: "",
    }),
    documentMeta = $bindable({
      correlative: "",
      currency: "",
      issueDate: "",
      operationType: "",
      series: "",
      typeLabel: "",
    }),
    invoiceTotals = {
      exoneratedSubtotal: 0,
      expectedSubtotal: 0,
      payable: 0,
      tax: 0,
      taxableSubtotal: 0,
      unaffectedSubtotal: 0,
    },
    itemAmounts = {
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    items = [],
    note = $bindable(""),
    supplier = {
      documentNumber: "",
      name: "",
    },
    title = "Factura SUNAT",
  } = $props();

  let isItemModalOpen = $state(false);
  let itemModalMode = $state("create");
  let itemEditor = $state({
    affectationType: "GRAVADA",
    description: "",
    notes: "",
    quantity: "1",
    unitCode: "NIU",
    unitPrice: "",
  });

  function openItemModal(mode = "create", item = {}) {
    itemModalMode = mode;
    itemEditor = {
      affectationType: affectationOptions[0] ?? "GRAVADA",
      description: "",
      notes: "",
      quantity: "1",
      unitCode: "NIU",
      unitPrice: "",
      ...item,
    };
    isItemModalOpen = true;
  }

  function closeItemModal() {
    itemModalMode = "create";
    itemEditor = {
      affectationType: affectationOptions[0] ?? "GRAVADA",
      description: "",
      notes: "",
      quantity: "1",
      unitCode: "NIU",
      unitPrice: "",
    };
    isItemModalOpen = false;
  }
</script>

<section
  class="relative isolate min-h-full p-3 [font-family:var(--form-font-family)] text-[var(--form-text-color)] md:p-4"
>
  <div class="bg-[var(--form-color-2)]">
    <div class="grid gap-4 px-4 py-4">
      <div
        class="border-b border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] pb-4"
      >
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
        >
          Comprobante
        </p>
        <h4 class="mt-1 text-2xl text-[var(--form-text-color)]">{title}</h4>
        <p class="mt-1 text-sm text-[var(--form-text-soft)]">
          Vista estática del invoice
        </p>
      </div>

      <section class="space-y-3 pt-1">
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
        >
          Documento
        </p>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <CbcInvoiceTypeCode bind:value={documentMeta.typeLabel} />
          <CbcCustomizationID bind:value={documentMeta.operationType} />
          <CbcID
            bind:correlative={documentMeta.correlative}
            bind:series={documentMeta.series}
          />
          <CbcIssueDate bind:value={documentMeta.issueDate} />
          <CbcDocumentCurrencyCode bind:value={documentMeta.currency} />
        </div>
      </section>

      <section
        class="space-y-3 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] pt-5"
      >
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
        >
          Emisor
        </p>
      </section>

      <section
        class="space-y-3 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] pt-5"
      >
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
        >
          Cliente
        </p>
        <CacAccountingCustomerParty bind:party={customer} />
      </section>

      <section
        class="grid gap-3 border-t border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] pt-5 xl:grid-cols-12"
      >
        <CacInvoiceLine
          variant="list"
          {items}
          on:create={() => openItemModal("create")}
          on:edit={(event) => openItemModal("edit", event.detail)}
        ></CacInvoiceLine>
        <div
          class="rounded-[1.15rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] bg-[var(--form-panel-bg)] px-4 py-4 xl:col-span-4"
        >
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)]"
          >
            Notas
          </p>
          <CbcNote bind:note />
          <div
            class="rounded-[1rem] border border-[color:color-mix(in_oklab,var(--form-color-3)_24%,transparent)] bg-[var(--form-panel-bg)] px-4 py-4"
          >
            <CacTaxTotal totals={invoiceTotals} />
            <CacLegalMonetaryTotal totals={invoiceTotals} />
          </div>
        </div>
      </section>

      <CacInvoiceLine
        variant="editor"
        {affectationOptions}
        isOpen={isItemModalOpen}
        isValid={true}
        {itemAmounts}
        {itemEditor}
        mode={itemModalMode}
        on:close={closeItemModal}
      ></CacInvoiceLine>
    </div>

    <div
      class="flex justify-end border-t border-[color:color-mix(in_oklab,var(--form-color-3)_22%,transparent)] px-4 py-3"
    >
      <button
        class="inline-flex rounded-full border border-[var(--form-color-3)] bg-[var(--form-color-3)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        type="button">Emitir factura</button
      >
    </div>
  </div>
</section>
