<script lang="ts">
  import { CATALOGO06 } from "$lib/constants/catalagos";
  import {
    buildingIcon,
    documentIcon,
    mailIcon,
    phoneIcon,
    userIcon,
  } from "$lib/constants/icons.constants";
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentStore } from "$lib/store/document.store";
  import {
    fetchCustomerByDocument,
    setCustomerActions,
  } from "./customer.component";
  import {
    getFilteredCatalogo,
    handleNoDocumentSelection,
    isDocumentComplete,
    isValidRuc,
    maxLengthInput,
  } from "./customer.utils";

  let typeDocument = $state("");
  let numberDocument = $state("");
  let name = $state("");
  let address = $state("");
  let email = $state("");
  let phone = $state("");
  let isLoadingCustomer = $state(false);
  let customerError = $state("");

  let isReady = $state(false);
  let previousDocumentType = "";

  const currentDocumentType = $derived(
    $documentStore["cbc:InvoiceTypeCode"]?._text ?? "",
  );

  const filteredCatalogo06 = $derived(
    getFilteredCatalogo(CATALOGO06, currentDocumentType),
  );
  const documentMaxLength = $derived(maxLengthInput(typeDocument));
  const handleNoDocument = $derived(handleNoDocumentSelection(typeDocument));
  const isDocumentValid = $derived.by(() => {
    if (typeDocument === "6") {
      if (numberDocument.length < 11) return true;
      return isValidRuc(numberDocument);
    }
    return true;
  });

  $effect(() => {
    const doc = $documentStore;
    if (isReady) return;

    // Esperar a que loadDocument haya corrido — el supplier confirma que el store está listo
    if (
      !doc["cac:AccountingCustomerParty"] &&
      !doc["cac:AccountingSupplierParty"]
    )
      return;

    if (!doc["cac:AccountingCustomerParty"]) {
      isReady = true;
      return;
    }

    const party = doc["cac:AccountingCustomerParty"]?.["cac:Party"];
    typeDocument =
      party?.["cac:PartyIdentification"]?.["cbc:ID"]?._attributes?.schemeID ??
      "";
    numberDocument =
      party?.["cac:PartyIdentification"]?.["cbc:ID"]?._text ?? "";
    name =
      party?.["cac:PartyLegalEntity"]?.["cbc:RegistrationName"]?._text ?? "";
    address =
      party?.["cac:PartyLegalEntity"]?.["cac:RegistrationAddress"]?.[
        "cac:AddressLine"
      ]?.["cbc:Line"]?._text ?? "";
    email = party?.["cac:Contact"]?.["cbc:ElectronicMail"]?._text ?? "";
    phone = party?.["cac:Contact"]?.["cbc:Telephone"]?._text ?? "";
    previousDocumentType = currentDocumentType;
    isReady = true;
  });

  $effect(() => {
    const options = filteredCatalogo06;
    const td = typeDocument;
    const current = currentDocumentType;
    if (!isReady) return;
    if (current !== previousDocumentType) {
      previousDocumentType = current;
      typeDocument = "";
      return;
    }
    if (options.length > 0 && !options.some((opt) => opt.value === td)) {
      typeDocument = "";
    }
  });

  $effect(() => {
    const td = typeDocument.trim();
    const nd = numberDocument.trim();
    const n = name.trim();
    const a = address.trim();
    const e = email.trim();
    const p = phone.trim();
    if (!isReady) return;
    if (!td) return;
    setCustomerActions({
      typeDocument: td,
      numberDocument: nd,
      name: n,
      address: a,
      email: e,
      phone: p,
    });
  });

  $effect(() => {
    const td = typeDocument;
    const nd = numberDocument;
    if (!isReady || !isDocumentComplete(td, nd)) {
      customerError = "";
      return;
    }

    isLoadingCustomer = true;
    customerError = "";

    fetchCustomerByDocument(td, nd)
      .then((data: { name: string; address: string } | null) => {
        if (data) {
          name = data.name ?? "";
          address = data.address ?? "";
        } else {
          customerError = "No se encontraron datos para este documento.";
        }
      })
      .finally(() => (isLoadingCustomer = false));
  });
</script>

<div class="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_220px_220px]">
  <Input
    placeholder="Nombre / Razón social"
    showLabel={false}
    bind:value={name}
    icon={userIcon}
  />
  <Select
    placeholder="Tipo de documento"
    showLabel={false}
    bind:value={typeDocument}
    options={filteredCatalogo06}
    required
  />
  <Input
    placeholder="Número de documento"
    showLabel={false}
    bind:value={numberDocument}
    maxLength={documentMaxLength}
    icon={documentIcon}
    disabled={handleNoDocument}
  />
  {#if typeDocument === "6" && numberDocument && !isDocumentValid}
    <span class="text-xs text-red-500">
      El RUC debe comenzar con 10, 15, 17 o 20 y tener 11 dígitos.
    </span>
  {/if}
</div>

<div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px]">
  <Input
    placeholder="Dirección fiscal"
    showLabel={false}
    bind:value={address}
    icon={buildingIcon}
  />
  <Input
    placeholder="Email"
    type="email"
    showLabel={false}
    bind:value={email}
    icon={mailIcon}
  />
  <Input
    placeholder="Teléfono"
    maxLength={9}
    type="tel"
    showLabel={false}
    bind:value={phone}
    icon={phoneIcon}
  />

  {#if customerError}
    <span class="text-xs text-red-500">{customerError}</span>
  {/if}
</div>
