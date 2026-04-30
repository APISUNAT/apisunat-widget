<script>
  import {
    buildingIcon,
    documentIcon,
    mailIcon,
    phoneIcon,
    userIcon,
  } from "./icons";

  let {
    party = $bindable({
      address: "",
      documentNumber: "",
      email: "",
      name: "",
      phone: "",
    }),
  } = $props();

  const fieldInputClass =
    "block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm font-medium text-[var(--form-text-color)] outline-none sm:py-3";
</script>

<div class="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_220px]">
  <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
    <span class="font-medium">Nombre / Razón social</span>
    <div class="relative">
      <input
        class={fieldInputClass}
        oninput={(event) => (party.name = event.currentTarget.value)}
        type="text"
        value={party.name}
      />
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
        >{@html userIcon}</span
      >
    </div>
  </div>
  <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
    <span class="font-medium">Número de documento</span>
    <div class="relative">
      <input
        class={fieldInputClass}
        oninput={(event) => (party.documentNumber = event.currentTarget.value)}
        type="text"
        value={party.documentNumber}
      />
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
        >{@html documentIcon}</span
      >
    </div>
  </div>
</div>

<div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px]">
  <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
    <span class="font-medium">Dirección fiscal</span>
    <div class="relative">
      <input
        class={fieldInputClass}
        oninput={(event) => (party.address = event.currentTarget.value)}
        type="text"
        value={party.address}
      />
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
        >{@html buildingIcon}</span
      >
    </div>
  </div>
  <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
    <span class="font-medium">Email</span>
    <div class="relative">
      <input
        class={fieldInputClass}
        oninput={(event) => (party.email = event.currentTarget.value)}
        type="email"
        value={party.email}
      />
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
        >{@html mailIcon}</span
      >
    </div>
  </div>
  <div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
    <span class="font-medium">Teléfono</span>
    <div class="relative">
      <input
        class={fieldInputClass}
        oninput={(event) => (party.phone = event.currentTarget.value)}
        type="tel"
        value={party.phone}
      />
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
        >{@html phoneIcon}</span
      >
    </div>
  </div>
</div>
