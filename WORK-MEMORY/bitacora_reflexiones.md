# Bitácora de reflexiones — Agente de Talleres

Una entrada por sesión de clase, que el agente actualiza automáticamente al terminar cada tarea:
lo que se hizo, las preguntas y decisiones, los errores y dudas, y al cierre la reflexión (qué se
aprendió o qué costó más). **No es la bitácora del curso** (esa la lleva el profesor, en
`bitacora_sesiones_curso.csv`, fuera de esta carpeta) — esta es el registro personal del
estudiante sobre su propio proceso.

## 2026-08-20

Hoy entendí la diferencia entre declarar una variable con `let` y usarla sin declararla — el
`ReferenceError` dejó de sentirse aleatorio en cuanto vi que siempre es la misma causa: un nombre
que nunca definí.

## 2026-08-22

Me costó organizar las referencias visuales por tema en vez de por sitio de origen. Al principio
quería agruparlas por dónde las encontré, pero agruparlas por lo que inspiran (color, tipografía,
layout) tiene más sentido para el proyecto.

## 2026-09-16

Exploración de estilo para la tarjeta del taller de objetos (`INPUT/clases/css/momento 1/obj 1/`).
Registro todo lo que probé, incluso lo que no dejé al final, porque el enunciado pedía documentarlo:

- **Tema:** arranqué con 12 superhéroes de Eternals, pero el enunciado pedía explícitamente no
  quedarme en superhéroes y tener entre 8-10 objetos — cambié todo el array a las 9 emociones de
  Intensamente 2.
- **Layout:** probé primero un grid con las 12 cartas visibles a la vez; después un carrusel de una
  sola carta con flechas; terminé en un efecto de "baraja" donde se ven las puntas de 2 cartas
  asomando detrás de la de adelante.
- **Transición entre cartas:** primero pedí un giro en espiral (`rotate` + `scale` + `opacity` con
  `@keyframes`); no me convenció porque se sentía "cortado" al cambiar el contenido, así que lo
  reemplacé por el efecto de baraja (la carta de adelante se desliza y se "esconde" detrás, con
  `data-pos` + un truco de reflow para que el cambio de contenido no se note a mitad del movimiento).
- **Colores:** pasé de una paleta fija dorada/cósmica (tema Eternals) a que cada carta tenga el
  color propio de su personaje, mezclado con blanco o negro según el modo, usando `color-mix()`.
- **Datos mostrados:** cambié la información varias veces — probé "nivel de intensidad" + "años
  activa", después "dato curioso" + "veces al mando", y terminé en: `edad` (número),
  `nivelIntensidad` (número), `esNueva` (booleano) y `emocionesRelacionadas` (array). También agregué
  `esMasculino` para conjugar bien el género de cada personaje en el texto (ej. "aislado", no
  "aislada", cuando el personaje es hombre aunque la palabra en español — "la ira" — sea femenina).
- **Tamaño y espaciado:** las cartas empezaron muy grandes (340px) y muy pegadas al resto de la
  página; las hice más chicas, después tuve que agrandar la foto de nuevo porque se veía achatada, y
  aumenté el espacio entre el título/carrusel/contador porque se sentía todo amontonado.
- **Lo que probé y NO usé al final:** el giro en espiral (reemplazado por la baraja) y un encabezado
  de color sólido en vez de foto (lo descarté cuando decidí que sí quería mantener la imagen).

## 2026-09-25

### Lo que hicimos

Proyecto: `INPUT/clases/css/momento 1/obj 1/proyecto1/` (y un rato en `filter map/`).

- **Slider vertical de intensidad** (`index.html`): panel flotante a la izquierda con
  `<input type="range">` vertical (`writing-mode: vertical-lr` + `direction: rtl`). Filtra en vivo
  con el evento `input` (no `change`). Primero filtraba `>=`; después lo cambiamos a un **rango ±10**
  ordenado por cercanía (`Math.abs`, `sort`), con botón "Quitar" para volver a "Todas".
  Aprendido: `.value` siempre es texto → `Number()`; `writing-mode` vs `rotate`; guardar un cambio
  "pendiente" si llega durante una animación.
- **Filtros por emoción relacionada**: de 10 chips a 3 — "Todas" + los 2 nombres que más se repiten
  (Ansiedad y Envidia). Contador con objeto `{ nombre: veces }`, `sort` con desempate y `slice`.
