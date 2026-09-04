# Explicación de error — 2026-09-04

**Archivo:** `INPUT/clases/css/1.html`

**Síntoma:** el `<h1>` no cambia de color al hacer clic en el botón de modo oscuro, aunque el fondo del body y de los `.grid-item` sí cambian.

**Tipo de error:** selector CSS mal targeteado (error de lógica, no de sintaxis) — el CSS no tiene ninguna falta ortográfica, simplemente el selector nunca coincide con ningún elemento real de la página.

**Causa puntual:**
```css
h1.dark-mode {
  color: aliceblue;
}
```
Este selector pide "un `<h1>` que tenga la clase `dark-mode`". Pero el JS solo hace:
```js
document.body.classList.toggle('dark-mode');
```
La clase se agrega al `<body>`, nunca al `<h1>`. Por eso `h1.dark-mode` jamás encuentra un elemento que cumpla la condición.

**Concepto detrás:** en CSS, escribir dos selectores pegados sin espacio (`h1.dark-mode`) es un **selector compuesto**: exige que el mismo elemento cumpla ambas condiciones a la vez. Escribirlos con espacio (`.dark-mode h1`) es un **selector descendiente**: pide un `h1` que esté *dentro* de un elemento con esa clase — que es justo el caso aquí, porque el `h1` vive dentro del `body`.

Esto es coherente con la regla que sí funciona en el mismo archivo:
```css
.dark-mode .grid-item { ... }
```
Ahí ya se usó el selector descendiente correctamente — el mismo ajuste falta en la regla del `h1`.

**Corrección sugerida:**
```css
.dark-mode h1 {
  color: aliceblue;
}
```

**Estrategia usada:** se le explicó la diferencia entre selector compuesto y descendiente comparando con la regla `.dark-mode .grid-item` que ya tenía escrita correctamente en su propio código, para que reconociera el patrón por sí mismo.
