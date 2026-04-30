<svelte:options
  customElement={{
    tag: "sunat-invoice",
    shadow: "none",
    props: {
      title: { type: "String", reflect: true },
    },
  }}
/>

<script>
  import "./styles/web-component.css";
  import InvoiceForm from "./templates/01.svelte";

  let { title = "Factura SUNAT" } = $props();
</script>

<!-- Este archivo se usa como entrada del build del web component; adapta InvoiceForm al formato custom element para que Vite pueda generar y registrar <sunat-invoice>. -->
<div>
  <InvoiceForm {title} />
</div>

<style>
  :host {
    display: block;
  }
</style>
