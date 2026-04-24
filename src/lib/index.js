import SunatInvoiceElement from './elements/SunatInvoiceElement.svelte';

const tagName = 'sunat-invoice';
const customElementConstructor = SunatInvoiceElement.element;

if (customElementConstructor && !customElements.get(tagName)) {
	customElements.define(tagName, customElementConstructor);
}

export { tagName, SunatInvoiceElement };
