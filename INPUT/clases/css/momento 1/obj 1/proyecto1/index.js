// El arreglo "emociones" ahora vive en data.js — este archivo lo usa tal cual
// llega de ahí, por eso index.html debe cargar data.js ANTES que index.js.
const cardContainer = document.getElementById("card-container");
const contador = document.getElementById("contador");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const contenedorFiltros = document.getElementById("filtros-botones");
const sliderIntensidad = document.getElementById("slider-intensidad");
const valorIntensidad = document.getElementById("valor-intensidad");
const btnQuitarIntensidad = document.getElementById("quitar-intensidad");
const mensajeSinResultados = document.getElementById("sin-resultados");

// Cuántas cartas de la baraja se ven a la vez (la de adelante + las que
// asoman la punta detrás). Con 3 alcanza para que se note el efecto de pila.
const NUM_CAPAS = 3;

// Nombre de la emoción relacionada por la que se está filtrando; "" = sin
// filtro (se muestran todas).
let filtroActual = "";

// Valor elegido en el slider vertical; null = sin filtro de intensidad (así
// arranca la página, y así queda al tocar "Quitar").
let intensidadElegida = null;

// Cuánto puede alejarse nivelIntensidad del valor del slider para que la
// emoción pase el filtro: con 10, el slider en 60 deja pasar de 50 a 70.
const RANGO_INTENSIDAD = 10;

// true si llegó un cambio de filtro mientras había una animación en curso;
// terminarAnimacion() lo aplica apenas la animación acaba.
let filtroPendiente = false;

// Índices (en "emociones") de las emociones que pasan el filtro actual, en su
// orden original. Sirve para saber en qué posición del resultado vamos.
let indicesFiltrados = emociones.map((_, indice) => indice);

// "orden" tiene los índices de emociones en el orden en que les toca pasar al
// frente. Solo orden[0], orden[1] y orden[2] están dibujados en pantalla en
// un momento dado; el resto del array "espera su turno" sin renderizarse.
let orden = [...indicesFiltrados];

// Evita que un clic interrumpa la animación de otro clic a la mitad.
let animando = false;

// Debe coincidir con la transición de ".card" en el CSS (0.4s = 400ms).
const DURACION_STACK = 400;

// Limpia una carta (<div class="card">) y la vuelve a llenar con los datos
// de una emoción distinta — así reciclamos las mismas 3 cartas en vez de crear
// y borrar elementos nuevos en cada clic.
function pintarCarta(card, emocion) {
  card.innerHTML = "";
  card.style.setProperty("--color-carta", emocion.color);

  // Imagen
  const imgEmocion = document.createElement("img");
  imgEmocion.className = "card-imagen";
  imgEmocion.src = emocion.imagen;
  imgEmocion.alt = emocion.nombre;

  // Nombre
  const nombreEmocion = document.createElement("h2");
  nombreEmocion.className = "card-nombre";
  nombreEmocion.textContent = emocion.nombre;

  // Bloque de datos: un <p> por cada dato del objeto
  const datos = document.createElement("div");
  datos.className = "card-datos";

  const edadEmocion = document.createElement("p");
  edadEmocion.textContent = emocion.edad === 0
    ? "Con Riley desde que nació"
    : `Con Riley desde los ${emocion.edad} años`;

  const intensidadEmocion = document.createElement("p");
  intensidadEmocion.textContent = `Nivel de intensidad: ${emocion.nivelIntensidad}/100`;

  // "esNueva" (booleano) decide el texto; "esMasculino" decide el género
  // del adjetivo ("Nuevo" vs. "Nueva").
  const nuevaEmocion = document.createElement("p");
  nuevaEmocion.textContent = emocion.esNueva
    ? `${emocion.esMasculino ? "Nuevo" : "Nueva"} en Intensamente 2`
    : "Emoción original, desde la primera película";

  datos.append(edadEmocion, intensidadEmocion, nuevaEmocion);

  // Lista de emociones relacionadas: como emocion.emocionesRelacionadas es un
  // array, necesita su propio forEach para crear un <li> por cada una.
  const relacionadasEmocion = document.createElement("ul");
  relacionadasEmocion.className = "card-relacionadas";
  emocion.emocionesRelacionadas.forEach(relacionada => {
    const li = document.createElement("li");
    li.textContent = relacionada;
    relacionadasEmocion.appendChild(li);
  });

  card.append(imgEmocion, nombreEmocion, datos, relacionadasEmocion);
}

// Crea las NUM_CAPAS cartas UNA sola vez al cargar la página. "capas[i]"
// siempre apunta al <div class="card"> que está físicamente en la posición
// i de la baraja; a medida que se navega, se reasignan (ver siguiente/anterior)
// en vez de crear divs nuevos cada vez. El contenido lo pone pintarBaraja().
const capas = [];
for (let i = 0; i < NUM_CAPAS; i++) {
  const card = document.createElement("div");
  card.className = "card";
  cardContainer.appendChild(card);
  capas.push(card);
}

