# Explicación de error — 2026-09-25

**Síntoma:** en `proyecto1/index.html`, al elegir el filtro "Envidia" no aparece la carta de Envidia
(y con "Ansiedad" no aparece Ansiedad). No hay mensaje en la consola.

**Tipo de error:** de lógica — el código hace exactamente lo que dice, pero no lo que se esperaba.

**Causa:** la condición del filtro en `aplicarFiltro()` (`index.js`) es

```js
emocion.emocionesRelacionadas.includes(filtroActual)
```

que se lee "pasa si en **su lista** de relacionadas aparece 'Envidia'". La lista de la propia
Envidia en `data.js` es `["Ira", "Desagrado"]`: ninguna emoción se menciona a sí misma, así que
nunca pasa su propio filtro. El filtro pregunta "¿quién menciona a Envidia?", no "¿qué tiene que
ver con Envidia?".

**Corrección propuesta (pendiente de decidir):**

```js
const pasaRelacionada = filtroActual === ""
  || emocion.nombre === filtroActual
  || emocion.emocionesRelacionadas.includes(filtroActual);
```

y ordenar para que la emoción filtrada quede adelante.

**Concepto a llevarse:** antes de escribir una condición, di en palabras a quién debe dejar pasar
y prueba mentalmente el caso "borde" (aquí: la emoción misma).
