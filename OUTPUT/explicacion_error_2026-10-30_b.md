# Explicación de error — 2026-10-30 (b)

## Mensaje
```
POST https://tnhepukgifhrhtxszkif.supabase.co/auth/v1/signup 429 (Too Many Requests)
Error al registrar: AuthApiError: email rate limit exceeded   (cliente.js:26)
```

## Tipo de error: HTTP 4xx (lo rechaza el servidor)
El código está bien escrito y la petición sí llegó; es el servidor el que dice "no". Los códigos
4xx significan "el problema está en la petición" (404 = no existe, 429 = demasiadas peticiones).

## Causa
Cada `db.auth.signUp()` hace que Supabase mande un **correo de confirmación**. El servidor de
correo que Supabase trae por defecto es solo para pruebas y deja enviar **muy pocos correos por
hora** (rate limit). Después de varios registros seguidos, bloquea los siguientes con 429.
No es culpa de `cliente.js`: la traza (`registrarCliente` → `signUp`) solo muestra por dónde pasó.

## Concepto: rate limit
Un servicio limita cuántas veces lo puedes usar en un tiempo para evitar spam/abuso.
Se reinicia solo al pasar el tiempo.

## Opciones
1. **Desactivar "Confirm email"** (Authentication → Sign In / Providers → Email). Ya no se manda
   correo, así que no hay límite, y además el login funciona sin confirmar. Ideal para practicar.
2. Esperar ~1 hora y volver a intentar.
3. Crear usuarios a mano en Authentication → Users → Add user (marcando "Auto Confirm User").
   Ojo: así no se crea la fila en `clientes_practica`.
4. Configurar un SMTP propio (Resend, Gmail…) — para un proyecto real, no para el taller.
