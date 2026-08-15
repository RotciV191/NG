# Guía de contenido

Todo lo editable del sitio está en este documento. No hace falta tocar CSS ni JS
salvo para conectar el formulario.

---

## 1 · Fotografías

> **Estado actual: todas las fotografías del sitio son temporales.**
> Son fotos de stock con licencia (Unsplash License: uso libre, también
> comercial, sin atribución obligatoria) descargadas para que la demo se vea
> terminada. **Ninguna es trabajo de NOVA** y en ningún texto del sitio se
> afirma que lo sea. Deben reemplazarse por fotos reales antes de publicar.

Para reemplazar una foto: **coloca el archivo nuevo con el mismo nombre en la
misma carpeta**. No hay que tocar el HTML.

| Archivo | Dónde se ve | Recomendación |
|---|---|---|
| `assets/img/hero.jpg` | Portada, foto grande | Casi cuadrada o vertical, mín. 1400 px de ancho |
| `assets/img/services/kitchen.jpg` | Servicio Kitchen Remodeling | 3:2, mín. 1600 px |
| `assets/img/services/bathroom.jpg` | Servicio Bathroom Remodeling | 3:2 |
| `assets/img/services/interior.jpg` | Servicio Interior Renovation | 3:2 |
| `assets/img/services/exterior.jpg` | Servicio Exterior Renovation | 3:2 |
| `assets/img/services/flooring.jpg` | Servicio Flooring | 3:2 |
| `assets/img/services/painting.jpg` | Servicio Painting | 3:2 |
| `assets/img/services/repairs.jpg` | Servicio Repairs & Improvements | 3:2 |
| `assets/img/projects/01-cover.jpg` … `06-cover.jpg` | Portada de cada proyecto | 4:3, mín. 1600 px |
| `assets/img/projects/01-b.jpg` … `06-b.jpg` | Segunda foto en la ficha de detalle | 3:2, mín. 1400 px |
| `assets/img/og-image.jpg` | Vista previa al compartir el enlace | Exactamente 1200 × 630 |

Notas:

- Formato `.jpg` (o `.webp` si cambias también la extensión en el HTML).
- Comprime antes de subir: apunta a menos de 300 KB por foto.
- Las imágenes se recortan con `object-fit: cover`, así que deja aire alrededor
  del motivo principal. La portada `01-cover.jpg` se ve en 16:9 en la home y
  las `02` y `03` en vertical 4:5; por eso conviene subirlas en 4:3.
- Si un archivo falta, el hueco queda como un rectángulo gris neutro. Nunca
  aparece la palabra "placeholder" ni ningún texto visible para el visitante.
- **Actualiza también el `alt`** de cada `<img>` para describir la foto real:
  ayuda al SEO local y a lectores de pantalla. Los `alt` actuales describen la
  foto temporal y no atribuyen el trabajo a NOVA.

---

## 2 · Servicios

Están en `index.html`, sección `<section id="services">`. Cada servicio son dos
bloques que van en pareja:

1. El botón de la lista (`<button class="service-tab" id="tab-XXX"
   aria-controls="panel-XXX">`).
2. El panel con foto, título y descripción (`<div class="service-panel"
   id="panel-XXX" aria-labelledby="tab-XXX">`).

Para **quitar** un servicio, borra los dos bloques. Para **añadir** uno, copia
una pareja completa, cambia `XXX` por un identificador nuevo y renumera los
`01`, `02`, … de la lista.

Las descripciones actuales describen el alcance habitual de cada trabajo. Si
NOVA lo hace de otra manera, reescríbelas: son las que leerá el cliente.

Recuerda actualizar también las opciones del desplegable **Project Type** del
formulario si cambias la lista de servicios.

---

## 3 · Proyectos

Los proyectos viven en `projects.html`. Cada uno es un `<article class="project">`
con estos atributos:

| Atributo | Para qué sirve |
|---|---|
| `id` | Identificador único (`p-07`, `p-08`…). Permite enlazar directo: `projects.html#p-07` |
| `data-category` | `kitchen`, `bathroom`, `interior` o `exterior`. Alimenta los filtros |
| `data-category-label` | Texto de la categoría en la ficha de detalle |
| `data-title` | Nombre del proyecto |
| `data-summary` | Descripción. Si lo dejas vacío, no se muestra nada. Las actuales son de demo: describen el tipo de trabajo, no un proyecto concreto |
| `data-gallery` | Rutas de fotos separadas por `\|` |
| `data-before` / `data-after` | Fotos antes y después |

Para añadir un proyecto, copia un `<article>` completo, cambia los atributos y la
ruta de la foto de portada.

**Before / After:** el comparador está programado y funcionando, pero **no está
activo en ningún proyecto**: no se puede montar un antes/después creíble con
fotos de stock de casas distintas. Aparece automáticamente en cuanto `data-before`
**y** `data-after` tengan dos fotos reales del mismo encuadre.

