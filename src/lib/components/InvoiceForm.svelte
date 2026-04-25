<script lang="ts">
	type ItemAffectationType = 'GRAVADA' | 'EXONERADA' | 'INAFECTA';

	type InvoiceItem = {
		affectationType: ItemAffectationType;
		description: string;
		id: string;
		notes: string;
		quantity: string;
		unitCode: string;
		unitPrice: string;
	};

	type InvoiceItemEditor = Omit<InvoiceItem, 'id'>;

	let { title = 'Factura SUNAT' } = $props();
	let isItemModalOpen = $state(false);
	let itemModalMode = $state<'create' | 'edit'>('create');
	let editingItemId = $state<string | null>(null);
	let nextItemId = 3;
	let items = $state<InvoiceItem[]>([
		{
			affectationType: 'GRAVADA',
			description: 'Servicio de implementación',
			id: 'item-1',
			notes: 'Implementación inicial del sistema con configuración base y acompañamiento técnico.',
			quantity: '1',
			unitCode: 'NIU',
			unitPrice: '850.00'
		},
		{
			affectationType: 'GRAVADA',
			description: 'Soporte y configuración',
			id: 'item-2',
			notes: 'Ajustes operativos y validaciones finales para la emisión del comprobante.',
			quantity: '1',
			unitCode: 'NIU',
			unitPrice: '430.50'
		}
	]);
	let itemEditor = $state<InvoiceItemEditor>(createItemEditor());
	let itemAmounts = $derived.by(() => getItemAmounts(itemEditor));
	let invoiceTotals = $derived.by(() => calculateInvoiceTotals(items));
	let isItemEditorValid = $derived.by(() => validateItemEditor(itemEditor));

	const affectationOptions: ItemAffectationType[] = ['GRAVADA', 'EXONERADA', 'INAFECTA'];
	const fieldLabelClass = 'font-medium';
	const fieldInputClass =
		'peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3';
	const areaInputClass =
		'peer block min-h-32 w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3';

	function createItemEditor(item?: Partial<InvoiceItemEditor>): InvoiceItemEditor {
		return {
			affectationType: item?.affectationType ?? 'GRAVADA',
			description: item?.description ?? '',
			notes: item?.notes ?? '',
			quantity: item?.quantity ?? '1',
			unitCode: item?.unitCode ?? 'NIU',
			unitPrice: item?.unitPrice ?? ''
		};
	}

	function parsePositiveNumber(value: string): number {
		const numeric = Number(value.replace(',', '.'));

		if (!Number.isFinite(numeric) || numeric < 0) {
			return 0;
		}

		return numeric;
	}

	function roundAmount(value: number): number {
		return Number(value.toFixed(2));
	}

	function getItemAmounts(item: Pick<InvoiceItemEditor, 'affectationType' | 'quantity' | 'unitPrice'>) {
		const quantity = parsePositiveNumber(item.quantity);
		const unitPrice = parsePositiveNumber(item.unitPrice);
		const subtotal = roundAmount(quantity * unitPrice);
		const tax = item.affectationType === 'GRAVADA' ? roundAmount(subtotal * 0.18) : 0;

		return {
			subtotal,
			tax,
			total: roundAmount(subtotal + tax)
		};
	}

	function calculateInvoiceTotals(currentItems: InvoiceItem[]) {
		return currentItems.reduce(
			(accumulator, item) => {
				const amounts = getItemAmounts(item);

				if (item.affectationType === 'GRAVADA') {
					accumulator.taxableSubtotal = roundAmount(accumulator.taxableSubtotal + amounts.subtotal);
				}

				if (item.affectationType === 'EXONERADA') {
					accumulator.exoneratedSubtotal = roundAmount(accumulator.exoneratedSubtotal + amounts.subtotal);
				}

				if (item.affectationType === 'INAFECTA') {
					accumulator.unaffectedSubtotal = roundAmount(accumulator.unaffectedSubtotal + amounts.subtotal);
				}

				accumulator.expectedSubtotal = roundAmount(accumulator.expectedSubtotal + amounts.subtotal);
				accumulator.tax = roundAmount(accumulator.tax + amounts.tax);
				accumulator.payable = roundAmount(accumulator.payable + amounts.total);

				return accumulator;
			},
			{
				exoneratedSubtotal: 0,
				expectedSubtotal: 0,
				payable: 0,
				tax: 0,
				taxableSubtotal: 0,
				unaffectedSubtotal: 0
			}
		);
	}

	function formatDisplayAmount(amount: number): string {
		return new Intl.NumberFormat('es-PE', {
			maximumFractionDigits: 2,
			minimumFractionDigits: 2
		}).format(amount);
	}

	function validateItemEditor(item: InvoiceItemEditor): boolean {
		return item.description.trim().length > 0 && parsePositiveNumber(item.quantity) > 0 && parsePositiveNumber(item.unitPrice) > 0;
	}

	function openCreateItemModal() {
		itemModalMode = 'create';
		editingItemId = null;
		itemEditor = createItemEditor();
		isItemModalOpen = true;
	}

	function openEditItemModal(item: InvoiceItem) {
		itemModalMode = 'edit';
		editingItemId = item.id;
		itemEditor = createItemEditor(item);
		isItemModalOpen = true;
	}

	function closeItemModal() {
		itemModalMode = 'create';
		editingItemId = null;
		itemEditor = createItemEditor();
		isItemModalOpen = false;
	}

	function saveItem() {
		if (!isItemEditorValid) {
			return;
		}

		const nextItem: InvoiceItem = {
			...itemEditor,
			id: editingItemId ?? `item-${nextItemId++}`
		};

		if (editingItemId) {
			items = items.map((item) => (item.id === editingItemId ? nextItem : item));
		} else {
			items = [...items, nextItem];
		}

		closeItemModal();
	}

	function removeItem(itemId: string) {
		items = items.filter((item) => item.id !== itemId);

		if (editingItemId === itemId) {
			closeItemModal();
		}
	}
