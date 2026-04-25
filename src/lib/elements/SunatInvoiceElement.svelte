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

	let { title = 'Factura SUNAT' } = $props();
	const shadowCss = `<style>${tailwindCss}</style>`;
</script>

{@html shadowCss}

<div data-title={title}>
	<InvoiceForm {title} />
</div>

<style>
	:host {
		all: initial;
		--white: oklch(100% 0 0);
		--black: oklch(0% 0 0);
		--snow: oklch(0.9911 0 0);
		--eclipse: oklch(0.2103 0.0059 285.89);
		--background: oklch(0.985 0.004 247.86);
		--foreground: var(--eclipse);
		--surface: var(--white);
		--surface-foreground: var(--foreground);
		--overlay: var(--white);
		--overlay-foreground: var(--foreground);
		--muted: oklch(0.5517 0.0138 285.94);
		--scrollbar: oklch(87.1% 0.006 286.286);
		--default: oklch(0.9653 0.0042 247.9);
		--default-foreground: var(--eclipse);
		--accent: oklch(0.4982 0.1088 244.29);
		--accent-foreground: var(--snow);
		--success: oklch(0.7329 0.1935 150.81);
		--success-foreground: var(--eclipse);
		--warning: oklch(0.7819 0.1585 72.33);
		--warning-foreground: var(--eclipse);
		--danger: oklch(0.6532 0.2328 25.74);
		--danger-foreground: var(--snow);
		--segment: var(--white);
		--segment-foreground: var(--eclipse);
		--border: oklch(0.8844 0.0145 252.37);
		--separator: oklch(0.9162 0.0083 255.19);
		--focus: var(--accent);
		--link: var(--foreground);
		--radius: 0.75rem;
		--border-width: 1px;
		--surface-shadow: 0 18px 50px -32px rgba(15, 23, 42, 0.38);
		--overlay-shadow: 0 18px 50px -32px rgba(15, 23, 42, 0.28);
		--field-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
		--field-background: var(--white);
		--field-foreground: var(--foreground);
		--field-placeholder: var(--muted);
		--field-border: var(--border);
		--field-border-width: var(--border-width);
		--field-radius: 0.875rem;
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