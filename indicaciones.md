# Arquitectura del Proyecto

Este proyecto sigue una arquitectura modular orientada a la construcción y validación de comprobantes electrónicos SUNAT.

> El widget no realiza envíos directos a SUNAT ni consume servicios externos. Su responsabilidad principal es construir, validar y gestionar la información de los documentos electrónicos.

---

# Estructura General

```text
src/
├── lib/
│
│   ├── models/
│   ├── shared/
│   ├── store/
│   └── modules/
│
└── routes/
```

---

# models

Contiene las estructuras de datos utilizadas por la aplicación.

### Responsabilidades

* Modelos base de documentos.
* Estructuras de datos compartidas.
* Configuraciones iniciales.
* Constantes relacionadas con documentos electrónicos.

### Ejemplo

```text
models/
├── invoice.model.js
├── receipt.model.js
└── document.model.js
```

Ejemplo:

```js
export const invoiceModel = {
    cbcUBLVersionID: '',
    cbcCustomizationID: '',
    cbcID: '',
    cbcIssueDate: ''
};
```

---

# shared

Contiene recursos reutilizables por cualquier módulo del sistema.

```text
shared/
├── components/
├── styles/
├── utils/
└── validators/
```

---

## shared/components

Componentes genéricos reutilizables.

### Ejemplos

```text
Button.svelte
Input.svelte
Select.svelte
Modal.svelte
```

### Responsabilidades

* Componentes reutilizables.
* Componentes desacoplados de la lógica de negocio.
* Elementos de interfaz comunes.

---

## shared/styles

Estilos globales del widget.

### Ejemplos

```text
form-colors.css
web-component.css
```

### Responsabilidades

* Variables CSS.
* Temas.
* Estilos compartidos.
* Configuración visual del Web Component.

---

## shared/utils

Funciones auxiliares reutilizables.

### Ejemplos

```text
currency.util.js
date.util.js
format.util.js
```

### Responsabilidades

* Formateo de datos.
* Conversión de valores.
* Helpers compartidos.
* Transformaciones comunes.

---

## shared/validators

Validaciones reutilizables.

### Ejemplos

```text
ruc.validator.js
dni.validator.js
invoice.validator.js
```

### Responsabilidades

* Validación de RUC.
* Validación de DNI.
* Reglas compartidas entre módulos.

---

# store

Contiene el estado global de la aplicación mediante Stores de Svelte.

### Ejemplos

```text
store/
├── invoice.store.js
├── receipt.store.js
└── ui.store.js
```

### Responsabilidades

* Estado compartido.
* Datos temporales del formulario.
* Comunicación entre componentes.
* Configuración de interfaz.

---

# modules

Contiene los módulos funcionales del sistema.

Cada módulo representa un tipo de comprobante electrónico.

```text
modules/
├── factura/
└── boleta/
```

Cada módulo encapsula sus propios componentes, vistas y lógica.

---

# Módulo Factura

```text
factura/
├── pages/
├── components/
└── utils/
```

---

## factura/pages

Contiene las vistas principales del módulo.

### Ejemplo

```text
pages/
└── builder/
    └── builder.page.svelte
```

### Responsabilidades

* Coordinar la interfaz.
* Gestionar eventos.
* Integrar componentes del módulo.

---

## factura/components

Componentes específicos de la factura electrónica.

### Ejemplos

```text
cbcID.svelte
cbcIssueDate.svelte
cbcIssueTime.svelte
cacTaxTotal.svelte
cacAccountingCustomerParty.svelte
cacAccountingSupplierParty.svelte
```

### Responsabilidades

* Representar campos UBL.
* Renderizar secciones específicas de la factura.
* Mantener componentes desacoplados y reutilizables.

---

## factura/utils

Lógica exclusiva del módulo factura.

### Ejemplos

```text
invoice-builder.js
invoice-calculator.js
invoice-mapper.js
```

### Responsabilidades

* Construcción del JSON final.
* Cálculo de montos.
* Conversión de estructuras.
* Reglas de negocio específicas.

---

# Módulo Boleta

```text
boleta/
├── pages/
├── components/
└── utils/
```

Mantiene la misma estructura que Factura para garantizar consistencia y escalabilidad.

### Responsabilidades

* Construcción de boletas electrónicas.
* Validaciones específicas.
* Componentes propios del documento.

---

# routes

Contiene las rutas de SvelteKit.

```text
routes/
└── +page.svelte
```

### Responsabilidades

* Página principal de desarrollo.
* Pruebas locales del widget.
* Entorno de demostración.

Las rutas no forman parte de la lógica principal del widget.

---

# Principios de la Arquitectura

* Separación entre interfaz y lógica de negocio.
* Componentes reutilizables en `shared`.
* Lógica específica encapsulada en cada módulo.
* Estado centralizado mediante Stores.
* Fácil incorporación de nuevos documentos SUNAT.

### Ejemplos futuros

```text
modules/
├── factura/
├── boleta/
├── nota-credito/
├── nota-debito/
├── guia-remision/
├── retencion/
└── percepcion/
```

Cada nuevo comprobante podrá agregarse como un módulo independiente sin afectar los existentes.
