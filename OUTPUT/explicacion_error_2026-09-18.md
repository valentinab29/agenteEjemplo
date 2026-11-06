# Explicación de error — 2026-09-18

## Qué pasó
Al agregar una emoción nueva desde el formulario de `gestion.html` (proyecto1),
el `console.log`/inspección del array `heroes` sí la muestra ahí — pero al abrir
`index.html` por separado, esa emoción nueva no aparece renderizada.

## Tipo de error
No es una excepción (no hay mensaje en consola): es un **error de lógica**
sobre cómo el navegador ejecuta el JavaScript de cada página.

## Causa
`index.html` y `gestion.html` son dos páginas independientes. Cada una tiene su
propia etiqueta `<script src="data.js">`, y cada vez que el navegador carga una
página, **vuelve a ejecutar `data.js` desde cero** para esa página — crea su
propia copia del array `heroes` en memoria, sin conexión con la copia de la otra
página.

Entonces:
- En [gestion.js:8-50](INPUT/clases/css/momento%201/obj%201/proyecto1/gestion.js#L8-L50), `heroes.push(...)` sí modifica el array — pero solo en la copia que vive en la pestaña/proceso de `gestion.html`.
- `data.js` en disco **no cambia** — sigue con los 9 objetos originales.
- Cuando abres `index.html`, esa página ejecuta su propia copia de `data.js` desde cero, sin saber nada de lo que pasó en `gestion.html`.

## Concepto detrás
Dos `<script>` en dos archivos `.html` distintos **no comparten memoria**,
aunque apunten al mismo `.js`. Cada carga de página es un programa nuevo e
independiente. Para que dos páginas "vean" el mismo dato actualizado, hace
falta algo que sobreviva fuera de la memoria de cada página: `localStorage`
(compartido entre pestañas del mismo origen), o un backend que guarde en una
base de datos/archivo real.

## Solución (si quieres persistencia)
No se aplicó todavía — es una decisión de diseño, no una corrección obligatoria.
Opción más simple para este proyecto: en `gestion.js`, después de `heroes.push(...)`,
guardar el array en `localStorage`; y en `index.js`/`gestion.js`, al cargar,
revisar si hay algo en `localStorage` y usarlo en vez del `heroes` de `data.js`.
