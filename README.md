# NOVA General Contractor LLC — sitio web

Sitio estático (HTML + CSS + JavaScript). Sin frameworks, sin build, sin
dependencias. Se puede subir tal cual a Netlify, Vercel, GitHub Pages, Cloudflare
Pages o a un hosting tradicional por FTP.

## Estructura

```
index.html          Home: hero, servicios, proyectos destacados, why NOVA, formulario
projects.html       Listado completo de proyectos + filtros + vista de detalle
assets/css/site.css Sistema de diseño completo (tokens, layout, componentes)
assets/js/site.js   Menú móvil, selector de servicios, filtros, detalle de proyecto,
                    comparador Before/After, validación y envío del formulario
assets/img/         Fotografías (ver CONTENT-GUIDE.md)
CONTENT-GUIDE.md    Cómo reemplazar fotos y textos, y qué información falta
```

## Ver el sitio en local

Ábrelo con cualquier servidor estático desde la carpeta del proyecto:

```bash
npx --yes serve -l 5173 .
```

Después abre `http://localhost:5173`. Abrir `index.html` directamente con doble
clic también funciona, pero un servidor local reproduce mejor el comportamiento
real.

## Publicar

Sube la carpeta completa. No hay paso de compilación.
Antes de publicar, revisa la sección "Antes de lanzar" de `CONTENT-GUIDE.md`
(dominio, `og:image`, endpoint del formulario).

## Decisiones técnicas

- **Sin framework.** Son dos páginas; añadir React/Next solo agregaría
  complejidad y peso sin beneficio.
- **Contenido en el HTML, no en JavaScript.** Los servicios y los proyectos están
  escritos directamente en el HTML para que Google los indexe y para que el sitio
  siga siendo legible sin JavaScript. El JS solo controla el comportamiento.
- **Fotografías por convención de nombre.** Cada imagen apunta a una ruta fija:
  para cambiarla basta con dejar el archivo nuevo con el mismo nombre, sin tocar
  el HTML. **Las fotos actuales son temporales** (stock con licencia) para que la
  demo se vea terminada — ver CONTENT-GUIDE.md.
- **Tipografía Archivo** desde Google Fonts, con fallback a fuentes del sistema.
- **Accesibilidad:** HTML semántico, foco visible, navegación por teclado en el
  selector de servicios y en el detalle de proyecto, contraste AA, y respeto por
  `prefers-reduced-motion`.