```html
data-before="assets/img/projects/07-before.jpg"
data-after="assets/img/projects/07-after.jpg"
```

**Portada de la home:** en `index.html` se muestran solo 3 proyectos destacados.
Sus fotos y títulos se editan ahí y enlazan a `projects.html#p-01`, `#p-02`,
`#p-03`.

**Filtros en la home:** no están activos por decisión de diseño (solo hay 3
proyectos destacados). El componente ya existe: para activarlos, copia el bloque
`<div class="filters">` de `projects.html` dentro de la sección de proyectos de
`index.html`.

---

## 4 · Conectar el formulario

Ahora mismo el formulario valida los datos y, al enviar, ofrece abrir el correo
del visitante con todo escrito. Para que llegue directo a la bandeja de entrada,
elige una opción:

**Opción A — Formspree (o similar).** Crea un formulario en formspree.io y pega
la URL en `assets/js/site.js`, línea `formEndpoint`:

```js
formEndpoint: "https://formspree.io/f/xxxxxxx",
```

**Opción B — Netlify Forms.** Si publicas en Netlify, añade estos atributos al
`<form>` de `index.html` y deja `formEndpoint` vacío:

```html
<form id="estimate-form" action="/gracias.html" method="POST"
      data-netlify="true" enctype="multipart/form-data" novalidate>
```

En ambos casos comprueba que el plan que uses **admita archivos adjuntos**: la
subida de fotos es parte importante del formulario. Los límites actuales (10
fotos, 10 MB cada una) están en `CONFIG` dentro de `assets/js/site.js`.

Haz siempre una prueba real de envío antes de lanzar.

---

## 5 · Otros ajustes rápidos

Todo en `assets/js/site.js`, bloque `CONFIG`:

| Ajuste | Qué hace |
|---|---|
| `mobileActionBar: false` | Quita la barra fija inferior de móvil (Call / Free Estimate) |
| `maxFiles`, `maxFileMB` | Límites de subida de fotos |
| `email`, `phone` | Solo para los mensajes del formulario |

El teléfono y el email visibles están escritos en el HTML (header, formulario,
footer). Si cambian, busca y reemplaza `(425) 343-5456`, `+14253435456` y
`novagenerallnv@gmail.com` en `index.html` y `projects.html`.

---

## 6 · Información que todavía falta

No se inventó nada. Falta confirmar:

- [ ] **Email correcto.** La tarjeta parece decir `novagenerallnw@gmail.com`
      (con `nw`) y el texto que enviaste dice `novagenerallnv@gmail.com`
      (con `nv`). Está puesto el segundo. **Confírmalo antes de publicar**: un
      email equivocado hace perder solicitudes sin que nadie se entere.
- [ ] **Service area** (ciudades o condados donde trabaja NOVA). Hay un bloque
      comentado listo en el footer de `index.html`.
- [ ] **Business hours.** Mismo bloque del footer.
- [ ] **Número de licencia de contratista** (si existe y se quiere mostrar).
- [ ] **Años de experiencia / número de proyectos**, si se quieren mencionar.
- [ ] **Reseñas o testimonios reales** — no hay sección de testimonios porque no
      hay reseñas reales; se puede añadir cuando existan.
- [ ] **Redes sociales**, si las hay.
- [ ] **Dominio definitivo.**
- [ ] **Fotografías reales** — todas las actuales son temporales (punto 1).
- [ ] **Nombres y descripciones reales de proyectos** — los títulos actuales
      ("Kitchen Renovation", "Bathroom Remodel"…) describen tipos de trabajo,
      no proyectos concretos.
- [ ] **Parejas Before / After** del mismo encuadre, si las hay.

---

## 7 · Antes de lanzar

- [ ] **Sustituir todas las fotografías temporales** por fotos reales de NOVA y
      ajustar los `alt`. Esta versión es una demo de presentación.
- [ ] Confirmar el email y probar `tel:` y `mailto:` desde un móvil.
- [ ] Conectar y probar el formulario (incluida una foto adjunta).
- [ ] **Quitar el `<meta name="robots" content="noindex">`** de `index.html` y
      `projects.html`. Está puesto a propósito: mientras la web sea una demo con
      fotos temporales y el email sin confirmar, no interesa que Google la
      indexe. Al lanzar, se borra esa línea en las dos páginas.
- [ ] Cambiar el dominio en `<head>`: `canonical`, `og:url` y `og:image` apuntan
      ahora a `https://rotciv191.github.io/NG/`. Sustituir por el dominio real
      (también en el bloque `application/ld+json` de `index.html`).
- [ ] Completar los datos de `LocalBusiness` en el bloque
      `application/ld+json` de `index.html`: `address`, `areaServed`,
      `openingHours`, `url`, `image`. Añade solo datos reales.
- [ ] Crear el perfil de **Google Business Profile** con exactamente el mismo
      nombre, teléfono y dirección que el sitio.