function actualizarContador() {
  if (orden.length === 0) {
    contador.textContent = "0 / 0";
    return;
  }
  // Posición de la carta de adelante DENTRO del resultado filtrado (ej. "2 / 4"),
  // no dentro de todas las emociones.
  contador.textContent = `${indicesFiltrados.indexOf(orden[0]) + 1} / ${orden.length}`;
}

// Vuelve a pintar la baraja desde cero, sin animación, según "orden". Si el
// filtro deja menos de 3 emociones, las capas sobrantes se ocultan (si no,
// pintarCarta recibiría "undefined" y la página se rompería). Con 1 sola
// emoción no hay a dónde navegar, así que se desactivan las flechas.
function pintarBaraja() {
  capas.forEach((card, i) => {
    card.classList.add("sin-transicion");
    card.dataset.pos = String(i);
    if (i < orden.length) {
      pintarCarta(card, emociones[orden[i]]);
      card.hidden = false;
    } else {
      card.hidden = true;
    }
    void card.offsetWidth; // fuerza el reflow para que el salto sea instantáneo
    card.classList.remove("sin-transicion");
  });

  const hayAdondeIr = orden.length > 1;
  btnAnterior.disabled = !hayAdondeIr;
  btnSiguiente.disabled = !hayAdondeIr;
  mensajeSinResultados.hidden = orden.length > 0;
  actualizarContador();
}

// Se llama al final de cada animación (siguiente/anterior): libera el
// candado "animando" y, si mientras tanto se movió el slider o se eligió
// otro filtro, lo aplica ahora para no perder ese último cambio.
function terminarAnimacion() {
  animando = false;
  if (filtroPendiente) {
    aplicarFiltro();
  }
}
pintarBaraja();

// Pasa a la siguiente emoción: la carta de adelante (capas[0]) se desliza
// a la posición "oculta" (definida en el CSS) y desaparece; las capas 1 y 2
// avanzan un puesto. Cuando termina la animación de salida, se recicla la
// carta que salió: se le pinta la próxima emoción en la fila y se manda de
// una vez (sin transición) a la posición 2, porque ya está invisible.
function siguiente() {
  if (animando || orden.length < 2) return;

  // La animación necesita las 3 capas llenas; con 2 emociones filtradas
  // solo se rota el orden y se repinta sin animación.
  if (orden.length < NUM_CAPAS) {
    orden.push(orden.shift());
    pintarBaraja();
    return;
  }

  animando = true;

  const saliente = capas[0];
  const capa1 = capas[1];
  const capa2 = capas[2];

  saliente.dataset.pos = "oculta";
  capa1.dataset.pos = "0";
  capa2.dataset.pos = "1";

  setTimeout(() => {
    orden.push(orden.shift());

    saliente.classList.add("sin-transicion");
    pintarCarta(saliente, emociones[orden[2]]);
    saliente.dataset.pos = "2";
    void saliente.offsetWidth; // fuerza el reflow para que el salto sea instantáneo
    saliente.classList.remove("sin-transicion");

    capas[0] = capa1;
    capas[1] = capa2;
    capas[2] = saliente;

    actualizarContador();
    terminarAnimacion();
  }, DURACION_STACK);
}

// Pasa a la emoción anterior: es el mismo truco pero al revés. La carta que
// estaba al fondo (capas[2]) se recicla con la emoción que le toca al frente,
// se manda sin transición a "oculta" (como si viniera de atrás de la pila) y
// al frame siguiente sí se anima hacia la posición 0, mientras las otras dos
// retroceden un puesto.
function anterior() {
  if (animando || orden.length < 2) return;

  if (orden.length < NUM_CAPAS) {
    orden.unshift(orden.pop());
    pintarBaraja();
    return;
  }

  animando = true;

  const entrante = capas[2];
  const capa0 = capas[0];
  const capa1 = capas[1];

  orden.unshift(orden.pop());

  entrante.classList.add("sin-transicion");
  pintarCarta(entrante, emociones[orden[0]]);
  entrante.dataset.pos = "oculta";
  void entrante.offsetWidth;
  entrante.classList.remove("sin-transicion");

  requestAnimationFrame(() => {
    entrante.dataset.pos = "0";
    capa0.dataset.pos = "1";
    capa1.dataset.pos = "2";
  });

  capas[0] = entrante;
  capas[1] = capa0;
  capas[2] = capa1;

  actualizarContador();
  setTimeout(terminarAnimacion, DURACION_STACK);
}

btnAnterior.addEventListener("click", anterior);
btnSiguiente.addEventListener("click", siguiente);

