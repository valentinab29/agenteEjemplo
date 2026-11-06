# Explicación de error — 2026-10-22 (3)

**Archivo:** `INPUT/supabase/js/prueba2.js` — objeto `nuevoProducto` (CRUD: crear).

## 1. SyntaxError: falta una coma (línea `categorias`)
**Tipo:** sintaxis: el código no se puede ni leer, así que **todo el archivo** deja de funcionar (también lo que antes servía).
**Concepto:** en un objeto literal, cada par `clave: valor` va separado por coma. Después de `categorias: [...]` faltaba la coma antes de `image`.
La coma dentro del array (`["Accesorios de Computadora",]`) no era error, solo sobraba.

## 2. Clave `Descripción` vs. columna `description`
**Tipo:** error de nombre que todavía no se nota porque el objeto no se ha insertado. Al hacer `insert`, Supabase respondería que la columna `Descripción` no existe.
**Concepto:** las claves del objeto deben llamarse exactamente igual que las columnas de la tabla (mayúsculas, tildes e idioma incluidos).

```js
categorias: ["Accesorios de Computadora"],
image: "https://...",
// y
description: "Teclado mecánico con retroiluminación RGB y switches azules.",
```
