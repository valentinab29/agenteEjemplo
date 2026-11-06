# Explicación de error — 2026-10-29

**Archivo:** `INPUT/supabase/prueba2.html` + `js/prueba2.js`
**Lo que se ve:** al tocar 🏠 (o al recargar) sale *"Falta la columna "eliminado_en" en
productos_practica..."* y no aparece ningún producto.

## Tipo de error
**Error de esquema de base de datos.** El código pide una columna que la tabla no tiene. Postgres
responde con el código `42703` (*undefined column*). El JavaScript está bien escrito: lo que no
coincide es lo que el código espera de la tabla con lo que la tabla tiene de verdad.

## Por qué pasa
- Para hacer la papelera, cada consulta filtra con `.is('eliminado_en', null)` ("solo los que no
  están en la papelera").
- Si la columna no existe, Supabase rechaza la consulta entera, no solo ese filtro.
- Por eso 🏠 sí funciona: te lleva a la tienda. Pero la tienda también usa esa columna, así que
  muestra el mismo aviso. No es un problema del botón.

## Por qué el agente no la pudo crear
- La página (y el agente) se conectan con la **anon key**. Esa llave solo puede leer y escribir
  **filas** (select, insert, update, delete), según las reglas RLS.
- Cambiar la **estructura** de una tabla (agregar columnas, es decir DDL: `alter table`) necesita
  permisos de dueño: el panel de Supabase, el SQL Editor o la contraseña de la base de datos.
- Es a propósito: si la anon key, que es pública porque va en el JS, pudiera alterar tablas,
  cualquier persona que abriera la página podría hacerlo.

## Solución
En Supabase → **SQL Editor** → *New query*:

```sql
alter table productos_practica add column eliminado_en timestamptz;
```

O en **Table Editor** → `productos_practica` → *Insert column*: nombre `eliminado_en`, tipo
`timestamptz`, sin valor por defecto, "Is Nullable" activado. Después, recargar la página.

## Concepto para llevarse
El código y la base de datos tienen que estar de acuerdo. Cuando agregas una columna en el código
(como `eliminado_en`), también hay que crearla en la tabla, y eso es un paso aparte, en el panel,
que el JS no puede hacer por ti.
