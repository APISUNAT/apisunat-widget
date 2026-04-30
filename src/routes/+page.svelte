<script>
  import "$lib/styles/web-component.css";
  import InvoiceForm from "$lib/templates/01.svelte";
</script>

<svelte:head>
  <title>Factura SUNAT</title>
</svelte:head>

<!-- Esta ruta solo existe para ver y probar el formulario dentro de la app SvelteKit cuando corres el proyecto localmente; no registra ni genera el web component, porque ese build sale desde src/lib/buildeador.svelte. -->
<InvoiceForm title="Factura SUNAT Homi" />
