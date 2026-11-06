# Explicación de error — 2026-10-22

**Error:** `404 (Not Found)` + `Refused to execute script ... MIME type ('text/html') is not executable` al abrir `prueba2.html` con Live Server.

**Tipo:** error de ruta (rutas relativas en HTML).

**Concepto:** una ruta relativa en `src="..."` se resuelve desde la carpeta donde está el **.html**, no desde la raíz del proyecto.

**Causa:** `prueba2.html` está dentro de `INPUT/supabase/js/` y pide `js/supabaseClient.js` → el navegador busca `INPUT/supabase/js/js/supabaseClient.js`, que no existe. El servidor responde con una página 404 en HTML, y por eso el navegador se niega a ejecutarla como script (el error de MIME es consecuencia del 404, no otro problema).

**Opciones de corrección:**
1. Mover `prueba2.html` a `INPUT/supabase/` (junto a `prueba.html`) — recomendado: mantiene la convención de que los .html van arriba y los .js en `js/`.
2. Dejarlo en `js/` y cambiar las rutas a `src="supabaseClient.js"` y `src="prueba2.js"`.

```html
<!-- prueba2.html en INPUT/supabase/ -->
<script src="js/supabaseClient.js"></script>
<script src="js/prueba2.js"></script>
```
