<script>
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
		<h1>Web component listo para enlazar desde otro proyecto</h1>
		<p>
			Esta vista reutiliza el mismo formulario del bundle final. El artefacto distribuible para tu otro proyecto se genera
			como un solo archivo en dist/sunat-invoice.js.
		</p>
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
		gap: 2rem;
		padding: 2rem;
		align-items: start;
	}

	.demo-copy {
		max-width: 42rem;
		color: #1a2a3e;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: #1d5c94;
	}

	h1 {
		margin: 0;
		font-family: 'Iowan Old Style', 'Palatino Linotype', serif;
		font-size: clamp(2.5rem, 5vw, 4.5rem);
		line-height: 0.95;
	}

	p {
		font-size: 1rem;
		line-height: 1.7;
	}

	.usage-card {
		margin-top: 1.5rem;
		padding: 1rem 1.25rem;
		border: 1px solid rgba(255, 255, 255, 0.5);
		border-radius: 1.5rem;
		background: rgba(255, 255, 255, 0.55);
		backdrop-filter: blur(18px);
		box-shadow: 0 24px 60px -30px rgba(15, 23, 42, 0.35);
	}

	.usage-label {
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	pre {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-family: 'IBM Plex Mono', 'Courier New', monospace;
		font-size: 0.9rem;
		color: #17324f;
	}

	.demo-preview {
		border-radius: 2rem;
	}

	@media (min-width: 960px) {
		.demo-shell {
			grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
			padding: 3rem;
		}
	}
</style>
