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
  import { setCustomer } from "$lib/store/actions/customer.actions";
  import { documentStore } from "$lib/store/document.store";
  import { getFilteredCatalogo } from "./customer.component";

  let typeDocument   = $state("")
  let numberDocument = $state("")
  let name           = $state("")
  let address        = $state("")
  let email          = $state("")
  let phone          = $state("")

  let isReady              = false
  let previousDocumentType = ""

  const currentDocumentType = $derived(
    $documentStore["cbc:InvoiceTypeCode"]?._text ?? ""
  )

  const filteredCatalogo06 = $derived(
    getFilteredCatalogo(CATALOGO06, currentDocumentType)
  )

  $effect(() => {
    const doc = $documentStore
    if (!doc["cac:AccountingCustomerParty"] || isReady) return

    const party = doc["cac:AccountingCustomerParty"]?.["cac:Party"]
    typeDocument         = party?.["cac:PartyIdentification"]?.["cbc:ID"]?._attributes?.schemeID ?? ""
    numberDocument       = party?.["cac:PartyIdentification"]?.["cbc:ID"]?._text ?? ""
    name                 = party?.["cac:PartyLegalEntity"]?.["cbc:RegistrationName"]?._text ?? ""
    address              = party?.["cac:PartyLegalEntity"]?.["cac:RegistrationAddress"]?.["cac:AddressLine"]?.["cbc:Line"]?._text ?? ""
    email                = party?.["cac:Contact"]?.["cbc:ElectronicMail"]?._text ?? ""
    phone                = party?.["cac:Contact"]?.["cbc:Telephone"]?._text ?? ""
    previousDocumentType = currentDocumentType
    isReady              = true
  })

  $effect(() => {
    const options = filteredCatalogo06
    const td      = typeDocument
    const current = currentDocumentType
    if (!isReady) return
    if (current !== previousDocumentType) {
      previousDocumentType = current
      typeDocument = ""
      return
    }
    if (options.length > 0 && !options.some(opt => opt.value === td)) {
      typeDocument = ""
    }
  })

  $effect(() => {
    const td = typeDocument
    const nd = numberDocument
    const n  = name
    const a  = address
    const e  = email
    const p  = phone
    if (!isReady) return
    setCustomer({ typeDocument: td, numberDocument: nd, name: n, address: a, email: e, phone: p })
  })
</script>

<div class="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_220px_220px]">
  <Input
    label="Nombre / Razón social"
    bind:value={name}
    icon={userIcon}
    required
  />
  <Select
    label="Tipo de documento"
    bind:value={typeDocument}
    options={filteredCatalogo06}
    required
  />
  <Input
    label="Número de documento"
    bind:value={numberDocument}
    icon={documentIcon}
    required
  />
</div>

<div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px]">
  <Input label="Dirección fiscal" bind:value={address} icon={buildingIcon} />
  <Input label="Email" type="email" bind:value={email} icon={mailIcon} />
  <Input label="Teléfono" type="tel" bind:value={phone} icon={phoneIcon} />
</div>