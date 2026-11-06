# Explicación de error — 2026-10-16

**Error:** `404 (Not Found)` + `{ code: 'PGRST125', message: 'Invalid path specified in request URL' }`
**Tipo:** error de configuración / URL mal formada (no es de sintaxis: el JS corre bien, pero pide una ruta que no existe).

## Qué significa en general
Un 404 indica que el servidor recibió la petición pero no existe nada en esa ruta. PGRST125 es la forma en que PostgREST (la API de Supabase) dice "esa ruta no la reconozco".

## Causa puntual
En `INPUT/supabase/js/supabaseClient.js`:
```js
const SUPABASE_URL = 'https://tnhepukgifhrhtxszkif.supabase.co/rest/v1/';
```
`createClient` espera la URL **base** del proyecto y le agrega `/rest/v1/` por su cuenta. Resultado:
`.../supabase.co/rest/v1/rest/v1/productos_practica` → ruta duplicada → 404.

## Corrección
```js
const SUPABASE_URL = 'https://tnhepukgifhrhtxszkif.supabase.co';
```

## Concepto para llevarse
Una librería cliente (SDK) construye las rutas por ti; tú solo le das el "domicilio" base. Revisar la URL completa en la pestaña Network/consola es la forma más rápida de detectar rutas duplicadas.
