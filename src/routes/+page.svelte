<script lang="ts">
  import "$lib/shared/styles/web-component.css";
  import Buildeador from "$lib/buildeador.svelte";
  let output = $state('')
</script>
<svelte:head>
  <title>Factura SUNAT</title>
</svelte:head>
<Buildeador config={{type:'03'}} />
{#if output}
  <pre>{output}</pre>
{/if}