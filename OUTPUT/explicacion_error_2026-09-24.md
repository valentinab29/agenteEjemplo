# Explicación de error — 2026-09-24

## Qué pasó
Desde la consola de Chrome en `gestion.html` (proyecto1), para borrar los 10
objetos "Hackeo" creados con un `for`, se escribió:

```js
for (let i = 1; i <= 10; i++) {
  emociones.pop({
```

Chrome respondió: `Uncaught SyntaxError: Unexpected end of input (at VM599:3:5)`.

## Tipo de error
**Error de sintaxis** (`SyntaxError`): JavaScript no pudo leer el código, así
que no ejecutó nada (no se borró ningún objeto).

## Causa
El código terminó con 3 cosas abiertas y ninguna cerrada:

| Abre | Dónde | ¿Se cerró? |
|---|---|---|
| `{` | final de la línea del `for` | No |
| `(` | `pop(` | No |
| `{` | `pop({` | No |

Además, `pop({` viene de copiar la forma de `push({ ... })`, pero `pop()` no
recibe argumentos: siempre quita el **último** elemento del arreglo.

## Concepto detrás
- Toda apertura (`{`, `(`, `[`) necesita su cierre. "Unexpected end of input"
  significa que el código se acabó mientras todavía faltaba alguno.
- `push(elemento)` necesita saber **qué** agregar; `pop()` no, porque siempre
  saca el último. Copiar la estructura de un método a otro sin revisar qué
  parámetros recibe es una fuente común de errores.
- `VM599:3:5` = código escrito en la consola (no un archivo del proyecto),
  línea 3, columna 5.

## Solución
```js
for (let i = 1; i <= 10; i++) {
  emociones.pop();
}
guardarEmociones();
```
