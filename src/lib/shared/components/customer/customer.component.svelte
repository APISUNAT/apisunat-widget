<script lang="ts">
  import { CATALOGO06 } from "$lib/constants/catalagos";
  import {
    buildingIcon,
    documentIcon,
    mailIcon,
    phoneIcon,
    userIcon,
    identificationIcon
  } from "$lib/constants/icons.constants";
  import Input from "$lib/shared/ui/input.svelte";
  import Select from "$lib/shared/ui/select.svelte";
  import { documentLoaded, documentStore, documentTypeStore } from "$lib/store/document.store";
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

  let { hidden = false } = $props();

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
  let lastLoadedTimestamp = 0;
  let hydrateToken = 0;

  const isGuiaRemision = $derived($documentTypeStore === "09" || $documentTypeStore === "31");
  const customerLabel = $derived(isGuiaRemision ? "Destinatario" : "Cliente");
  const currentDocumentType = $derived($documentTypeStore ?? "");
  const filteredCatalogo06 = $derived(
    getFilteredCatalogo(CATALOGO06, currentDocumentType),
  );
  const documentMaxLength = $derived(maxLengthInput(typeDocument));
  const handleNoDocument = $derived(handleNoDocumentSelection(typeDocument));
  const isDocumentValid = $derived.by(() => {
    if (typeDocument !== "6" || numberDocument.length < 11) return true;
    return isValidRuc(numberDocument);
  });

  function getDefaultDocumentType(invoiceType: string): string {
    if (invoiceType === "03") return "1";
    if (invoiceType === "01" || invoiceType === "09" || invoiceType === "31") return "6";
    return "";
  }

  function clearCustomerFields() {
    numberDocument = "";
    name = "";
    address = "";
    email = "";
    phone = "";
  }

  function hydrateFromStore(doc: Record<string, any>) {
    const partyKey = isGuiaRemision ? "cac:DeliveryCustomerParty" : "cac:AccountingCustomerParty";
    const party = doc[partyKey]?.["cac:Party"];

    if (!party) {
      typeDocument = getDefaultDocumentType(currentDocumentType);
      numberDocument = "";
      name = "";
      address = "";
      email = "";
      phone = "";
      previousDocumentType = currentDocumentType;
      isReady = true;
      return;
    }

    typeDocument = party["cac:PartyIdentification"]?.["cbc:ID"]?._attributes?.schemeID ?? "";
    numberDocument = party["cac:PartyIdentification"]?.["cbc:ID"]?._text ?? "";
    name = party["cac:PartyLegalEntity"]?.["cbc:RegistrationName"]?._text ?? "";
    address = party["cac:PartyLegalEntity"]?.["cac:RegistrationAddress"]?.["cac:AddressLine"]?.["cbc:Line"]?._text ?? "";
    email = party["cac:Contact"]?.["cbc:ElectronicMail"]?._text ?? "";
    phone = party["cac:Contact"]?.["cbc:Telephone"]?._text ?? "";
    previousDocumentType = currentDocumentType;
    isReady = true;
  }

  // Re-hidratar en cada loadDocument/initDocument/resetDocument.
  // El store es singleton global: sin esto, un remount puede leer estado viejo
  // (p. ej. plantilla vacía tras emitir NC) y nunca actualizar el cliente.
  $effect(() => {
    const loaded = $documentLoaded;
    const doc = $documentStore;

    if (!loaded) return;

    if (loaded.timestamp !== lastLoadedTimestamp) {
      lastLoadedTimestamp = loaded.timestamp;
      isReady = false;
      hydrateToken += 1;
    }

    if (isReady) return;

    hydrateFromStore(doc);
  });

  // Reaccionar al cambio de tipo de comprobante dentro del mismo documento
  $effect(() => {
    const current = currentDocumentType;
    const options = filteredCatalogo06;
    const td = typeDocument;
    if (!isReady) return;
    if (current === previousDocumentType) {
      if (options.length > 0 && !options.some((o) => o.value === td)) {
        typeDocument = "";
      }
      return;
    }

    const previous = previousDocumentType;
    previousDocumentType = current;

    // Primera sincronización del tipo (header escribe InvoiceTypeCode
    // después de hidratar): conservar nombre/documento precargados.
    if (!previous) {
      if (!typeDocument) {
        typeDocument = getDefaultDocumentType(current);
      }
      return;
    }

    typeDocument = getDefaultDocumentType(current);
    clearCustomerFields();
  });

  // Sincronizar con el store
  $effect(() => {
    const td = typeDocument.trim();
    const nd = numberDocument.trim();
    if (!isReady || !td) return;
    setCustomerActions({
      typeDocument: td,
      numberDocument: nd,
      name: name.trim(),
      address: address.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  });

  // Buscar cliente por documento (no pisar datos precargados si la API falla)
  $effect(() => {
    const td = typeDocument;
    const nd = numberDocument;
    const token = hydrateToken;
    customerError = "";
    if (!isReady || !isDocumentComplete(td, nd)) return;

    const hadPrefill = Boolean(name.trim());
    isLoadingCustomer = true;
    fetchCustomerByDocument(td, nd)
      .then((data) => {
        if (token !== hydrateToken) return;
        if (data) {
          name = data.name ?? name;
          address = data.address ?? address;
        } else if (!hadPrefill) {
          customerError = "No se encontraron datos para este documento.";
        }
      })
      .finally(() => {
        if (token === hydrateToken) {
          isLoadingCustomer = false;
        }
      });
  });
</script>

<div class:hidden>
  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--form-text-soft)] mb-3">
    {customerLabel}
  </p>

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
      icon={identificationIcon}
      disabled={handleNoDocument}
    />
    {#if typeDocument === "6" && numberDocument && !isDocumentValid}
      <span class="text-xs text-red-500">
        El RUC debe comenzar con 10, 15, 16, 17 o 20 y tener 11 dígitos.
      </span>
    {/if}
  </div>

  <div class="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px]">
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
</div>
