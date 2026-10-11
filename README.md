# @apisunat/apisunat-widget

Widget de facturación electrónica SUNAT, empaquetado como [Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) (`<apisunat-widget>`). Renderiza el formulario de Boleta, Factura, Nota de Crédito, Nota de Débito y Guía de Remisión Electrónica (GRE) y expone el payload UBL listo para emitir.

No depende de ningún framework: funciona en HTML plano, y también en proyectos con Vite, React, Vue, Angular, etc.

## Instalación

### Con CDN (sin bundler)

```html
<link rel="stylesheet" href="https://unpkg.com/@apisunat/apisunat-widget@0.1.0/dist/assets/apisunat-widget.css" />
<script type="module" src="https://unpkg.com/@apisunat/apisunat-widget@0.1.0/dist/apisunat-widget.js"></script>
```

> Fija siempre la versión (por ejemplo `@0.1.0`) para evitar romper tu app con una actualización futura.

### Con npm

```bash
npm install @apisunat/apisunat-widget
```

```js
import '@apisunat/apisunat-widget';
import '@apisunat/apisunat-widget/styles.css';
```

## Uso básico

```html
<apisunat-widget></apisunat-widget>

<script type="module" src="./dist/apisunat-widget.js"></script>

<script type="module">
  // La función global apisunat() busca el elemento <apisunat-widget> en la página
  // y le asigna la configuración automáticamente
  apisunat({
    personaId: 'TU_PERSONA_ID',
    personaToken: 'TU_PERSONA_TOKEN',
    type: '01',        // '01' Factura, '03' Boleta, '07' Nota Crédito, '08' Nota Débito, '09' Guía de Remisión
    serie: 'F001',
    config: {
      display: {
        header: true,
        supplier: true,
        customer: true,
        lines: true,
        paymentTerms: true
      }
    },
    onchange: (data) => console.log('Documento actualizado:', data),
    onEmit: (result) => console.log('Documento emitido:', result),
    onError: (error) => console.error('Error al emitir:', error)
  });
</script>
```

