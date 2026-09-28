# @kami_lml/apisunat-widget

Widget de facturación electrónica SUNAT, empaquetado como [Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) (`<sunat-invoice>`). Renderiza el formulario de Boleta, Factura, Nota de Crédito o Nota de Débito y expone el payload UBL listo para emitir.

No depende de ningún framework: funciona en HTML plano, y también en proyectos con Vite, React, Vue, Angular, etc.

## Instalación

### Con CDN (sin bundler)

```html
<link rel="stylesheet" href="https://unpkg.com/@alexander27/invoice-sunat@0.1.0/dist/assets/invoice-sunat.css" />
<script type="module" src="https://unpkg.com/@alexander27/invoice-sunat@0.1.0/dist/sunat-invoice.js"></script>
```

> Fija siempre la versión (`@0.1.0`) para evitar romper tu app con una actualización futura.

### Con npm

```bash
npm install @alexander27/invoice-sunat
```

```js
import '@alexander27/invoice-sunat';
import '@alexander27/invoice-sunat/styles.css';
```

## Uso básico

```html
<sunat-invoice></sunat-invoice>

<script type="module">
  const el = document.querySelector('sunat-invoice');

  el.config = {
    personaId: 'TU_PERSONA_ID',
    personaToken: 'TU_PERSONA_TOKEN',
    type: '01',        // '01' Factura, '03' Boleta, '07' Nota de Crédito, '08' Nota de Débito
    serie: 'F001',
    components: {
      header: true,
      supplier: true,
      customer: true,
      lines: true,
      paymentTerms: true
    },
    onchange: (data) => console.log('Documento actualizado:', data),
    onEmit: (result) => console.log('Documento emitido:', result),
    onError: (error) => console.error('Error al emitir:', error)
  };
</script>
```

> El widget se configura asignando el objeto `config` como **propiedad** del elemento (`el.config = {...}`), no como atributo HTML, porque `config` es un objeto complejo.

## Prop `config`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `personaId` | `string` | Sí, para emitir | ID de la persona emisora en APISUNAT. |
| `personaToken` | `string` | Sí, para emitir | Token de autenticación de APISUNAT. |
| `type` | `'01' \| '03' \| '07' \| '08'` | Sí | Tipo de comprobante: Factura, Boleta, Nota de Crédito, Nota de Débito. |
| `serie` | `string` | Sí | Serie del comprobante (ej. `'F001'`, `'B001'`). |
| `json` | `object` | No | Documento UBL base a precargar (por ejemplo, líneas de una Nota de Crédito). Si no se pasa, el widget inicia un documento vacío según `type`. |
| `components` | `object` | No | Activa/oculta secciones del formulario (ver tabla abajo). Por defecto todas están visibles. |
| `onchange` | `(data) => void` | No | Se dispara cada vez que cambia algún campo del formulario. Recibe el payload actual. |
| `onEmit` | `(result) => void` | No | Se dispara cuando la emisión es exitosa (ver [Emitir el documento](#emitir-el-documento)). |
| `onError` | `(error) => void` | No | Se dispara si la emisión falla, o si faltan `personaId`/`personaToken` al emitir. |

### `components`

| Campo | Sección |
|---|---|
| `header` | Encabezado del comprobante |
| `supplier` | Datos del emisor |
| `customer` | Datos del cliente |
| `lines` | Ítems / líneas del documento |
| `paymentTerms` | Condiciones de pago |
| `retention` | Retención (si aplica) |

Cualquier campo omitido se asume `true`. Para ocultar una sección, pásalo en `false`.

## Emitir el documento

El elemento expone el método `emitDocument()`, que valida `personaId`/`personaToken`, envía el documento y dispara `onEmit` o `onError`:

```js
const el = document.querySelector('sunat-invoice');

document.getElementById('btn-emitir').addEventListener('click', async () => {
  try {
    const result = await el.emitDocument();
    console.log('Emitido:', result);
  } catch (error) {
    console.error('No se pudo emitir:', error);
  }
});
```

## Obtener el payload sin emitir

Para leer el payload UBL actual (por ejemplo, para previsualizarlo antes de emitir), usa `onchange` y guarda el último valor recibido:

```js
let ultimoPayload = null;

el.config = {
  // ...resto de config
  onchange: (data) => { ultimoPayload = data; }
};

// más adelante:
console.log(ultimoPayload);
```

## Cambiar de tipo de documento en caliente

El componente lee `config.type` y `config.serie` al montar. Para cambiar de tipo (por ejemplo, de Boleta a Factura), vuelve a crear el elemento en vez de solo reasignar `config`:

```js
function montarWidget(type, serie) {
  const wrapper = document.getElementById('invoice-wrapper');
  wrapper.innerHTML = '';

  const el = document.createElement('sunat-invoice');
  wrapper.appendChild(el);

  el.config = { ...configBase, type, serie };
}

montarWidget('01', 'F001'); // Factura
```

## Personalización visual

El widget se renderiza **sin Shadow DOM** (`shadow: 'none'`), así que hereda y puede personalizarse con CSS normal, incluyendo estas variables:

```css
sunat-invoice {
  --form-color-1: #ffffff;
  --form-color-2: #f8fafc;
  --form-color-3: #6366f1;
  --form-color-4: #eef2ff;
  --form-panel-bg: #f8fafc;
  --form-field-bg: #ffffff;
  --form-border-color: #e2e8f0;
  --form-border-radius: 10px;
  --form-text-color: #0f172a;
  --form-text-soft: #64748b;
  --form-text-muted: #94a3b8;
  --form-font-family: 'Inter', system-ui, sans-serif;
}
```

Al no usar Shadow DOM, también hereda estilos globales de tu página (resets, fuentes, etc.). Ten esto en cuenta si tu sitio tiene un CSS muy genérico que pueda chocar con las clases internas del widget.

## Ejemplo completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="https://unpkg.com/@alexander27/invoice-sunat@0.1.0/dist/assets/invoice-sunat.css" />
</head>
<body>
  <sunat-invoice id="widget"></sunat-invoice>
  <button id="emitir">Emitir</button>

  <script type="module" src="https://unpkg.com/@alexander27/invoice-sunat@0.1.0/dist/sunat-invoice.js"></script>
  <script type="module">
    const el = document.getElementById('widget');

    el.config = {
      personaId: 'TU_PERSONA_ID',
      personaToken: 'TU_PERSONA_TOKEN',
      type: '03',
      serie: 'B001',
      onEmit: (data) => alert('Emitido correctamente'),
      onError: (err) => alert('Error: ' + err.message)
    };

    document.getElementById('emitir').addEventListener('click', () => el.emitDocument());
  </script>
</body>
</html>
```

