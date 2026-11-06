# Explicación de error — 2026-10-22 (2)

**Error:** `TypeError: Cannot set properties of null (setting 'textContent')` en `prueba2.js:41`.

**Tipo:** error de tipo de dato: se intenta usar una propiedad sobre `null`.

**Concepto:** `document.getElementById('x')` devuelve `null` cuando no hay ningún elemento con ese id en el HTML. `null` no es un elemento y no tiene `textContent`.

**Causa:** `prueba2.js` escribe en `#resultado`, pero `prueba2.html` solo tiene `#btn-traer` y `#tabla-productos`. La consulta a Supabase sí funcionó; el error está en el momento de mostrar el resultado.

**Opciones:**
1. Agregar `<pre id="resultado"></pre>` en `prueba2.html` (recomendado: `<pre>` respeta la sangría de `JSON.stringify`).
2. Cambiar el id en `prueba2.js` a `'tabla-productos'`.

```html
<pre id="resultado"></pre>
```
