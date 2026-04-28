
import type {
	InvoiceDocumentMeta,
	InvoiceItem,
	InvoiceItemEditor,
	InvoiceParty,
	InvoiceTotals,
	ItemAffectationType
} from './types';

export const affectationOptions: ItemAffectationType[] = ['GRAVADA', 'EXONERADA', 'INAFECTA'];

export const defaultDocumentMeta: InvoiceDocumentMeta = {
	correlative: '000128',
	currency: 'PEN',
	issueDate: '2026-04-23',
	operationType: '0101',
	series: 'F001',
	typeLabel: 'FACTURA'
};

export const defaultSupplier: InvoiceParty = {
	documentNumber: '20601234567',
	name: 'Homi S.A.C.'
};

export const defaultCustomer: InvoiceParty = {
	address: 'Av. Javier Prado Este 4500, Surco',
	documentNumber: '20123456789',
	email: 'facturacion@andina.pe',
	name: 'Comercial Andina E.I.R.L.',
	phone: '987654321'
};

export const defaultInvoiceNote = 'Operación gravada con IGV. Pago contra entrega.';

export const initialItems: InvoiceItem[] = [
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
];


export function createItemEditor(item?: Partial<InvoiceItemEditor>): InvoiceItemEditor {
	return {
		affectationType: item?.affectationType ?? 'GRAVADA',
		description: item?.description ?? '',
		notes: item?.notes ?? '',
		quantity: item?.quantity ?? '1',
		unitCode: item?.unitCode ?? 'NIU',
		unitPrice: item?.unitPrice ?? ''
	};
}

export function roundAmount(value: number): number {
	return Number(value.toFixed(2));
}

export function getItemAmounts(item: Pick<InvoiceItemEditor, 'affectationType' | 'quantity' | 'unitPrice'>) {
	const quantity = Math.max(0, Number(item.quantity) || 0);
	const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
	const subtotal = roundAmount(quantity * unitPrice);
	const tax = item.affectationType === 'GRAVADA' ? roundAmount(subtotal * 0.18) : 0;

	return {
		subtotal,
		tax,
		total: roundAmount(subtotal + tax)
	};
}

export function calculateInvoiceTotals(currentItems: InvoiceItem[]): InvoiceTotals {
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

export function validateItemEditor(item: InvoiceItemEditor): boolean {
	const quantity = Math.max(0, Number(item.quantity) || 0);
	const unitPrice = Math.max(0, Number(item.unitPrice) || 0);

	return item.description.trim().length > 0 && quantity > 0 && unitPrice > 0;
}