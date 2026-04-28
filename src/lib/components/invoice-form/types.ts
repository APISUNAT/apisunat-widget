export type ItemAffectationType = 'GRAVADA' | 'EXONERADA' | 'INAFECTA';

export type InvoiceItem = {
	affectationType: ItemAffectationType;
	description: string;
	id: string;
	notes: string;
	quantity: string;
	unitCode: string;
	unitPrice: string;
};

export type InvoiceItemEditor = Omit<InvoiceItem, 'id'>;

export type InvoiceTotals = {
	exoneratedSubtotal: number;
	expectedSubtotal: number;
	payable: number;
	tax: number;
	taxableSubtotal: number;
	unaffectedSubtotal: number;
};

export type InvoiceParty = {
	address?: string;
	documentNumber?: string;
	email?: string;
	name: string;
	phone?: string;
};

export type InvoiceDocumentMeta = {
	correlative: string;
	currency: string;
	issueDate: string;
	operationType: string;
	series: string;
	typeLabel: string;
};