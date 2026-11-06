# Explicación de error — 2026-10-30

## Síntoma
En `cliente.html`, después de crear la cuenta, darle "Iniciar sesión" no hace nada (la página
se recarga y no hay ningún mensaje en la consola).

## Tipo de error: lógica
El código no se rompe, pero no hace lo que se espera: falta un paso, así que el navegador no
lanza ningún mensaje.

## Causa
`js/cliente.js` solo tiene el listener de `#form-registro`. **No hay ninguno para `#form-login`**
(ni para `#btn-logout`), y tampoco ninguna llamada a `db.auth.signInWithPassword()`.
Un `<form>` sin listener de `submit` hace lo que haría por defecto: recarga la página y pone los
campos en la URL (`?...`). Nunca se habla con Supabase.

## Concepto
El HTML solo *dibuja* el formulario; el comportamiento lo pone el JavaScript. Cada `<form>`
necesita su propio `addEventListener('submit', ...)` con `event.preventDefault()`.
Es el mismo caso que "Crear producto" del 2026-10-23.

## Corrección (esquema)
```js
document.getElementById('form-login').addEventListener('submit', async (event) => {
  event.preventDefault();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  // error → mostrar mensaje; data.session → sesión iniciada
});
```

## Ojo después de arreglarlo
Si Supabase exige confirmar el correo, el login devuelve `Email not confirmed` hasta que se haga
clic en el enlace del correo (o se desactive "Confirm email" en Authentication → Providers → Email).