</script>

<section class="relative isolate min-h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.88),rgba(255,255,255,0)_38%),linear-gradient(180deg,#eef4f8_0%,#e2ebf3_100%)] p-3 text-ink md:p-4">
	<section class="grid gap-3">
		<div class="rounded-[22px] border border-slate-200/80 bg-white/92 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.38)]">
			<div class="grid gap-4 px-4 py-4">
				<div class="border-b border-slate-200/80 pb-4">
					<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Comprobante</p>
					<h4 class="mt-1 font-display text-2xl text-slate-950">{title}</h4>
					<p class="mt-1 text-sm text-slate-500">Vista estática del invoice</p>
				</div>

				<section class="space-y-3 pt-1">
					<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Documento</p>
					<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Tipo de comprobante</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="FACTURA" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M8 2h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M14 2v4h4" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Tipo de operación</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="0101" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M8 2h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M14 2v4h4" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Serie</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="F001" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M8 2h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M14 2v4h4" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Correlativo</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="000128" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M8 2h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M14 2v4h4" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700 xl:col-span-2">
							<span class="font-medium">Fecha de emisión</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="2026-04-23" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M8 2h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M14 2v4h4" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Moneda</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="PEN" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></span>
							</div>
						</div>
					</div>
				</section>

				<section class="space-y-3 border-t border-slate-200/80 pt-5">
					<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Emisor</p>
					<div class="grid gap-3 md:grid-cols-2">
						<div class="grid gap-1.5 text-[13px] text-slate-700 md:col-span-2">
							<span class="font-medium">Emisor</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="Homi S.A.C." />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 9h.01" /><path d="M9 13h.01" /><path d="M15 9h.01" /><path d="M15 13h.01" /><path d="M12 21v-4" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">RUC emisor</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="20601234567" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M8 2h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M14 2v4h4" /></svg></span>
							</div>
						</div>
					</div>
				</section>

				<section class="space-y-3 border-t border-slate-200/80 pt-5">
					<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Cliente</p>
					<div class="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_220px]">
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Nombre / Razón social</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="Comercial Andina E.I.R.L." />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Número de documento</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="20123456789" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M8 2h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M14 2v4h4" /></svg></span>
							</div>
						</div>
					</div>
					<div class="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px]">
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Dirección fiscal</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="text" value="Av. Javier Prado Este 4500, Surco" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 9h.01" /><path d="M9 13h.01" /><path d="M15 9h.01" /><path d="M15 13h.01" /><path d="M12 21v-4" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Email</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="email" value="facturacion@andina.pe" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="m4 6 8 6 8-6" /><rect width="18" height="14" x="3" y="5" rx="2" /></svg></span>
							</div>
						</div>
						<div class="grid gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Teléfono</span>
							<div class="relative">
								<input class="peer block w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" type="tel" value="987654321" />
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.6a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.48-1.29a2 2 0 0 1 2.11-.45c.83.3 1.7.51 2.6.63A2 2 0 0 1 22 16.92Z" /></svg></span>
							</div>
						</div>
					</div>
				</section>

				<section class="grid gap-3 border-t border-slate-200/80 pt-5 xl:grid-cols-12">
					<div class="xl:col-span-8">
						<div class="mb-2 flex items-center justify-between gap-3">
							<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Detalle</p>
							<button class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.5)]" onclick={openCreateItemModal} type="button">
								<svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
								Añadir ítem
							</button>
						</div>
						{#if items.length}
							<ul class="divide-y divide-slate-200/80">
								{#each items as item (item.id)}
									<li class="flex items-start justify-between gap-3 py-3">
										<div class="min-w-0 flex-1">
											<div class="flex flex-wrap items-center gap-2">
												<div class="truncate text-[13px] font-medium text-slate-900">{item.description}</div>
												<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.affectationType}</span>
											</div>
											<div class="mt-1 text-[12px] text-slate-500">{item.quantity} x S/ {formatDisplayAmount(parsePositiveNumber(item.unitPrice))} · {item.unitCode || 'NIU'}</div>
											{#if item.notes.trim()}
												<div class="mt-1 line-clamp-2 text-[12px] text-slate-400">{item.notes}</div>
											{/if}
										</div>
										<div class="flex items-start gap-2">
											<div class="min-w-[94px] pt-0.5 text-right text-[13px] font-semibold tabular-nums text-slate-950">S/ {formatDisplayAmount(getItemAmounts(item).total)}</div>
											<button aria-label="Editar ítem" class="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700" onclick={() => openEditItemModal(item)} type="button">
												<svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>
											</button>
											<button aria-label={`Eliminar ${item.description || 'ítem'}`} class="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-600" onclick={() => removeItem(item.id)} type="button">
												<svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
											</button>
										</div>
									</li>
								{/each}
							</ul>
						{:else}
							<div class="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center text-sm text-slate-500">No hay items en este comprobante. Usa Añadir ítem para registrar la primera línea.</div>
						{/if}

						{#if isItemModalOpen}
							<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
								<button aria-label="Cerrar modal" class="absolute inset-0 bg-[rgba(15,23,42,0.28)] backdrop-blur-[2px]" onclick={closeItemModal} type="button"></button>
								<div aria-labelledby="new-item-modal-title" aria-modal="true" class="relative w-full max-w-4xl overflow-hidden rounded-[1.2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(238,244,248,0.88))] p-2 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]" role="dialog" tabindex="-1">
									<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(29,92,148,0.1),transparent_48%)]"></div>
									<div class="relative rounded-[1.1rem] border border-white/80 bg-white/92 shadow-[0_28px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm">
										<div class="flex items-start justify-between gap-4 border-b border-slate-200/80 px-4 py-4">
											<div class="space-y-1">
												<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Modal</p>
												<h5 class="font-display text-[1.6rem] leading-none text-slate-950" id="new-item-modal-title">{itemModalMode === 'edit' ? 'Editar ítem' : 'Nuevo ítem'}</h5>
												<p class="max-w-xl text-sm leading-6 text-slate-500">Completa los datos de la línea antes de incorporarla al comprobante.</p>
											</div>
											<button aria-label="Cerrar modal" class="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500" onclick={closeItemModal} type="button">
												<svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
											</button>
										</div>

										<div class="space-y-4 px-4 py-4">
											<div class="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-[1rem] border border-slate-200/80 bg-slate-50/80 p-1.5">
												{#each affectationOptions as option}
													<button class={itemEditor.affectationType === option ? 'rounded-[0.85rem] bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.5)]' : 'rounded-[0.85rem] px-3 py-2 text-sm font-medium text-slate-500'} onclick={() => (itemEditor.affectationType = option)} type="button">{option === 'GRAVADA' ? 'Gravada' : option === 'EXONERADA' ? 'Exonerada' : 'Inafecta'}</button>
												{/each}
											</div>

											<div class="grid gap-3 sm:grid-cols-[120px_160px_minmax(0,1fr)]">
												<div class="grid gap-1.5 text-[13px] text-slate-700">
													<span class={fieldLabelClass}>Cantidad</span>
													<div class="relative">
														<input bind:value={itemEditor.quantity} class={fieldInputClass} inputmode="decimal" type="text" />
														<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M4 9h16" /><path d="M4 15h16" /><path d="M10 3 8 21" /><path d="M16 3l-2 18" /></svg></span>
													</div>
												</div>
												<div class="grid gap-1.5 text-[13px] text-slate-700">
													<span class={fieldLabelClass}>Unidad</span>
													<div class="relative">
														<input bind:value={itemEditor.unitCode} class={fieldInputClass} maxlength="4" oninput={() => (itemEditor.unitCode = itemEditor.unitCode.toUpperCase())} type="text" />
														<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="m7 7 10 10" /><path d="M21 11 11 21" /><path d="M3 3l7.5 7.5" /><path d="M18 3h3v3" /><path d="M3 18v3h3" /></svg></span>
													</div>
												</div>
												<div class="grid gap-1.5 text-[13px] text-slate-700">
													<span class={fieldLabelClass}>Precio unitario</span>
													<div class="relative">
														<input bind:value={itemEditor.unitPrice} class={fieldInputClass} inputmode="decimal" type="text" />
														<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></span>
													</div>
												</div>
											</div>

											<div class="grid gap-1.5 text-[13px] text-slate-700">
												<span class={fieldLabelClass}>Descripción</span>
												<div class="relative">
													<input bind:value={itemEditor.description} class={fieldInputClass} type="text" />
													<span class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m7.5 4.21 9 5.19" /><path d="M3.27 6.96 12 12.01l8.73-5.05" /><path d="M12 22.08V12" /></svg></span>
												</div>
											</div>

											<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
												<div class="grid gap-1.5 text-[13px] text-slate-700">
													<span class={fieldLabelClass}>Detalle adicional</span>
													<div class="relative">
														<textarea bind:value={itemEditor.notes} class={areaInputClass} rows="4"></textarea>
														<span class="pointer-events-none absolute inset-y-0 start-0 flex items-start ps-4 pt-3 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg></span>
													</div>
												</div>

												<div class="rounded-[1rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4">
													<div class="mb-3 flex items-center gap-3">
														<div class="h-px flex-1 bg-slate-200/80"></div>
														<p class="text-sm font-semibold text-slate-950">Totales</p>
														<div class="h-px flex-1 bg-slate-200/80"></div>
													</div>

													<div class="space-y-2.5">
														<div class="flex items-center justify-between gap-4">
															<span class="text-sm text-slate-500">Base imponible</span>
															<span class="text-sm font-semibold text-slate-950">S/ {formatDisplayAmount(itemAmounts.subtotal)}</span>
														</div>
														<div class="flex items-center justify-between gap-4">
															<span class="text-sm text-slate-500">IGV</span>
															<span class="text-sm font-semibold text-slate-950">S/ {formatDisplayAmount(itemAmounts.tax)}</span>
														</div>
														<div class="border-t border-slate-200/80 pt-2.5">
															<div class="flex items-center justify-between gap-4">
																<span class="text-base font-semibold text-slate-950">Importe total</span>
																<span class="text-lg font-semibold text-slate-950">S/ {formatDisplayAmount(itemAmounts.total)}</span>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>

										<div class="flex flex-col-reverse gap-3 border-t border-slate-200/80 px-4 py-4 sm:flex-row sm:justify-end">
											<button class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700" onclick={closeItemModal} type="button">Cancelar</button>
											<button class="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_34px_-20px_rgba(29,92,148,0.8)] disabled:cursor-not-allowed disabled:opacity-45" disabled={!isItemEditorValid} onclick={saveItem} type="button">{itemModalMode === 'edit' ? 'Guardar ítem' : 'Agregar ítem'}</button>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<div class="grid gap-3 xl:col-span-4">
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Notas</p>
						<div class="grid w-full gap-1.5 text-[13px] text-slate-700">
							<span class="font-medium">Observación</span>
							<div class="relative">
								<textarea class="peer block min-h-32 w-full rounded-lg border border-transparent bg-[var(--surface)] px-4 py-2.5 ps-11 text-sm text-[var(--foreground)] shadow-[var(--field-shadow)] outline-none transition placeholder:text-[var(--field-placeholder)] focus:border-[var(--focus)] focus:bg-white focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--focus)_18%,transparent)] disabled:pointer-events-none disabled:opacity-50 sm:py-3" rows="5">Operación gravada con IGV. Pago contra entrega.</textarea>
								<span class="pointer-events-none absolute inset-y-0 start-0 flex items-start ps-4 pt-3 text-[var(--field-placeholder)]"><svg class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg></span>
							</div>
						</div>
						<div class="border border-slate-200/80 bg-slate-50/70 px-4 py-4">
							<div class="space-y-2.5">
								<div class="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-2.5">
									<span class="text-sm text-slate-500">Valor gravado</span>
									<span class="text-sm font-semibold text-slate-950">S/ {formatDisplayAmount(invoiceTotals.taxableSubtotal)}</span>
								</div>
								<div class="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-2.5">
									<span class="text-sm text-slate-500">Valor exonerado</span>
									<span class="text-sm font-semibold text-slate-950">S/ {formatDisplayAmount(invoiceTotals.exoneratedSubtotal)}</span>
								</div>
								<div class="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-2.5">
									<span class="text-sm text-slate-500">Valor inafecto</span>
									<span class="text-sm font-semibold text-slate-950">S/ {formatDisplayAmount(invoiceTotals.unaffectedSubtotal)}</span>
								</div>
								<div class="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-2.5">
									<span class="text-sm text-slate-500">IGV</span>
									<span class="text-sm font-semibold text-slate-950">S/ {formatDisplayAmount(invoiceTotals.tax)}</span>
								</div>
								<div class="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-2.5">
									<span class="text-sm text-slate-500">Total esperado</span>
									<span class="text-sm font-semibold text-slate-950">S/ {formatDisplayAmount(invoiceTotals.expectedSubtotal)}</span>
								</div>
								<div class="flex items-start justify-between gap-4 pt-1">
									<span class="text-sm font-semibold text-slate-950">Importe total</span>
									<span class="text-xl font-semibold text-slate-950">S/ {formatDisplayAmount(invoiceTotals.payable)}</span>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
			<div class="flex justify-end border-t border-slate-200/80 px-4 py-3">
				<button class="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white" type="button">Emitir factura</button>
			</div>
		</div>
	</section>
</section>