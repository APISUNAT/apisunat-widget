<script lang="ts">
	import '@heroui/styles/css';
	import { buttonVariants } from '@heroui/styles';
	import HeroUIDatePickerHost from './HeroUIDatePickerHost.svelte';

	let { title = 'Factura electrónica lista para incrustar' } = $props();

	type InvoiceFormModel = {
		fechaEmision: string;
		emisor: string;
		rucEmisor: string;
		receptor: string;
		documentoReceptor: string;
		serie: string;
		correlativo: string;
		moneda: string;
		total: string;
	};

	type InvoiceFieldKey = keyof InvoiceFormModel;

	const initialForm: InvoiceFormModel = {
		fechaEmision: '2026-04-23',
		emisor: 'Homi S.A.C.',
		rucEmisor: '20601234567',
		receptor: 'Comercial Andina E.I.R.L.',
		documentoReceptor: '20123456789',
		serie: 'F001',
		correlativo: '000128',
		moneda: 'PEN',
		total: '1280.50'
	};

	let form = $state({ ...initialForm });
	const fields: Array<{ key: InvoiceFieldKey; label: string; placeholder: string }> = [
		{ key: 'emisor', label: 'Emisor', placeholder: 'Razón social del emisor' },
		{ key: 'rucEmisor', label: 'RUC emisor', placeholder: '11 dígitos' },
		{ key: 'receptor', label: 'Receptor', placeholder: 'Cliente o razón social' },
		{ key: 'documentoReceptor', label: 'Documento receptor', placeholder: 'DNI o RUC' },
		{ key: 'serie', label: 'Serie', placeholder: 'F001' },
		{ key: 'correlativo', label: 'Correlativo', placeholder: '000001' }
	];

	const summary = $derived([
		{ label: 'Moneda', value: form.moneda },
		{ label: 'Total', value: `S/ ${Number(form.total || 0).toFixed(2)}` }
	]);

	const submitButtonClass = buttonVariants({
		variant: 'primary',
		size: 'md'
	});

	function updateField(key: InvoiceFieldKey, value: string) {
		form[key] = value;
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
	}

	function handleTextInput(key: InvoiceFieldKey, event: Event) {
		updateField(key, (event.currentTarget as HTMLInputElement).value);
	}

	function handleSelectChange(key: InvoiceFieldKey, event: Event) {
		updateField(key, (event.currentTarget as HTMLSelectElement).value);
	}
</script>

<section class="invoice-shell text-ink">
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="absolute -left-20 top-8 h-48 w-48 rounded-full bg-accent/20 blur-3xl"></div>
		<div class="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/70 blur-3xl"></div>
		<div class="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-accentsoft/70 blur-3xl"></div>
	</div>

	<div class="relative overflow-hidden rounded-[28px] border border-white/45 bg-white/20 p-6 shadow-glass ring-1 ring-white/35 backdrop-blur-2xl md:p-8">
		<div class="mb-8 flex flex-col gap-5 border-b border-white/35 pb-6 md:flex-row md:items-end md:justify-between">
			<div class="max-w-xl">
				<p class="mb-3 inline-flex rounded-full border border-white/45 bg-white/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
					Invoice
				</p>
				<h1 class="font-display text-3xl leading-tight text-slate-900 md:text-5xl">{title}</h1>

			</div>

			<div class="grid gap-3 rounded-[24px] border border-white/50 bg-slate-950/70 px-5 py-4 text-white shadow-innerline">
				{#each summary as item}
					<div class="flex items-center justify-between gap-6 text-sm">
						<span class="text-white/65">{item.label}</span>
						<span class="font-mono text-base tracking-wide">{item.value}</span>
					</div>
				{/each}
			</div>
		</div>

		<form class="grid gap-5" onsubmit={handleSubmit}>
			<div class="grid gap-4 md:grid-cols-2">
				<label class="grid gap-2 text-sm text-slate-700 md:col-span-2">
					<span class="font-medium">Fecha de emision</span>
					<div class="hero-date-picker-shell">
						<HeroUIDatePickerHost
							value={form.fechaEmision}
							onChange={(nextValue: string) => updateField('fechaEmision', nextValue)}
						/>
					</div>
				</label>

				{#each fields as field}
					<label class="grid gap-2 text-sm text-slate-700">
						<span class="font-medium">{field.label}</span>
						<input
							class="min-h-12 rounded-2xl border border-white/55 bg-white/60 px-4 py-3 font-body text-[15px] text-slate-900 outline-none transition duration-300 placeholder:text-slate-500/75 focus:border-accent/70 focus:bg-white focus:ring-4 focus:ring-accent/15"
							placeholder={field.placeholder}
							value={form[field.key]}
							oninput={(event) => handleTextInput(field.key, event)}
						/>
					</label>
				{/each}
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<label class="grid gap-2 text-sm text-slate-700">
					<span class="font-medium">Moneda</span>
					<select
						class="min-h-12 rounded-2xl border border-white/55 bg-white/60 px-4 py-3 text-[15px] text-slate-900 outline-none transition duration-300 focus:border-accent/70 focus:bg-white focus:ring-4 focus:ring-accent/15"
						value={form.moneda}
						onchange={(event) => handleSelectChange('moneda', event)}
					>
						<option value="PEN">PEN</option>
						<option value="USD">USD</option>
					</select>
				</label>

				<label class="grid gap-2 text-sm text-slate-700">
					<span class="font-medium">Total</span>
					<input
						class="min-h-12 rounded-2xl border border-white/55 bg-white/60 px-4 py-3 font-mono text-[15px] text-slate-900 outline-none transition duration-300 placeholder:text-slate-500/75 focus:border-accent/70 focus:bg-white focus:ring-4 focus:ring-accent/15"
						inputmode="decimal"
						placeholder="0.00"
						value={form.total}
						oninput={(event) => handleTextInput('total', event)}
					/>
				</label>
			</div>

			<div class="mt-2 flex justify-end border-t border-white/35 pt-5">
				<button
					type="submit"
					class={`${submitButtonClass} invoice-submit-button group`}
				>
					<span>Emitir factura</span>
					<span class="ml-3 transition duration-300 group-hover:translate-x-1">-></span>
				</button>
			</div>
		</form>
	</div>
</section>

<style>

	.invoice-shell {
		position: relative;
		isolation: isolate;
		min-height: 100%;
		padding: 1.5rem;
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0) 42%),
			linear-gradient(135deg, #e9f4fb 0%, #dbe9f7 48%, #eef3f8 100%);
		}

	@media (min-width: 768px) {
		.invoice-shell {
			padding: 2rem;
		}
	}

	:global(.invoice-submit-button) {
		border-radius: 9999px;
		padding-inline: 1.5rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	:global(.hero-date-picker-shell [data-slot='base']) {
		width: 100%;
	}

	:global(.hero-date-picker-shell [data-slot='group']) {
		min-height: 3rem;
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.55);
		background: rgba(255, 255, 255, 0.6);
		padding-inline: 0.75rem;
		box-shadow: none;
	}

	:global(.hero-date-picker-shell [data-slot='group']:focus-within) {
		border-color: rgba(29, 92, 148, 0.7);
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 0 0 4px rgba(29, 92, 148, 0.15);
	}

	:global(.hero-date-picker-shell [data-slot='input']) {
		color: #0f172a;
		font-size: 15px;
	}

	:global(.hero-date-picker-shell [data-slot='label']) {
		display: none;
	}
</style>