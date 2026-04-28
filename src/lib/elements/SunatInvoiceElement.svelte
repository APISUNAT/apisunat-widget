<svelte:options
  customElement={{
    tag: "sunat-invoice",
    shadow: "open",
    props: {
      title: { type: "String", reflect: true },
    },
  }}
/>

<script>
  import InvoiceForm from "../components/InvoiceForm.svelte";
  import tailwindCss from "../styles/web-component.css?inline";

  let { title = "Factura SUNAT" } = $props();
  // Inyecta los estilos dentro del shadow DOM para que el web component lleve sus propios estilos
  // y no dependa de la hoja global de la aplicacion que lo consuma.
  const shadowCss = `<style>${tailwindCss}</style>`;
</script>

{@html shadowCss}

<!-- Este archivo se usa como entrada del build del web component; adapta InvoiceForm al formato custom element para que Vite pueda generar y registrar <sunat-invoice>. -->
<div>
  <InvoiceForm {title} />
</div>

<style>
  :host {
    all: initial;
    display: block;
  }

  :host,
  :host *,
  :host *::before,
  :host *::after {
    box-sizing: border-box;
  }
</style>