// Deja en la baraja solo las emociones que cumplen LOS DOS filtros a la vez:
// tienen a "filtroActual" en emocionesRelacionadas ("" = cualquiera) Y su
// nivelIntensidad está a RANGO_INTENSIDAD o menos de intensidadElegida
// (null = cualquiera). Luego la vuelve a pintar desde la primera del resultado.
function aplicarFiltro() {
  marcarFiltroActivo();

  // Si se filtra a mitad de una animación, el setTimeout de siguiente()
  // terminaría pintando sobre la baraja nueva. En vez de ignorar el cambio,
  // se deja anotado y terminarAnimacion() lo aplica al acabar.
  if (animando) {
    filtroPendiente = true;
    return;
  }
  filtroPendiente = false;

  indicesFiltrados = [];
  emociones.forEach((emocion, indice) => {
    const pasaRelacionada = filtroActual === "" || emocion.emocionesRelacionadas.includes(filtroActual);
    // Math.abs da la distancia sin signo: 58 y 62 están ambos a 2 de 60.
    const pasaIntensidad = intensidadElegida === null
      || Math.abs(emocion.nivelIntensidad - intensidadElegida) <= RANGO_INTENSIDAD;
    if (pasaRelacionada && pasaIntensidad) {
      indicesFiltrados.push(indice);
    }
  });

  // Con el slider activo, la más cercana al valor elegido va adelante. sort
  // recibe una función que compara dos elementos: si devuelve un número
  // negativo, "a" va antes que "b". Restar las distancias logra justo eso.
  if (intensidadElegida !== null) {
    const distancia = indice => Math.abs(emociones[indice].nivelIntensidad - intensidadElegida);
    indicesFiltrados.sort((a, b) => distancia(a) - distancia(b));
  }
  orden = [...indicesFiltrados];

  pintarBaraja();
}

// Cuántos botones de emoción relacionada se muestran además de "Todas".
const NUM_FILTROS_RELACIONADOS = 2;

// Crea un botón "Todas" + uno por cada uno de los NUM_FILTROS_RELACIONADOS
// nombres que más se repiten en los emocionesRelacionadas (los que tienen
// más emociones en común). Se arma a partir de los datos (no escrito a mano
// en el HTML), así si gestion.html cambia las emociones, los filtros se
// recalculan solos.
function crearBotonesFiltro() {
  // Objeto usado como "contador": cada clave es un nombre y su valor es en
  // cuántas emociones aparece. Ej: { Ansiedad: 4, Envidia: 3, ... }
  const repeticiones = {};
  emociones.forEach(emocion => {
    emocion.emocionesRelacionadas.forEach(relacionada => {
      // Si el nombre todavía no está, (undefined || 0) arranca en 0.
      repeticiones[relacionada] = (repeticiones[relacionada] || 0) + 1;
    });
  });

  // Object.keys da el arreglo de nombres. Se ordena de más a menos
  // repeticiones; si empatan, alfabéticamente (localeCompare respeta las
  // tildes del español). slice se queda solo con los primeros.
  const nombres = Object.keys(repeticiones)
    .sort((a, b) => repeticiones[b] - repeticiones[a] || a.localeCompare(b, "es"))
    .slice(0, NUM_FILTROS_RELACIONADOS);

  ["", ...nombres].forEach(nombre => {
    const boton = document.createElement("button");
    boton.className = "filtro-boton";
    boton.dataset.filtro = nombre;
    boton.textContent = nombre === "" ? "Todas" : nombre;
    boton.addEventListener("click", () => {
      filtroActual = nombre;
      aplicarFiltro();
    });
    contenedorFiltros.appendChild(boton);
  });
}

// Resalta (clase "activo") solo el botón del filtro que está aplicado.
function marcarFiltroActivo() {
  contenedorFiltros.querySelectorAll(".filtro-boton").forEach(boton => {
    boton.classList.toggle("activo", boton.dataset.filtro === filtroActual);
  });
}

crearBotonesFiltro();
marcarFiltroActivo();

// "input" se dispara en CADA movimiento del thumb (mientras se arrastra);
// "change" solo al soltarlo. Por eso se usa "input": la baraja se actualiza
// en vivo. Ojo: .value de un input SIEMPRE es texto ("60"), así que se
// convierte con Number() antes de hacer cuentas con él.
sliderIntensidad.addEventListener("input", function () {
  intensidadElegida = Number(sliderIntensidad.value);
  // Math.max/Math.min "recortan" el rango para que no muestre -5 o 105.
  const desde = Math.max(0, intensidadElegida - RANGO_INTENSIDAD);
  const hasta = Math.min(100, intensidadElegida + RANGO_INTENSIDAD);
  valorIntensidad.textContent = `${desde}–${hasta}`;
  btnQuitarIntensidad.hidden = false;
  aplicarFiltro();
});

// Vuelve al estado inicial: sin filtro de intensidad y thumb en el medio.
btnQuitarIntensidad.addEventListener("click", function () {
  intensidadElegida = null;
  sliderIntensidad.value = "50";
  valorIntensidad.textContent = "Todas";
  btnQuitarIntensidad.hidden = true;
  aplicarFiltro();
});

// Modo oscuro: un solo listener que alterna (toggle) la clase "dark-mode"
// en el <body>. El resto de la apariencia dark-mode vive en style.css,
// acá solo se prende/apaga la clase y se cambia el texto/ícono del botón.
const toggleModo = document.getElementById("toggle-modo");
toggleModo.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    toggleModo.textContent = "☀️ Modo claro";
  } else {
    toggleModo.textContent = "🌙 Modo oscuro";
  }
});
