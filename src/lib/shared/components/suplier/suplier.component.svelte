<script lang="ts">
    import Input from '$lib/shared/ui/input.svelte'
    import { buildingIcon, documentIcon, locationIcon } from '$lib/constants/icons.constants'
    import { documentStore } from '$lib/store/document.store'

    let name    = $derived($documentStore['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyLegalEntity']?.['cbc:RegistrationName']?._text ?? '')
    let ruc     = $derived($documentStore['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID']?._text ?? '')
    let address = $derived($documentStore['cac:AccountingSupplierParty']?.['cac:Party']?.['cac:PartyLegalEntity']?.['cac:RegistrationAddress']?.['cac:AddressLine']?.['cbc:Line']?._text ?? '')
</script>

<div class="grid gap-3 md:grid-cols-[2fr_280px_3fr]">
    <Input label="Emisor"     value={name}    icon={buildingIcon} disabled />
    <Input label="RUC emisor" value={ruc}     icon={documentIcon} disabled />
    <Input label="Dirección"  value={address} icon={locationIcon} disabled />
</div>