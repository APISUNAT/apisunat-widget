<svelte:options
	customElement={{
		shadow: 'open',
		props: {
			title: { type: 'String', reflect: true }
		}
	}}
/>

<script>
	import InvoiceForm from '../components/InvoiceForm.svelte';
	import tailwindCss from '../styles/web-component.css?inline';

	let { title = 'Factura electrónica lista para incrustar' } = $props();
	const shadowCss = `<style>${tailwindCss}</style>`;
</script>

{@html shadowCss}

<div data-title={title}>
	<InvoiceForm {title} />
</div>

<style>
	:host {
		all: initial;
		display: block;
		box-sizing: border-box;
		color: #132238;
		color-scheme: light;
		font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-size-adjust: 100%;
	}

	:host,
	:host *,
	:host *::before,
	:host *::after {
		box-sizing: border-box;
	}
</style>