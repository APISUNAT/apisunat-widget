<script>
  import InvoiceForm from "$lib/components/InvoiceForm.svelte";
  import "$lib/styles/web-component.css";
</script>

<svelte:head>
  <title>Factura SUNAT</title>
</svelte:head>

<!-- Esta ruta solo existe para ver y probar el formulario dentro de la app SvelteKit cuando corres el proyecto localmente; no registra ni genera el web component, porque ese build sale desde src/lib/elements/SunatInvoiceElement.svelte. -->
<InvoiceForm title="Factura SUNAT Homi" />

<style>
  :global(body) {
    margin: 0;
    font-family: "Segoe UI", "Helvetica Neue", sans-serif;
    background: var(--form-color-1);
  }
</style>
