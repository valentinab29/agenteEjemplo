# Explicación de error — 2026-09-10

**Archivo:** `INPUT/codigo/css1/index.html`

**Síntoma:** el botón "Desaparece clase" no responde al hacer clic.

**Tipo de error:** `ReferenceError: Cannot access 'btn3' before initialization` — temporal dead zone (TDZ).

**Causa puntual:**
```js
btn3.addEventListener("click", function(){   // línea 167 — usa btn3
  alert("hola mundo 3");
  gc4.style.display = "none";
});

const btn3 = document.getElementById("btn3"); // línea 173 — recién se declara aquí
```
`btn3` se usa 6 líneas antes de declararse con `const`. Aunque existe un `window.btn3` implícito por el `id="btn3"` del botón, la declaración `const btn3` más abajo tapa ese global en todo el script desde el inicio, así que la referencia temprana cae en TDZ y lanza el error, deteniendo el resto del script (btn1, btn2, titulo, descripcion, resize nunca se ejecutan).

**Concepto detrás:** con `let`/`const`, el nombre queda reservado desde el inicio del scope, pero no se puede usar hasta que la línea de declaración se ejecuta. Usarlo antes no cae en el `window.btn3` automático del navegador — la declaración local shadow-ea al global en todo el script.

**Corrección sugerida:**
```js
const gc4 = document.querySelector('.grid-container-4');
const btn3 = document.getElementById("btn3");

btn3.addEventListener("click", function(){
  alert("hola mundo 3");
  gc4.style.display = "none";
});
```

**Estrategia usada:** se señaló la línea exacta donde se usa `btn3` frente a la línea donde se declara, para que el estudiante viera el orden por sí mismo antes de dar la corrección.
