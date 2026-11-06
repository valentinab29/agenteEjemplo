# Explicación de error — 2026-11-05

**Síntoma:** policy `ver_productos` (SELECT, `to authenticated`, `using (true)`) activa, pero `prueba2.html` sigue mostrando productos.

**Tipo:** lógica / configuración (no es un error de JS: RLS no lanza error, solo filtra filas).

**Concepto:** una policy solo se aplica si la tabla tiene RLS activado. Las policies *permissive* se combinan con OR. `using (true)` = cualquier usuario del rol indicado ve todas las filas.

| Causa | Verificación |
|---|---|
| RLS apagado | `select relrowsecurity from pg_class where relname = 'productos_practica';` |
| Otra policy para `public`/`anon` | `select policyname, roles, cmd, qual from pg_policies where tablename = 'productos_practica';` |
| Sesión activa (heredada de `cliente.html`) | consola: `(await db.auth.getSession()).data.session` |

**Solución:** era la sesión activa (heredada de `cliente.html`: mismo origen = mismo `localStorage`). La policy funcionaba; al cerrar sesión, el usuario `anon` ve 0 filas sin error.

---

## 401 al agregar producto

**Síntoma:** `Failed to load resource: 401` + `prueba2.js:80 Error al agregar: Object`.

**Tipo:** permisos (RLS), no es un error de JS.

**Concepto:** RLS niega todo lo que no esté permitido. Solo existe la policy de SELECT; no hay de INSERT. 401 = el rol es `anon` (no hay sesión); 403 = `authenticated`. `.insert().select()` necesita INSERT **y** SELECT. `using` filtra filas existentes; `with check` valida filas nuevas.

**Ver el error real:** `console.log("Error al agregar:", error.code, error.message);` → `42501 new row violates row-level security policy`.

**Solución recomendada:** iniciar sesión + `create policy crear_productos on productos_practica for insert to authenticated with check (true);` (pendiente que el estudiante elija).

---

## 403 al agregar producto con sesión iniciada

**Síntoma:** `POST .../productos_practica 403 (Forbidden)` + `{code: '42501', message: 'new row violates row-level security policy for table "productos_practica"'}`.

**Concepto:** 401 → 403 = ya está autenticado, pero sin permiso. Cada operación necesita su propia policy; solo existe la de SELECT.

**Solución:**
```sql
create policy "crear_productos" on public.productos_practica for insert to authenticated with check (true);
create policy "editar_productos" on public.productos_practica for update to authenticated using (true) with check (true);
create policy "borrar_productos" on public.productos_practica for delete to authenticated using (true);
```

**Patrón:** 3er error de RLS hoy → repasar: SELECT=`using` (0 filas), INSERT=`with check` (error 42501), UPDATE=`using`+`with check` (0 filas), DELETE=`using` (0 filas).
