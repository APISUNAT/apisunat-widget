<script>
	import '$lib/styles/web-component.css';
	import InvoiceForm from '$lib/components/InvoiceForm.svelte';
</script>

<svelte:head>
	<title>Invoice SUNAT Demo</title>
	<meta
		name="description"
		content="Demo local del web component sunat-invoice para integracion desde otra carpeta."
	/>
</svelte:head>

<section class="demo-shell">
	<div class="demo-copy">
		<p class="eyebrow">Demo local</p>
		<h1>Factura SUNAT</h1>
		<div class="usage-card">
			<p class="usage-label">Etiqueta</p>
			<pre>&lt;sunat-invoice title="Factura SUNAT Homi"&gt;&lt;/sunat-invoice&gt;</pre>
		</div>
	</div>

	<div class="demo-preview">
		<InvoiceForm title="Factura SUNAT Homi" />
	</div>
</section>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
		background:
			radial-gradient(circle at top, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0) 38%),
			linear-gradient(180deg, #eff5fb 0%, #dfeaf5 100%);
	}

	.demo-shell {
		min-height: 100vh;
		display: grid;
		gap: 1rem;
		padding: 1rem;
		align-items: start;
	}

	.demo-copy {
		max-width: 28rem;
		color: #1a2a3e;
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #1d5c94;
	}

	h1 {
		margin: 0;
		font-family: 'Iowan Old Style', 'Palatino Linotype', serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		line-height: 1;
	}

	p {
		font-size: 0.95rem;
		line-height: 1.4;
	}

	.usage-card {
		margin-top: 0.75rem;
		padding: 0.75rem 0.9rem;
		border: 1px solid rgba(255, 255, 255, 0.5);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.55);
		backdrop-filter: blur(18px);
		box-shadow: 0 24px 60px -30px rgba(15, 23, 42, 0.35);
	}

	.usage-label {
		margin-bottom: 0.35rem;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	pre {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-family: 'IBM Plex Mono', 'Courier New', monospace;
		font-size: 0.8rem;
		color: #17324f;
	}

	.demo-preview {
		border-radius: 1rem;
	}

	@media (min-width: 960px) {
		.demo-shell {
			grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
			padding: 1.25rem;
		}
	}
</style>