- **filter map/**: estructura HTML base + `index.js` vinculado (el `<script>` al final del body).
- **game.html — formulario de ingreso**: nombre, alias, email y contraseña, con `novalidate` para
  validar todo desde JS.
  - Regex de contraseña: mínimo 6 caracteres, 1 número, 1 mayúscula, 1 especial. Lookahead `(?=...)`,
    `\p{Lu}` y `[^\p{L}\p{N}\s]` con la bandera `u` (para que ñ y tildes no cuenten como especial).
    El mensaje dice qué requisito falta (`filter` + `map`).
  - Regex de email: lookahead negativo `(?!.*\.\.)` y lookbehind `(?<!\.)`.
- **Usuarios en localStorage** (clave `"usuarios"`): `JSON.stringify`/`JSON.parse`, contraseña
  guardada como **hash SHA-256 + sal** (`crypto.subtle`, `async/await`, `try/finally`). Si el email
  no existe, `confirm()` pregunta si quiere registrarse. Lo verifiqué en el navegador: sí registra.
- **Juego de memoria** (`game.html` + `memoria.js`): análisis del flip-cards de CodePen (Julian
  Bejarano, MIT) e implementación con **todas** las emociones, con la estética del proyecto. IIFE que
  devuelve una función, Fisher-Yates, giro 3D (`preserve-3d`, `backface-visibility`), `clearTimeout`.
- **Partidas por usuario**: cada usuario con `id` autogenerado (mayor + 1, con migración de los
  antiguos) y `partidas: [{ id, fecha, intentos, tiempoSegundos }]`; id de partida único en todo el
  JSON (`flatMap` + `reduce`), fecha ISO. `memoria.js` avisa con un **callback** y `game.js` guarda.

### Preguntas y decisiones

- ¿Qué filtra el slider? → mínimo `>=`; luego pedí que mostrara las cartas "en ese rango" → rango ±10
  con la más cercana adelante (opción a).
- ¿Dónde va el slider? → vertical, flotante a la izquierda.
- ¿Cuáles filtros dejar? → "Todas" + los 2 que más se repiten (automático, desde los datos).
- ¿Incluir a Envidia/Ansiedad en su propio filtro y ponerla adelante? → **pendiente**.
- ¿Regla de contraseña "6 números" o "6 caracteres"? → "la que sea mejor" → 6 caracteres con
  número, mayúscula y especial.
- ¿Contraseña en texto plano o hash? → "la que sea mejor" → hash SHA-256 con sal.
- Pestaña "Usuarios" en `gestion.html`: ¿solo ver sal/hash o también cambiar contraseña? → **pendiente**.
- Juego: ¿6 emociones al azar o todas? → "muestra = universo" (todas), en `game.html`, con la
  apariencia del proyecto y no la del ejemplo. Récord por usuario → no se respondió.
- Partidas: id global, fecha ISO, solo partidas completadas → sí.
- Bitácora → que el agente registre todo automáticamente desde ahora.

### Errores y dudas

- **"En el filtro Envidia no sale la carta de Envidia"** (igual con Ansiedad): error de lógica, no
  de sintaxis. `includes()` busca el nombre en la lista `emocionesRelacionadas` de cada emoción, y
  ninguna emoción se menciona a sí misma. Arreglo propuesto, **pendiente** de decidir. Registrado en
  `registro_errores.csv`.
- En el ejemplo del juego (no en mi código) había un bug: reiniciar durante los 0.9 s de volteo
  lanzaba `TypeError` (el `setTimeout` pendiente usaba `carta1 = null`). Se corrigió con
  `clearTimeout`. La imagen del reverso venía de Facebook con un token vencido.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-10-01

### Lo que hicimos

- Arrancamos proyecto nuevo en `INPUT/portfolio/` (la carpeta existe y está vacía).
- Análisis de `INPUT/portfolio/valentinabolaños.md`: trae contenido propio (bio + 4 skills) y un
  desglose del portfolio 3D de Bruno Simon como referencia (R3F, Rapier, zonas en vez de scroll,
  Amatic SC + Nunito, estética low-poly). Faltan: proyectos, contacto e imágenes.
- Plan propuesto por fases: landing semántica → estilo → interacción → escena 3D en el hero.
  Conceptos vistos: SPA en `<canvas>` vs HTML semántico, mejora progresiva.
- Primera versión del sitio (opción B) en `INPUT/portfolio/`:
  - `index.html`: estructura semántica (`header`/`nav`/`main`/`section`/`footer`) con Home, About
    (+ Skills), Projects y Contact.
  - `styles.css`: variables CSS para la paleta, Amatic SC + Nunito, `grid` con `auto-fit`/`minmax`,
    `scroll-behavior: smooth` + `scroll-padding-top`, `prefers-reduced-motion`.
  - `main.js`: tarjetas generadas desde el array `projects` (`map` + `createElement`), menú overlay
    (`aria-expanded`, cierre con Escape) y sección activa con `IntersectionObserver`.
  - `hero3d.js`: escena Three.js con figuras low-poly (`flatShading`) que siguen al mouse;
    `import()` dinámico dentro de `try/catch` para que, si falla, quede el fallback de CSS.
  - Proyectos, contacto y modelo 3D quedaron como placeholders marcados con `TODO`.
- Datos separados del código: `data/profile.json` (name, role, tagline, about, skills, contact) y
  `data/projects.json` (array de proyectos). `main.js` los carga con `fetch` + `async/await` +
  `Promise.all` y llena el HTML con atributos `data-profile` (`dataset`). Conceptos: JSON vs objeto
  JS (comillas dobles, sin comentarios), `response.ok`, y por qué `fetch` no funciona en `file://`
  (hay que usar Live Server).

### Preguntas y decisiones

- ¿Qué vamos a construir en `portfolio/`? → landing page con mi portafolio, a partir del md.
- ¿Enfoque: landing clásica, híbrido (landing + escena 3D en el hero) o mundo 3D completo? →
  recomendado el híbrido → **B (híbrido)**.
- Pedí perfil y proyectos en estructuras JSON separadas → archivos `.json` reales cargados con
  `fetch` (la alternativa era objetos en archivos `.js`, que sí abren con doble clic).
- Pedí `gestion.js` y `gestion.html` → CRUD de proyectos. ¿Lleva login como en `proyecto1/`? y
  ¿también debe gestionar el perfil? → **pendiente**.
- ¿Qué proyectos, datos de contacto e imágenes van en el sitio? → **pendiente**.
- ¿Hay enunciado o fecha de entrega para el portafolio? → **pendiente** (no está en `entregas_talleres.md`).

- `gestion.html` + `gestion.js`: CRUD de proyectos (mostrar todos, crear, buscar, actualizar,
  eliminar y restaurar), con la misma idea del `gestion` de `proyecto1/` pero sin login. Los
  cambios se guardan en `localStorage` (clave `"projects"`) y `main.js` lee esa versión antes que
  `projects.json`. Se agregó `id` a cada proyecto del JSON. Probado en Edge headless: crear,
  buscar sin tildes, actualizar y eliminar funcionan y `index.html` muestra los cambios.
  Conceptos: el navegador no puede escribir archivos del proyecto, `Object.assign`, `new Option`,
  `replaceChildren`, spread en `Math.max`, id vs posición en el array.
- Portafolio subido a GitHub: `https://github.com/valentinab29/PORTFOLIO-CLASE` (rama `main`,
  commit `8ea699f`, encima del README que ya existía). Se hizo desde un clon temporal, porque git
  no deja operar en la carpeta de `D:` ("dubious ownership": el disco no registra dueño de
  archivos). Conceptos: `clone`, `add`, `commit`, `push`, remoto vs copia local.
- Verificación en navegador (Edge headless + servidor local): las 4 tarjetas de `projects.json`
  se renderizan, el perfil se llena desde `profile.json` y la escena 3D arranca.

### Errores y dudas

- Volví a pedir que los proyectos estuvieran en un JSON aparte y se renderizaran: ya estaba hecho,
  la duda probable es que no se ven al abrir `index.html` con doble clic (`fetch` bloqueado en
  `file://`). Se resuelve abriendo con Live Server. **Pendiente** confirmar si era eso.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-10-04

### Lo que hicimos

- `portfolio/styles.css`: **tema morado nocturno**. Se cambiaron los valores de los tokens de
  `:root` y se renombraron para que el nombre diga el color real (`--color-teal` → `--color-violet`,
  `--color-yellow` → `--color-lilac`, `--color-pink` → `--color-orchid`; también en `main.js`).
  Nuevos tokens: `--color-on-accent` (texto oscuro sobre botones/chips claros) y `--color-shadow`.
  Conceptos: design tokens / custom properties, contraste de texto sobre fondo.
- **Fondo de estrellas de 5 puntas**: dos SVG en data URI como capas de `background-image`
  (mosaicos de 240px y 370px para que el patrón no se note), más dos `radial-gradient` de brillo,
  con `background-attachment: fixed`. Conceptos: varias capas de fondo, `%23` en lugar de `#` en
  data URIs, `<polygon>` y `<use>` en SVG.
- El fallback del hero ahora es una estrella con `clip-path: polygon(...)` (10 vértices).
- `portfolio/hero3d.js`: el icosaedro se reemplazó por un **avatar low-poly** hecho con primitivas
  de Three.js (pelo castaño medio, blusa morada). La cabeza sigue el mouse, flota, saluda con el
  brazo y parpadea, y la rodean 5 estrellas 3D (`Shape` + `ExtrudeGeometry`). Los colores están en
  `AVATAR_COLORS` para ajustarlos. Conceptos: jerarquía con `Group`, pivote del brazo en el hombro,
  `thetaStart/thetaLength` para recortar un cilindro, `THREE.Clock`, `Math.sin` para movimientos
  cíclicos.
- Verificado con Chrome headless: el hero se ve bien. Las secciones de abajo no se pudieron
  capturar (falla de headless con fondo `fixed`) → revisar con Live Server.

- `portfolio/data/profile.json`: contacto real (correo `dannavalentina0719@gmail.com`, Instagram
  `@dnna.vntna`). Se creó `portfolio/img/` para las imágenes de los proyectos.

- `portfolio/data/projects.json`: primer proyecto real, **KidVault**
  (`https://valentinab29.github.io/KidVault/`, Web Design). La imagen `img/kidvault.png` es una
  captura con Chrome headless (1280×960, 4:3 como la tarjeta). Las otras 3 tarjetas siguen siendo
  de ejemplo.

- **Trabajos de Blender** al portafolio: `Ball_Obstaculos2`, `books`, `luma`, `money`, `pot` (en
  `portfolio/img/`). Se renderizaron sin abrir la interfaz (`blender.exe -b archivo.blend --python
  script.py`) a 1600×1200 JPG (4:3, como las tarjetas) y se exportó un `.glb` de cada uno para un
  futuro visor 3D. Ajustes solo para el render, sin tocar los `.blend`: luz y *World* temporales en
  `Ball` (salía negro), cámara alejada y apuntada al centro en `books` y `money`, salida cambiada
  de video (FFMPEG) a imagen en `luma`. `projects.json` ahora tiene 6 proyectos reales.
  Conceptos: Blender en modo *background* + `bpy`, fotograma representativo de una animación,
  *sensor fit* al cambiar de 16:9 a 4:3, `to_track_quat` para apuntar una cámara.

- Subido a GitHub `valentinab29/PORTFOLIO-CLASE` (rama `main`, commit `8241fce`, encima de
  `8ea699f`), otra vez desde un clon temporal. Incluye `img/` con renders, `.blend` y `.glb`.
  Conceptos: `git status --short` antes de commitear (M = modificado, A = agregado), aviso LF/CRLF.

### Preguntas y decisiones

- ¿Avatar en código, modelo `.glb` propio o ambos? → **avatar low-poly en código**.
- ¿Fondo morado claro u oscuro? → **oscuro (noche)**.
- ¿Rasgos del avatar? → **pelo castaño medio, ropa morada**. El tono de piel lo elegí yo
  (`0xe8b894`) → **pendiente** confirmar si se parece.

- ¿Behance se queda, se quita o tiene enlace? → **pendiente**.
- Imágenes de los trabajos: ¿cuáles son y de qué trata cada uno? → KidVault (web) + 5 archivos de Blender (ver abajo).

- ¿KidVault fue de clase o para un cliente real? → para **GlobalSeguros**, en su hackatón: **3.er lugar
  nacional** (en equipo). Se agregó a la descripción.

- ¿Cómo entregar archivos de Blender? → instaló Blender 5.0.1 portable en `Downloads`; los
  `.blend` se copian a `img/`. Pot y Ball = tareas; Luma, Money y Books = parte de KidVault.
- Behance → **pendiente**. ¿Etiqueta visual para premios (`award`)? → **pendiente**.

- ¿Subir también `.blend` y `.glb`? → **sí, todo** (como respaldo).

### Errores y dudas

- `books.blend` y `luma.blend` apuntan a texturas externas que ya no existen
  (`PHOTO-2026-05-06-10-34-38.jpg`, `luz.jpg`). Los renders se ven bien igual; para no perderlas en
  el futuro: *File → External Data → Pack Resources*.
- `Ball_Obstaculos2.blend` no tenía luces ni *World* → en un render sin interfaz sale negro.


### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-10-15

### Lo que hicimos

- Estructura base de un CRUD con Supabase en `supabase/`: `index.html` (formulario + lista),
  `js/supabaseClient.js` (cliente `db`), `js/datos.js` (`getItems`, `addItem`, `updateItem`,
  `deleteItem`), `js/gestion.js` (render y eventos del DOM) y `css/styles.css`.
  Conceptos: orden de carga de `<script>` (cada archivo usa lo que define el anterior), separar
  capa de datos y capa de interfaz, `async/await` con `{ data, error }`, `event.preventDefault()`.
- Ejercicio aparte: `supabase/prueba.html` (botón `#btn-traer` + `#resultado`, carga CDN →
  `supabaseClient.js` → `prueba.js`) y `supabase/js/prueba.js` vacío con espacios para los
  Pasos 2, 3 y 4, que escribe el estudiante.

### Preguntas y decisiones

- ¿Qué tabla usar en Supabase? → sin respuesta; se usa la genérica `items (id, name, created_at)`
  (**pendiente** confirmar la tabla real).
- ¿Agregar `css/styles.css` mínimo? → **sí** (respondió "si" al plan).
- ¿Dónde se cambia el modo de permisos de Claude Code? → selector bajo la caja del chat o
  `Shift+Tab`; cambió a modo de edición para poder crear los archivos.
- Plan de `schema.sql` + `README.md` + `.gitignore`, opción A (key en `supabaseClient.js`) o B
  (`config.js` ignorado) → **pendiente**: pasó al ejercicio `prueba.html` sin responder.
- ¿Quitar `/rest/v1/` de `SUPABASE_URL`? → **pendiente**.

### Errores y dudas

- El modo automático de Claude Code bloqueó la creación de archivos (el clasificador no daba
  veredicto). Se resolvió cambiando el modo de permisos.
- `SUPABASE_URL` quedó con `/rest/v1/` al final. `createClient` espera la URL base del proyecto y
  agrega esa ruta solo → las consultas irían a `/rest/v1//rest/v1/...` y fallarían.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-10-16

### Lo que hicimos

- Ejercicio `supabase/prueba.html`: consulta desde la consola a `productos_practica` con
  `await db.from('productos_practica').select('*')`. Conceptos: URL base vs. ruta de la API,
  cómo un SDK (`createClient`) arma las rutas, leer la URL del request en la consola.
- Servidor local para verlo en el celular: `http-server` escuchando en `0.0.0.0` (todas las
  interfaces) en vez de `127.0.0.1` (solo el propio PC); IP de red local + puerto.
- Paso 5 en `prueba.js`: tabla con todas las columnas de `productos_practica` (botón
  `#btn-tabla`). Conceptos: array de configuración de columnas (`key`/`titulo`/`formato`),
  formato por tipo (int8 → `toLocaleString`, float8 → %, bool → Sí/No, json → `join`),
  `createElement`/`insertRow` y `textContent` en vez de `innerHTML` por seguridad.
- Columna `image` nueva en Supabase: 3 opciones de imagen por producto (Wikimedia Commons,
  licencias libres) en `OUTPUT/referencias_imagenes_2026-10-16.md`. En `prueba.js`: columna
  Imagen (`formato` que devuelve un `<img>` + `instanceof Node`), `descripcion` → `description`;
  en `prueba.html`: `img.miniatura` con `object-fit: cover`.

### Preguntas y decisiones

- ¿Quitar `/rest/v1/` de `SUPABASE_URL`? (pendiente desde 2026-10-15) → el error de hoy lo
  confirma; el estudiante pidió que lo corrigiera yo → **corregido** en `supabaseClient.js`; pendiente confirmar que la consulta ya trae datos.
- ¿Cómo ver `prueba.html` en el celular: servidor en red local (`npx http-server`) o túnel público (`npx localtunnel`)? → **red local**: se levantó `npx http-server -a 0.0.0.0 -p 8080` en `INPUT/supabase/` → `http://172.18.30.94:8080/prueba.html` (responde 200 desde el PC; pendiente confirmar en el cel).
- `prueba.js` tiene dos `addEventListener` en `#btn-traer` (Paso 3 y Paso 4): ambos corren en cada clic; ¿dejar solo el del Paso 4? → **pendiente**.
- ¿Las 3 URLs son opciones de imagen para `image`, y el estudiante pega la elegida en el Table
  Editor de Supabase (en vez de `UPDATE` con la anon key)? → **sí**. Pendiente: que elija una
  imagen por producto y la pegue.
- "¿Y las imágenes?" → `image` sigue en `null` en los 3 (el `descuento` ya quedó en `0.25`).
  Se le preguntó si las pega él o si se intenta el `UPDATE` con las recomendadas → **pendiente**.

### Errores y dudas

- `404 (Not Found)` + `PGRST125: Invalid path specified in request URL` al consultar
  `productos_practica`: la URL quedó `/rest/v1/rest/v1/...` por el `/rest/v1/` de más en
  `SUPABASE_URL`. Registrado en `registro_errores.csv`.
- El modo automático volvió a bloquear la edición de `prueba.html` (clasificador sin veredicto):
  el estudiante salió del modo automático y se agregaron `#btn-tabla`, `#tabla-productos`, el
  `<style>` y el `viewport` → **resuelto** (pendiente confirmar que la tabla se ve en el cel).
- Datos de la tabla no coinciden con lo que el estudiante describió: la columna es `description`
  (no `descripcion`) y el producto 1 tiene `descuento = 25` en vez de `0.25` (se vería 2500%)
  → corregido el nombre en `prueba.js`; el `25` lo corrige el estudiante en Supabase (**pendiente**).

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-10-22

### Lo que hicimos

- `INPUT/supabase/js/prueba2.html`: diagnóstico de por qué no cargan `supabaseClient.js` ni
  `prueba2.js` con Live Server. Conceptos: rutas relativas (se resuelven desde la carpeta del
  .html), 404 que devuelve HTML → error de MIME type como efecto secundario.
  Explicación en `OUTPUT/explicacion_error_2026-10-22.md`.
- `prueba2.js`: `TypeError` porque `getElementById('resultado')` devuelve `null`. Conceptos:
  `getElementById` devuelve `null` si el id no existe en el HTML, y el id del JS tiene que coincidir
  con uno del HTML. Explicación en `OUTPUT/explicacion_error_2026-10-22_b.md`.
- `prueba2.js` + `prueba2.html`: `#resultado3` con la lista de productos disponibles
  (`data.filter(p => p.disponible)` y luego `map` a `<li>`). Conceptos: `filter` escoge elementos
  vs. `map` transforma; un booleano sirve directo como condición.
- El estudiante agregó `#resultado4` (precios con `toLocaleString('es-CO')`) y un objeto
  `nuevoProducto` (CRUD: crear). Corregí en `prueba2.js` la coma que faltaba y `Descripción` →
  `description`. Conceptos: sintaxis de objetos literales, claves = nombres de columnas.
  Explicación en `OUTPUT/explicacion_error_2026-10-22_c.md`.
- El estudiante escribió `agregarProducto(datos)` (`insert([datos]).select()`) y un botón 2.
  Corregí: cierre del listener de `#btn-traer`, `nuevoProducto`/`agregarProducto` movidos afuera,
  listener de `#btn-traer2` con `await agregarProducto(nuevoProducto)`, id del botón →
  `btn-traer2`. Conceptos: llaves balanceadas, alcance (scope), ids únicos, `await` de una función
  `async` propia. Explicación en `OUTPUT/explicacion_error_2026-10-22_d.md`.

### Preguntas y decisiones

- ¿Mover `prueba2.html` a `INPUT/supabase/` (recomendado) o quitar `js/` de las rutas? → **lo movió
  a `INPUT/supabase/`** (los scripts ya cargan).
- ¿Agregar `<pre id="resultado">` en `prueba2.html` (recomendado) o usar `'tabla-productos'` en
  `prueba2.js`? → el estudiante pidió que lo arreglara yo → **se agregó `<pre id="resultado">`**
  en `prueba2.html` (pendiente confirmar que se ve el JSON). Después el estudiante lo cambió a
  `<div>` y agregó `#resultado2` (lista de nombres con `map`).
- ¿`resultado3` = solo los disponibles (`filter`, recomendado) o todos con Sí/No (`map`)? →
  **A (`filter`)**; lo agregué yo en `prueba2.js` (el `div` de `#resultado3` lo puso el estudiante).
- `nuevoProducto` se crea pero no se inserta. ¿Botón aparte `#btn-crear` con `insert` (recomendado)
  o dentro del clic de `#btn-traer` (insertaría un duplicado en cada clic)? → **botón aparte**
  (`#btn-traer2`, lo armó el estudiante). Pendiente: ¿renombrar el texto "Traer productos 2" a
  "Agregar producto"? Ojo: cada clic inserta otro teclado igual.

### Errores y dudas

- `404 (Not Found)` + `Refused to execute script ... MIME type ('text/html')` en `prueba2.html`:
  el navegador buscaba `js/js/...` porque el .html ya está dentro de `js/`. Registrado en
  `registro_errores.csv`.
- `TypeError: Cannot set properties of null (setting 'textContent')` en `prueba2.js:41`: no existe
  `#resultado` en `prueba2.html`. Registrado en `registro_errores.csv`.
- `SyntaxError` por una coma que faltaba en `nuevoProducto` (después de `categorias`), y la clave
  `Descripción` no coincidía con la columna `description`. Registrado en `registro_errores.csv`.
- `SyntaxError: Unexpected end of input`: faltaba el `});` del listener de `#btn-traer`; y el botón 2
  repetía `id="btn-traer"`. Registrado en `registro_errores.csv`. **3.er SyntaxError por
  llaves/comas** → se sugirió repasar estructura de bloques y objetos.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-10-23

### Lo que hicimos

- Pedido: formulario para crear un producto nuevo en `supabase/prueba2.html`. Revisado: el
  `<form id="form-producto">` ya existe en el HTML, pero `prueba2.js` no tiene listener de
  `submit`. Plan propuesto, esperando confirmación.
- Form conectado: listener de `submit` en `prueba2.js` (`preventDefault`, `Number()`, descuento
  `/ 100`, `.checked`, `split(',')` + `trim` + `filter(Boolean)`, `image` vacía → `null`), reusa
  `agregarProducto`, muestra el resultado y hace `form.reset()`. En `prueba2.html` los `name` ahora
  son `description`, `categorias`, `image`. Sintaxis verificada con `node --check`.
  Explicación en `OUTPUT/explicacion_error_2026-10-23.md`.
- Estilo morado para `prueba2.html` (en el `<style>` de la página): tokens en `:root`, fuente
  Poppins, fondo con degradados, botones tipo píldora, tarjetas de resultado que se ocultan
  vacías (`:not(:empty)`), listas como chips (`flex-wrap`), form en `grid` de 2 columnas → 1 en
  celular (`@media`), `accent-color` en el checkbox, foco visible. Conceptos: custom properties,
  `background-clip: text`, `:nth-of-type`, `grid-column: 1 / -1`. No se pudo verificar con captura
  headless → revisar con Live Server.
- Buscador en `prueba2.html` (`#form-buscar` con un cajón `busqueda` + `#resultado-busqueda`) y en
  `prueba2.js`: un solo cajón para `buscarProductoPorId` (si es número, regex `/^\d+$/`) y
  `buscarProductosPorNombre` (`ilike` con `%texto%`). Lista con `createElement` + `textContent` +
  `replaceChildren`. Conceptos: `.eq()` + `.single()` (objeto) vs `.ilike()` (array), normalizar
  ambos resultados a un array, `regex.test()`. Sintaxis verificada con `node --check`.

### Preguntas y decisiones

- ¿Conectar el formulario existente (recomendado) o rehacerlo? Y los `name` del form no coinciden
  con las columnas (`descripcion`/`description`, `caracteristicas`/`categorias`,
  `img_url`/`image`): ¿renombrar en el HTML (recomendado) o mapear en el JS? → no respondió
  directamente; reportó que el producto no aparecía → se aplicó la opción A (renombrar en el HTML).
  Pendiente confirmar que ya aparece al darle "Traer productos".

### Errores y dudas

- "Le doy Crear producto y no aparece en Traer productos": el form no tenía listener de `submit`,
  así que recargaba la página sin insertar. Registrado en `registro_errores.csv`.
- Las funciones de búsqueda se pegaron **dentro** del listener de `submit` del form de crear
  (antes de su `});`). No daba error, pero solo existían durante ese submit → se movieron afuera.
  Es el mismo tema de **alcance (scope)** del 2026-10-22 (`nuevoProducto` dentro de `#btn-traer`)
  → vale la pena repasar dónde abre y cierra cada bloque `{ }`.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-10-29

### Lo que hicimos

- Revisión de `modificarProducto(id, cambios)` (CRUD: actualizar) para `supabase/js/prueba2.js`.
  Hallazgos: si ningún id coincide (o RLS bloquea el `update`), `data` llega como `[]` y
  `data[0]` es `undefined`, no `null`; el `error` se descarta sin `console.log`. Conceptos:
  `update` parcial (solo las claves de `cambios`), `.eq()` como filtro, `.select()` para recibir
  la fila actualizada.
- Revisado `prueba2.html`: el botón "Buscar" sí existe (`#form-buscar`, línea 232).
- Implementado en `prueba2.js`: `modificarProducto` (log del error + `data[0] ?? null`) y el
  listener de `#form-modificar`, que arma `cambios` solo con los campos llenos. Conceptos: update
  parcial, comparar con `''` antes de `Number()` (`Number('')` es 0), `<select>` de 3 estados en vez
  de checkbox, `Object.keys().length`, `name="id_producto"` porque `form.id` es el id del form.
- `prueba2.html`: sección "Modificar producto" + `#resultado-modificar`; los forms comparten la
  clase `.form-crud` y `.ancho`/`.check` en vez de `:nth-of-type`.
- **Modo claro/oscuro**: tokens de tema en `:root` (sin colores fijos en el resto del CSS), bloque
  `@media (prefers-color-scheme: dark)` + `[data-theme="dark"]`, `color-scheme`. Nuevo
  `js/tema.js` (en el `<head>` para evitar el parpadeo): botón `#btn-tema` fijo, `localStorage`
  con `try/catch`, `matchMedia`, `DOMContentLoaded`. Sintaxis verificada con `node --check`.
- Modificar por **id o nombre**: el campo `producto` acepta los dos (regex `/^\d+$/`, como el
  buscador). Por nombre usa `buscarProductosPorNombreExacto` (`ilike` sin `%` = igual sin importar
  mayúsculas) y luego llama a `modificarProducto` con el id encontrado. Si hay 0 o más de 1
  coincidencia, no modifica nada y muestra los ids. Campo "Nombre" → "Nombre nuevo". Conceptos:
  el id es único y el nombre no; reusar una función en vez de duplicarla.
- **Eliminar** (`prueba2.js` + sección `#form-eliminar` en `prueba2.html`): `eliminarProducto(id)`
  con `.delete().eq().select()` y `return data.length > 0` (el `return !error` original daba `true`
  aunque se borraran 0 filas). La lógica "id o nombre → producto" pasó a `encontrarProducto(texto)`,
  que devuelve `{ producto }` o `{ mensaje }` y la usan modificar y eliminar. `confirm()` con el
  nombre real antes de borrar; botón rojo `.peligro`. Conceptos: delete sin coincidencias no es
  error, destructuring `{ producto, mensaje }`, shorthand `{ producto }`. Sintaxis verificada con
  `node --check`.
- **Rediseño de `prueba2.html` a tarjetas** (respaldo de la versión anterior en el scratchpad de la
  sesión): barra `sticky` con título, buscador, "+ Nuevo" y tema; grid de tarjetas
  (`repeat(auto-fill, minmax(230px, 1fr))`) con imagen 4:3, badges de id y descuento, precio final
  con el original tachado, disponible/agotado y botones ✏️ 🗑. Crear y editar comparten UN form
  dentro de un `<dialog>` (`showModal`, `::backdrop`, cerrar con clic afuera); `idEditando`
  (null = crear). Botones de las tarjetas con **delegación de eventos** (`closest`,
  `data-accion`/`data-id`). Aviso flotante (toast) con `setTimeout`/`clearTimeout`. Los productos
  cargan solos al abrir la página. Quitados "Traer productos", "Traer productos 2" y los forms
  separados de modificar/eliminar (con `encontrarProducto`); los 4 bloques de práctica
  (map/filter/JSON) quedaron plegados en `<details>`. `prueba2.js` ordenado en 3 partes: CRUD →
  pintar → eventos. Verificado con capturas en Edge headless (PC claro y celular oscuro, iframe
  de 390px): se cargan las tarjetas de Supabase. No se probó en headless abrir el modal.
- **Papelera** (soft delete) con la columna `eliminado_en` (timestamptz, null = en la tienda):
  🗑 hace `update` con `new Date().toISOString()`, ♻️ la vuelve `null` (los dos reusan
  `modificarProducto`), ❌ y "Vaciar papelera" hacen el `delete` real. Tienda y buscador filtran
  con `.is('eliminado_en', null)` y la papelera con `.not('eliminado_en', 'is', null)`. Botón
  "🗑 Papelera (n)" / "← Tienda" en la barra con la variable `vista`; `Promise.all` para traer las
  dos listas a la vez; las tarjetas de la papelera salen en gris (`grayscale`) y con la fecha
  (`toLocaleString('es-CO')`). Solo ❌ y vaciar piden `confirm()`. Si falta la columna (error
  `42703`), la página dice cómo crearla. Conceptos: soft delete, `IS NULL` vs `= null`, UTC vs hora
  local. Sintaxis verificada con `node --check`; captura sin la columna → muestra el aviso.
- Botón 🏠 (`#btn-inicio`) a la izquierda del título: vuelve a `vista = 'tienda'`, limpia la
  búsqueda y sube con `window.scrollTo({ top: 0, behavior: 'smooth' })`.

### Preguntas y decisiones

- ¿`modificarProducto` con `data[0] ?? null` (recomendado) o con `.single()`? → "la mejor opción"
  → **A (`?? null`)**.
- ¿Form de modificar que solo envía los campos llenos (recomendado) o reusar el form de crear? →
  "la mejor opción" → **form aparte**.
- Pidió modificar también por nombre, no solo por id → un solo campo para los dos. Si el nombre
  se repite, se pide el id (no se modifican todos).
- `eliminarProducto`: ¿arreglar `return !error` con `.select()` + `data.length > 0`, función
  compartida `encontrarProducto` y confirmación A (`confirm()`) o B (botón en la página)? → **sí, A**.
- Pidió organizarlo "más chévere", sin tanto scroll de formularios: ¿pestañas (recomendado),
  tarjetas con botones, panel lateral o acordeón? → **tarjetas con botones**. ¿Simplificar
  (quitar "Traer productos 2", datos crudos plegados) o dejar todo? → **simplificar**.
- Papelera: ¿columna `eliminado_en` en Supabase (recomendado) o copia en localStorage? →
  **columna en Supabase**. ¿Botón en la barra que cambia la vista (recomendado) o ventana
  flotante? → **botón en la barra**. Pendiente: que el estudiante cree la columna.
- ¿Qué botón de búsqueda no se ve, si "Buscar" ya está en el HTML? → **pendiente**.

### Errores y dudas

- "No veo el botón de activar búsqueda": el botón está en el HTML; posible caché del navegador o
  archivo distinto abierto → **pendiente** confirmar (con el rediseño el buscador quedó en la barra
  de arriba).
- En la tabla hay varios "Teclado Mecánico RGB" iguales (#4 a #8 o más): los fue creando el botón
  "Traer productos 2", uno por clic. Se pueden borrar con 🗑.
- Primera captura: las fotos rompían el 4:3 y la página se salía de lado en el celular (el `<img>`
  crecía a su tamaño real). Arreglado con `position: absolute; inset: 0` en la imagen y
  `min-width: 0` en la tarjeta.
- "Le doy 🏠 y no me lleva al home, sale *Falta la columna eliminado_en*" → 🏠 sí funciona, pero
  la tienda también filtra por `eliminado_en`, que no existe (error `42703`). Pidió que la creara
  yo: no se puede con la anon key (solo maneja filas; crear columnas = DDL, necesita el panel o
  la contraseña de la base). Se le dio el `alter table` para el SQL Editor → **pendiente** que la
  cree. Registrado en `registro_errores.csv`; explicación en `OUTPUT/explicacion_error_2026-10-29.md`.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-10-30

### Lo que hicimos

- `INPUT/supabase/cliente.html`: se le creó una hoja aparte `css/cliente.css` (azules) y se
  enlazó con `<link rel="stylesheet">`. No se tocó `styles.css` porque lo usa `index.html`.
- Conceptos: variables CSS (`:root` + `var(--blue)`) para cambiar la paleta en un solo lugar,
  `:focus` y `:hover` como estados, `flex-direction: column` para apilar label + input.
- Pidió "corrígeme tú los errores y déjalo listo" → `INPUT/supabase/js/cliente.js`:
  `registrarCliente` e `iniciarSesion` ahora devuelven `{ ..., error }` (mismo patrón que Supabase);
  nueva `mensajeDeError(error)` (Email not confirmed, Invalid login credentials, User already
  registered, 429); `mostrarEstadoSesion()` creada (`getSession()` + nombre desde
  `clientes_practica` con `maybeSingle()`, oculta forms o botón con `hidden`); listener de
  `#btn-logout` con `signOut()`; se llama al cargar la página. En `cliente.css`:
  `[hidden] { display: none !important; }` porque `form { display: flex }` le ganaba a `hidden`.
  Sintaxis verificada con `node --check`; no se probó en el navegador.
- Conceptos: devolver `{ data, error }` en vez de `null`, destructuring, sesión guardada en el
  navegador, atributo `hidden` vs CSS.
- Formulario "Mis datos" (después del login): `cliente.html` → `#form-datos` (nombre editable,
  correo `readonly`, oculto con `hidden`). `cliente.js` → `leerCliente(id)` (select de
  `id, nombre, correo` con `maybeSingle()`), `llenarFormularioDatos(cliente)` (pone `.value` en
  cada input), `actualizarCliente(id, cambios)` (`update().eq('id').select()`), listener de
  submit que solo manda `nombre`. Si la lectura o el update devuelven 0 filas, avisa que revise
  la política de RLS. `mostrarEstadoSesion()` ahora lee primero y después llena el form.
  `cliente.css`: estilo apagado para `input[readonly]` y `small`. Sintaxis OK con `node --check`;
  no se probó en el navegador.
- Conceptos: leer antes de editar, `.value` de un input, `update` siempre con `.eq()`,
  `.select()` después del `update` para saber si cambió algo, RLS devuelve 0 filas sin error.
- "Me faltan las otras columnas": se consultó la tabla con la anon key y tiene `id, created_at,
  nombre, correo, telefono, dirección, rol` (`dirección` CON tilde). Se agregaron `#datos-telefono`
  y `#datos-direccion` al form; `leerCliente`/`actualizarCliente` piden esas columnas; los `null`
  se muestran vacíos con `?? ''` y los campos vacíos se guardan como `null` con `|| null`.
  `node --check` OK; no probado en navegador.
- Hallazgo: con la anon key y **sin iniciar sesión** se pudo leer una fila de `clientes_practica`
  (nombre y correo de otra persona) → la política de select está abierta a todos o RLS está
  apagado. Se le recomendó cambiarla a `auth.uid() = id`.
- Conceptos: `??` vs `||`, columnas con tilde (`cliente['dirección']`), `null` vs `''`.
- Menú lateral: `cliente.html` → `<aside id="menu-lateral">` con ítems `🏠 Inicio` y
  `⚙️ Cambiar mis datos` (`data-vista`), "Cerrar sesión" movido al aside, botón `#btn-menu` (☰)
  para celular, `#vista-inicio` nueva y `#form-datos` renombrado a "Configuración de usuario";
  todo envuelto en `.layout` > `aside` + `main`. `cliente.js` → `mostrarVista(nombre)` (alterna
  `hidden`, marca `.activo` con `classList.toggle`, cierra el menú en celular), un listener por
  ítem con `dataset.vista`, listener del ☰ que alterna `.abierto`; `mostrarEstadoSesion()`
  muestra/oculta el menú y abre Inicio al entrar; `llenarFormularioDatos` ya no muestra el form.
  `cliente.css` → menú azul oscuro: en celular fuera de pantalla con `transform: translateX(-100%)`
  y `.abierto` lo trae; desde 768px queda fijo a la izquierda (`position: sticky`) y se oculta ☰.
  `node --check` OK; no probado en navegador.
- Conceptos: vistas con `hidden` en una sola página, atributos `data-*` + `dataset`,
  `classList.toggle(clase, condición)`, mobile-first + `@media (min-width)`, `transform` para
  menús que se deslizan.

### Preguntas y decisiones

- ¿Agrego el login + cerrar sesión en `cliente.js` con el plan propuesto? → "corrígeme tú los
  errores y déjalo listo" → **sí** (hecho).
- Error 429: ¿desactivar "Confirm email" (recomendado), esperar ~1 h o crear usuarios a mano? →
  **pendiente**.
- Login: ¿qué pasos hizo en Supabase (apagar *Confirm email* + Save, correr el `update` con su
  correo real)? → no respondió; volvió a pegar el error → **pendiente**.
- ¿Me manda captura del `select email, email_confirmed_at from auth.users`? → no respondió;
  pidió que yo lo corrigiera → **pendiente** (con el cambio de código el mensaje en pantalla ya
  dice si el correo no está confirmado).
- Pidió que la bitácora registre **todo** lo de cada sesión, siempre (cambios, preguntas,
  errores) → se revisó la entrada de hoy y se completaron las preguntas que faltaban.
- Pidió un formulario "Mis datos" que aparezca después del login: primero leer el cliente de
  `clientes_practica` y llenar los campos con esos datos, luego hacer el `update`. Se le mostró
  el plan y se le preguntó: ¿qué campos se editan (solo `nombre` recomendado; `correo` exige
  `auth.updateUser` + correo de confirmación; `rol` nunca)? ¿tiene columnas extra en la tabla?
  ¿ya tiene políticas RLS de `select`/`update` con `auth.uid() = id`? → "me sirve así" →
  **solo `nombre` editable, correo de solo lectura, sin `rol`**. Columnas extra y políticas RLS
  → no respondió (**pendiente**; se asumió que no hay columnas extra y el código avisa si RLS
  bloquea). → Luego dijo "me faltan las otras columnas" → se agregaron `telefono` y `dirección`.
- ¿Renombrar `dirección` a `direccion` (sin tilde) en Supabase? → **pendiente** (opcional).
- ¿Cerrar la política de select de `clientes_practica` a `auth.uid() = id`? → **pendiente**.
- Pidió un "asideback" (menú lateral, `<aside>`) con un ítem "Configuración de usuario" para
  cambiar los datos. Se le mostró el plan y se le preguntó: ¿"asideback" = menú lateral normal o
  incluye botón de volver? ¿qué otros ítems lleva (solo Inicio + Configuración recomendado)? ¿en
  celular menú ☰ que se abre (recomendado) o barra arriba? → "sí, como un botón que diga lo de
  cambios" → **menú lateral con botón "⚙️ Cambiar mis datos"**. Ítems y celular no los respondió
  → se usó lo recomendado (Inicio + Cambiar mis datos, ☰ en celular).
- ¿Qué aprendió o qué le costó de la clase de hoy? → **pendiente**.

### Errores y dudas

- "Después de crear la cuenta no me deja iniciar sesión": `cliente.js` no tenía listener para
  `#form-login` (ni `#btn-logout`), así que el form solo recargaba la página. Mismo caso que
  "Crear producto" (2026-10-23). Registrado en `registro_errores.csv`; explicación en
  `OUTPUT/explicacion_error_2026-10-30.md`.
- Al crear otra cuenta: `429 Too Many Requests` / `email rate limit exceeded`. Cada `signUp()`
  manda un correo de confirmación y el SMTP por defecto de Supabase permite muy pocos por hora.
  Concepto: rate limit, códigos HTTP 4xx. Registrado en `registro_errores.csv`; explicación en
  `OUTPUT/explicacion_error_2026-10-30_b.md`.
- El estudiante agregó por su cuenta `iniciarSesion()` + listener de `#form-login`. Dice que con
  datos correctos sale "Correo o contraseña incorrectos" y un error en consola. Ese texto sale con
  **cualquier** `error` de Supabase, así que esconde la causa real. Sospechas: `Email not confirmed`
  o `Invalid login credentials` (la cuenta no se creó por el 429). Además `mostrarEstadoSesion()`
  no existe en el archivo → `ReferenceError` cuando el login sí funcione.
  → Consola: `400` / `AuthApiError: Email not confirmed`. Solución: desactivar *Confirm email* y
  confirmar la cuenta ya creada con `update auth.users set email_confirmed_at = now() ...`.
  Registrado en `registro_errores.csv`; explicación en `OUTPUT/explicacion_error_2026-10-30_c.md`.
- "Sigue saliendo error": el mismo `Email not confirmed` 3 veces. La cuenta sigue sin confirmar
  (¿no corrió el `update`, o no coincidió el correo?). Se le dio un `select` para verificar y el
  `update ... returning` para ver si sí cambió una fila → **pendiente** confirmar qué pasos hizo.
- Volvió a pegar el mismo error sin decir qué pasos hizo → se le pidió captura del `select` de
  `auth.users` y se le dio un camino alterno (borrar el usuario y registrarse de nuevo con
  *Confirm email* apagado) → **pendiente**.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-11-05

### Lo que hicimos

- `INPUT/supabase/prueba2.html` / `js/prueba2.js`: diagnóstico de RLS en `productos_practica`
  (sin cambios de código). Conceptos: RLS on/off, policies *permissive* se suman con OR, roles
  `anon` vs `authenticated`, sesión guardada en `localStorage` compartida entre páginas del mismo origen.

### Preguntas y decisiones

- ¿Qué querías lograr: (a) que solo los logueados vean productos, o (b) que cada usuario vea solo
  los suyos (`auth.uid() = user_id`)? → **pendiente**.
- Se le pidió correr `pg_class.relrowsecurity`, `pg_policies` y `getSession()` en consola →
  respondió: "era por tener la sesión iniciada" (causa 3).
- Nueva pregunta: ¿(a) solo logueados ven productos, (b) cada uno ve los suyos, o (c) todos ven y
  solo logueados editan? → **pendiente**.

### Errores y dudas

- "Activé una policy pero me siguen apareciendo los productos": policy `ver_productos`
  (SELECT, `to authenticated`, `using (true)`). La página usa anon key. Causas posibles: RLS
  apagado, otra policy de SELECT para `public`/`anon`, o sesión activa heredada de `cliente.html`.
  Registrado en `registro_errores.csv`; explicación en `OUTPUT/explicacion_error_2026-11-05.md`.
  → **Causa confirmada:** tenía sesión iniciada (desde `cliente.html`, mismo origen = mismo
  `localStorage`), así que consultaba como `authenticated` y `using (true)` le dejaba ver todo.
  La policy funcionaba bien.
- Al agregar producto: `401` + `prueba2.js:80 Error al agregar: Object`. Ya sin sesión (`anon`),
  y la tabla solo tiene policy de SELECT → RLS bloquea el INSERT (`42501`). Además
  `.insert().select()` pide también permiso de SELECT. Conceptos: 401 vs 403, `using` vs
  `with check`. Se le pidió loguear `error.code`/`error.message`. Registrado en
  `registro_errores.csv`; explicación en `OUTPUT/explicacion_error_2026-11-05.md`.
  → ¿Quién puede insertar: solo `authenticated` (recomendado) o también `anon`? → respondió
  indirectamente: lo intentó **con sesión iniciada** (implica `authenticated`).
- Con sesión: `403 Forbidden` + `42501 new row violates row-level security policy`. Falta la policy
  de INSERT (solo existía SELECT). Se le dio SQL para INSERT, y se anticiparon UPDATE (editar y
  papelera) y DELETE, que fallan **sin error** (0 filas). **3er error de RLS hoy** → se sugirió
  repasar la tabla operación → cláusula. Registrado en `registro_errores.csv` y en
  `OUTPUT/explicacion_error_2026-11-05.md`. ¿Ya funcionó con las policies? → **pendiente**.
- Nueva tarea: observar la vulnerabilidad de `clientes_practica` (RLS apagado). Se aclaró que la
  `anon key` es del proyecto, no de la tabla, y es pública por diseño. Se propuso un plan de 5 pasos
  (key en inspector → lectura desde consola → `curl` → activar RLS con `auth.uid() = id` y proteger
  `rol` → verificar). ¿Confirma el plan y quién ejecuta (él guiado / yo el `curl`)? → "si" al plan;
  no eligió ejecutor → se fue con lo recomendado (él ejecuta, yo guío).
- Paso 1 (guiado): key en *Sources* (`supabaseClient.js`), en *Network* (headers `apikey` y
  `authorization: Bearer`, que cambia con sesión → explica 401 vs 403) y decodificar el JWT con
  `atob` (`role: "anon"`). Conceptos: el JS del cliente es público, JWT, anon key vs `service_role`.
  ¿Qué `role` le salió? → **pendiente** (pasó directo a pedir el paso 2).
- Paso 2 (guiado): comando de consola `db.from('clientes_practica').select('*')` + `console.table`,
  y versión "atacante" con `fetch` a `/rest/v1/clientes_practica` usando solo URL + anon key.
  Conceptos: Supabase expone cada tabla como API REST; sin RLS, `anon` lee todo.
  ¿Cuántas filas/columnas le salieron? → **pendiente**.
- Paso 3 (guiado): comando `curl` POST a `/rest/v1/clientes_practica` con solo la anon key,
  insertando `rol:"admin"` sin login. Demuestra que sin RLS cualquiera puede insertar con
  cualquier rol. ¿Regresó la fila? → **pendiente**.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_

## 2026-11-06

### Lo que hicimos

- Subir el proyecto a GitHub propio (`valentinab29/agenteEjemplo`). El `origin` apuntaba al repo
  del profe (`julianbejarano/agenteEjemplo`) → se renombró a `upstream` y el repo propio quedó como
  `origin`. Se pidió subir **todo**, incluidos `.vscode/` y `.claude/settings.local.json` (solo tiene la
  anon key, `role: "anon"`, pública por diseño). Se configuró `user.name`/`user.email` solo para este repo.
  Conceptos: `remote` (`origin` vs `upstream`), `.gitignore`, `git push -u`, config local vs global.

### Preguntas y decisiones

- ¿Confirma el plan y cuál es la URL del repo? → pasó `https://github.com/valentinab29/agenteEjemplo`
  (se toma como confirmación).
- ¿Repo público o privado? → **pendiente**.

### Errores y dudas

- `fatal: detected dubious ownership` en git: el disco `D:` no registra dueños de archivos. Se
  evitó con `-c safe.directory=*` por comando, sin tocar la config global.

### Reflexión

_(pendiente: se pregunta al cierre de la sesión)_