## Prop `config`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `personaId` | `string` | Sí, para emitir | ID de la persona emisora en APISUNAT. |
| `personaToken` | `string` | Sí, para emitir | Token de autenticación de APISUNAT. |
| `type` | `'01' \| '03' \| '07' \| '08' \| '09'` | Sí | Tipo de comprobante: `'01'` Factura, `'03'` Boleta, `'07'` Nota de Crédito, `'08'` Nota de Débito, `'09'` Guía de Remisión. |
| `serie` | `string` | Sí | Serie del comprobante (ej. `'F001'`, `'B001'`, `'T001'`). |
| `json` | `object` | No | Documento UBL base a precargar. Si no se pasa, el widget inicia un documento vacío según `type`. |
| `config.display` | `object` | No | Activa/oculta secciones del formulario (ver tabla abajo). Por defecto todas están visibles. |
| `onchange` | `(data) => void` | No | Se dispara cada vez que cambia algún campo del formulario. Recibe el payload actual. |
| `onEmit` | `(result) => void` | No | Se dispara cuando la emisión es exitosa (ver [Emitir el documento](#emitir-el-documento)). |
| `onError` | `(error) => void` | No | Se dispara si la emisión falla, o si faltan `personaId`/`personaToken` al emitir. |

### `config.display`

Permite mostrar u ocultar componentes del formulario. Todos los componentes están visibles por defecto (`true`). Para ocultar un componente, configúralo en `false`.

#### Facturas y Boletas (`'01'`, `'03'`)

| Campo | Descripción |
|---|---|
| `header` | Encabezado del documento (serie, correlativo, fecha) |
| `supplier` | Datos del emisor |
| `customer` | Datos del cliente/receptor |
| `lines` | Ítems / líneas del documento |
| `paymentTerms` | Condiciones de pago |
| `detraccion` | Detracción (si aplica) |
| `retention` | Retención (si aplica) |
| `notes` | Notas / Observaciones |
| `summary` | Resumen de totales |

#### Notas de Crédito y Débito (`'07'`, `'08'`)

| Campo | Descripción |
|---|---|
| `header` | Encabezado del documento |
| `billingReference` | Referencia a documento que modifica |
| `supplier` | Datos del emisor |
| `customer` | Datos del cliente/receptor |
| `lines` | Ítems / líneas del documento |
| `notes` | Notas / Observaciones |
| `summary` | Resumen de totales |

#### Guía de Remisión Electrónica (`'09'`)

| Campo | Descripción |
|---|---|
| `header` | Encabezado del documento |
| `supplier` | Datos del remitente (emisor) |
| `deliveryCustomer` | Destinatario |
| `deliveryOptions` | Opciones de entrega |
| `addresses` | Punto de partida y llegada |
| `waybillItems` | Bienes a transportar |
| `grossWeight` | Peso bruto total |
| `notes` | Notas / Observaciones |
| `relatedDocuments` | Documentos relacionados |

**Ejemplo:**

```javascript
apisunat({
  personaId: 'TU_PERSONA_ID',
  personaToken: 'TU_PERSONA_TOKEN',
  type: '09',
  serie: 'T001',
  config: {
    display: {
      deliveryCustomer: false,  // Oculta el destinatario
      notes: false              // Oculta las notas
    }
  }
});
```

## Emitir el documento

El widget se emite automáticamente cuando el usuario hace clic en el botón "Emitir" del formulario. Los callbacks `onEmit` y `onError` se disparan según el resultado:

```js
apisunat({
  // ...resto de config
  onEmit: (result) => {
    console.log('Documento emitido exitosamente:', result);
    // Aquí puedes mostrar el resultado al usuario
  },
  onError: (error) => {
    console.error('Error al emitir:', error);
    alert('No se pudo emitir: ' + error.message);
  }
});
```

Si necesitas emitir el documento programáticamente, puedes acceder al método del elemento:

```js
const el = document.querySelector('apisunat-widget');
const result = await el.emitDocument();
```

## Obtener el payload sin emitir

Puedes obtener el payload UBL actual en cualquier momento usando `window.apisunat.getOutput()`:

```js
function obtenerPayload() {
  const payload = window.apisunat.getOutput();
  console.log('Payload actual:', payload);
  return payload;
}
```

También puedes usar el callback `onchange` para capturar cambios en tiempo real:

```js
apisunat({
  // ...resto de config
  onchange: (data) => {
    console.log('Documento actualizado:', data);
  }
});
```

## Cambiar de tipo de documento en caliente

El componente lee `config.type` y `config.serie` al montar. Para cambiar de tipo (por ejemplo, de Boleta a Factura), vuelve a crear el elemento:

```js
async function montarWidget(type, serie) {
  const wrapper = document.getElementById('invoice-wrapper');
  wrapper.innerHTML = '';

  const el = document.createElement('apisunat-widget');
  wrapper.appendChild(el);

  await customElements.whenDefined('apisunat-widget');

  apisunat({
    personaId: 'TU_PERSONA_ID',
    personaToken: 'TU_PERSONA_TOKEN',
    type,
    serie,
    config: {
      display: {
        header: true,
        supplier: true,
        customer: true,
        lines: true,
        paymentTerms: true
      }
    },
    onEmit: (data) => console.log('Emitido:', data),
    onError: (error) => alert('Error: ' + error.message)
  });
}

montarWidget('01', 'F001'); // Factura
montarWidget('09', 'T001'); // Guía de Remisión
```

## Personalización visual

El widget se renderiza **sin Shadow DOM** (`shadow: 'none'`), así que hereda y puede personalizarse con CSS normal, incluyendo estas variables:

```css
apisunat-widget {
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

## Ejemplos completos

### Ejemplo básico (Boleta)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="https://unpkg.com/@apisunat/apisunat-widget@0.1.0/dist/assets/apisunat-widget.css" />
</head>
<body>
  <apisunat-widget id="widget"></apisunat-widget>
  <button id="emitir">Emitir</button>

  <script type="module" src="https://unpkg.com/@apisunat/apisunat-widget@0.1.0/dist/apisunat-widget.js"></script>
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

### Ejemplo con componentes personalizados (Guía de Remisión)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="https://unpkg.com/@apisunat/apisunat-widget@0.1.0/dist/assets/apisunat-widget.css" />
</head>
<body>
  <apisunat-widget></apisunat-widget>

  <script type="module" src="https://unpkg.com/@apisunat/apisunat-widget@0.1.0/dist/apisunat-widget.js"></script>
  <script type="module">
    apisunat({
      personaId: 'TU_PERSONA_ID',
      personaToken: 'TU_PERSONA_TOKEN',
      type: '09',
      serie: 'T001',
      config: {
        display: {
          deliveryCustomer: false,  // Oculta el destinatario
          relatedDocuments: false   // Oculta documentos relacionados
        }
      },
      onEmit: (data) => console.log('Guía emitida:', data),
      onError: (err) => console.error('Error:', err)
    });
  </script>
</body>
</html>
```

