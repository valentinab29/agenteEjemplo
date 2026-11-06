# Explicación de error — 2026-10-30 (c)

## Mensaje
```
Failed to load resource: the server responded with a status of 400 ()
cliente.js:95 Error al iniciar sesión: AuthApiError: Email not confirmed
    at async iniciarSesion (cliente.js:90:25)
```
En pantalla salía "Correo o contraseña incorrectos", pero el correo y la contraseña estaban bien.

## Tipo de error: HTTP 4xx (lo rechaza el servidor)
400 = "la petición no se puede aceptar así". El código funciona; Supabase dice que no por una regla.

## Causa
El proyecto tiene activado **Confirm email**: una cuenta nueva no puede iniciar sesión hasta que
se haga clic en el enlace del correo de confirmación. La cuenta sí existe, pero
`email_confirmed_at` está vacío.
El mensaje genérico del `else` escondía esa causa.

## Concepto
- Autenticación ≠ registro: que `signUp()` funcione no significa que ya se pueda entrar.
- Un mensaje genérico ("incorrectos") ayuda al usuario final, pero mientras se programa conviene
  mostrar `error.message`.

## Solución
1. Supabase → Authentication → Sign In / Providers → Email → desactivar **Confirm email**
   (las cuentas nuevas ya no necesitan confirmar; además evita el 429 de los correos).
2. Para la cuenta que ya existe, confirmarla a mano en el SQL Editor:
   ```sql
   update auth.users set email_confirmed_at = now() where email = 'tu-correo@ejemplo.com';
   ```
