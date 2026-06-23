<script lang="ts">
  let {
    label = '',
    value = $bindable(''),
    type = 'text',
    icon = '',
    placeholder = '',
    showLabel = true,
    disabled = false,
    required = false,
    maxLength = undefined,
    onlyNumbers = false,
    maxDecimals = undefined,
    oninput = undefined,
  }: {
    label?: string;
    value?: string;
    type?: string;
    icon?: string;
    placeholder?: string;
    showLabel?: boolean;
    disabled?: boolean;
    required?: boolean;
    maxLength?: number;
    onlyNumbers?: boolean;
    maxDecimals?: number;
    oninput?: (e: Event) => void;
  } = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    let val = target.value;

    if (onlyNumbers) {
      // Si se permiten decimales (maxDecimals definido), conservamos el
      // punto además de los dígitos. Si no, solo dígitos (comportamiento
      // original, para campos como correlativos o cantidades enteras).
      val = maxDecimals !== undefined
        ? val.replace(/[^\d.]/g, '')
        : val.replace(/\D/g, '');

      // Evita más de un punto decimal (ej. "1.2.3" -> "1.23").
      if (maxDecimals !== undefined) {
        const firstDot = val.indexOf('.');
        if (firstDot !== -1) {
          val = val.slice(0, firstDot + 1) + val.slice(firstDot + 1).replace(/\./g, '');
        }
      }
    }

    if (maxDecimals !== undefined) {
      const parts = val.split('.');
      if (parts.length > 1) {
        val = parts[0] + '.' + parts.slice(1).join('').slice(0, maxDecimals);
      }
    }

    target.value = val;
    value = val;

    oninput?.(event);
  }

  const inputClass =
    'block w-full rounded-xl border border-[color:color-mix(in_oklab,var(--form-color-3)_30%,transparent)] bg-[var(--form-field-bg)] px-4 py-3 ps-11 text-sm font-medium text-[var(--form-text-color)] outline-none';
</script>

<div class="grid gap-1.5 text-[13px] text-[var(--form-text-muted)]">
  {#if showLabel}
    <span class="font-medium">
      {label}
      {#if required}*{/if}
    </span>
  {/if}

  <div class="relative">
    <input
      bind:value
      {type}
      placeholder={placeholder || label}
      {disabled}
      {required}
      maxlength={maxLength}
      inputmode={onlyNumbers ? (maxDecimals !== undefined ? 'decimal' : 'numeric') : (maxDecimals !== undefined ? 'decimal' : undefined)}
      oninput={handleInput}
      class={inputClass}
    />

    {#if icon}
      <span
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--form-text-soft)]"
      >
        {@html icon}
      </span>
    {/if}
  </div>
</div>