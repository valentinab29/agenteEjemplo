# Explicación de error — 2026-10-23

**Síntoma:** al darle "Crear producto" en `prueba2.html`, el producto no aparece después con "Traer productos". No hay mensaje en la consola.

**Tipo:** error de lógica / comportamiento por defecto. El código no "falla"; simplemente nunca hace lo que esperábamos.

**Causa:** `#form-producto` no tenía listener de `submit` en `prueba2.js`. Cuando le das al `<button type="submit">` de un `<form>`, el navegador hace su acción por defecto: **recarga la página** y pone los campos en la URL (`?nombre=...&precio=...`). Como nunca se llamaba a `agregarProducto()`, Supabase nunca recibía el `insert`.

**Corrección:**

```js
form.addEventListener('submit', async (event) => {
  event.preventDefault();          // cancela la recarga
  const datos = { nombre: form.nombre.value, precio: Number(form.precio.value), /* ... */ };
  await agregarProducto(datos);    // ahora sí se inserta
});
```

**Conceptos:**
- `submit` se escucha en el `<form>`, no en el botón: así también funciona si el usuario presiona Enter.
- `event.preventDefault()` cancela la acción por defecto del navegador.
- `.value` siempre devuelve texto, así que los números se convierten con `Number()`; un checkbox se lee con `.checked`.
- Los `name` del form se renombraron para que coincidan con las columnas (`description`, `categorias`, `image`).

**Pista para verlo tú:** si después de darle al botón la URL termina en `?nombre=...`, la página se recargó y ningún JS manejó el form.
