// Array de objetos: cada uno es una emoción con la misma "forma" (mismas
// propiedades), eso es lo que permite recorrerlas todas igual más abajo.
// "color" es el color distintivo del personaje — el CSS lo usa para pintar
// el fondo y el brillo de cada carta con color-mix(), mezclado con blanco
// o negro según el modo claro/oscuro.
// "esMasculino" es un extra (no pedido en la lista, pero se necesita para
// escribir bien "Nuevo"/"Nueva" según cómo se representa a cada personaje
// en la película, sin importar el género gramatical de la palabra en
// español — "la ira" es femenina, pero el personaje es hombre).
let heroes = [
  {
    nombre: "Alegría",
    color: "#FFD400",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPx0sbDj8XGkgOkFnsc9eZ1u1--yF8UR8d7B3NCUjLEw&s=10",
    edad: 0,
    nivelIntensidad: 92,
    esNueva: false,
    esMasculino: false,
    emocionesRelacionadas: ["Tristeza", "Ansiedad"],
  },
  {
    nombre: "Tristeza",
    color: "#3B82C4",
    imagen: "https://www.sdpnoticias.com/resizer/v2/23VJ7VWKEBHHTK2O2SFC2573ZQ.png?smart=true&auth=5de99a69dee041f90a46311fb27a31738ba0801153da6ff3c58c61143fcc4713&width=1440&height=810",
    edad: 0,
    nivelIntensidad: 68,
    esNueva: false,
    esMasculino: false,
    emocionesRelacionadas: ["Alegría", "Miedo"],
  },
  {
    nombre: "Ira",
    color: "#E53E3E",
    imagen: "https://media.tycsports.com/files/2024/07/04/737723/furia_862x485.webp",
    edad: 0,
    nivelIntensidad: 85,
    esNueva: false,
    esMasculino: true,
    emocionesRelacionadas: ["Ansiedad", "Envidia"],
  },
  {
    nombre: "Miedo",
    color: "#8B5FBF",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTURHLx5yPLwSwMJEfLsHbE5GH6Spzs6B3G7KviZqKfnw&s=10",
    edad: 0,
    nivelIntensidad: 74,
    esNueva: false,
    esMasculino: true,
    emocionesRelacionadas: ["Ansiedad", "Vergüenza"],
  },
  {
    nombre: "Desagrado",
    color: "#4CAF50",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdek68sQfELEAxQkkMXToyGEE0zj2NGfgHBUFT_UoJ5A&s=10",
    edad: 0,
    nivelIntensidad: 61,
    esNueva: false,
    esMasculino: false,
    emocionesRelacionadas: ["Vergüenza", "Envidia"],
  },
  {
    nombre: "Ansiedad",
    color: "#FF8C32",
    imagen: "https://i.redd.it/bssq0x6kuv6f1.jpeg",
    edad: 13,
    nivelIntensidad: 97,
    esNueva: true,
    esMasculino: false,
    emocionesRelacionadas: ["Alegría", "Aburrimiento"],
  },
  {
    nombre: "Envidia",
    color: "#2FBF9F",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK5b7M6H1NgKeK6Pddb6HTlclRA2iCUlhP2WL50ixRHA&s=10",
    edad: 13,
    nivelIntensidad: 58,
    esNueva: true,
    esMasculino: false,
    emocionesRelacionadas: ["Ira", "Desagrado"],
  },
  {
    nombre: "Vergüenza",
    color: "#C2185B",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQj7T2y3e1lcRY8la6hUDkLFeshG7NZCRriQrqI1ClCA&s=10",
    edad: 13,
    nivelIntensidad: 64,
    esNueva: true,
    esMasculino: true,
    emocionesRelacionadas: ["Miedo", "Aburrimiento"],
  },
  {
    nombre: "Aburrimiento",
    color: "#7A8B99",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlUlqLu4T_SEwKiR3StLqqJRwivf3wMUcm3pxvKZNggQ&s=10",
    edad: 13,
    nivelIntensidad: 40,
    esNueva: true,
    esMasculino: false,
    emocionesRelacionadas: ["Ansiedad", "Envidia"],
  },
];

const cardContainer = document.getElementById("card-container");
const contador = document.getElementById("contador");

// Cuántas cartas de la baraja se ven a la vez (la de adelante + las que
// asoman la punta detrás). Con 3 alcanza para que se note el efecto de pila.
const NUM_CAPAS = 3;

// "orden" tiene los índices de heroes en el orden en que les toca pasar al
// frente. Solo orden[0], orden[1] y orden[2] están dibujados en pantalla en
// un momento dado; el resto del array "espera su turno" sin renderizarse.
let orden = heroes.map((_, indice) => indice);

// Evita que un clic interrumpa la animación de otro clic a la mitad.
let animando = false;

// Debe coincidir con la transición de ".card" en el CSS (0.4s = 400ms).
const DURACION_STACK = 400;

// Limpia una carta (<div class="card">) y la vuelve a llenar con los datos
// de un héroe distinto — así reciclamos las mismas 3 cartas en vez de crear
// y borrar elementos nuevos en cada clic.
function pintarCarta(card, heroe) {
  card.innerHTML = "";
  card.style.setProperty("--color-carta", heroe.color);

  // Imagen
  const imgHeroe = document.createElement("img");
  imgHeroe.className = "card-imagen";
  imgHeroe.src = heroe.imagen;
  imgHeroe.alt = heroe.nombre;

  // Nombre
  const nombreHeroe = document.createElement("h2");
  nombreHeroe.className = "card-nombre";
  nombreHeroe.textContent = heroe.nombre;

  // Bloque de datos: un <p> por cada dato del objeto
  const datos = document.createElement("div");
  datos.className = "card-datos";

  const edadHeroe = document.createElement("p");
  edadHeroe.textContent = heroe.edad === 0
    ? "Con Riley desde que nació"
    : `Con Riley desde los ${heroe.edad} años`;

  const intensidadHeroe = document.createElement("p");
  intensidadHeroe.textContent = `Nivel de intensidad: ${heroe.nivelIntensidad}/100`;

  // "esNueva" (booleano) decide el texto; "esMasculino" decide el género
  // del adjetivo ("Nuevo" vs. "Nueva").
  const nuevaHeroe = document.createElement("p");
  nuevaHeroe.textContent = heroe.esNueva
    ? `${heroe.esMasculino ? "Nuevo" : "Nueva"} en Intensamente 2`
    : "Emoción original, desde la primera película";

  datos.append(edadHeroe, intensidadHeroe, nuevaHeroe);

  // Lista de emociones relacionadas: como heroe.emocionesRelacionadas es un
  // array, necesita su propio forEach para crear un <li> por cada una.
  const relacionadasHeroe = document.createElement("ul");
  relacionadasHeroe.className = "card-relacionadas";
  heroe.emocionesRelacionadas.forEach(relacionada => {
    const li = document.createElement("li");
    li.textContent = relacionada;
    relacionadasHeroe.appendChild(li);
  });

  card.append(imgHeroe, nombreHeroe, datos, relacionadasHeroe);
}

// Crea las NUM_CAPAS cartas UNA sola vez al cargar la página. "capas[i]"
// siempre apunta al <div class="card"> que está físicamente en la posición
// i de la baraja; a medida que se navega, se reasignan (ver siguiente/anterior)
// en vez de crear divs nuevos cada vez.
const capas = [];
for (let i = 0; i < NUM_CAPAS; i++) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.pos = String(i);
  pintarCarta(card, heroes[orden[i]]);
  cardContainer.appendChild(card);
  capas.push(card);
}

function actualizarContador() {
  contador.textContent = `${orden[0] + 1} / ${heroes.length}`;
}
actualizarContador();

// Pasa a la siguiente emoción: la carta de adelante (capas[0]) se desliza
// a la posición "oculta" (definida en el CSS) y desaparece; las capas 1 y 2
// avanzan un puesto. Cuando termina la animación de salida, se recicla la
// carta que salió: se le pinta la próxima emoción en la fila y se manda de
// una vez (sin transición) a la posición 2, porque ya está invisible.
function siguiente() {
  if (animando) return;
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
    pintarCarta(saliente, heroes[orden[2]]);
    saliente.dataset.pos = "2";
    void saliente.offsetWidth; // fuerza el reflow para que el salto sea instantáneo
    saliente.classList.remove("sin-transicion");

    capas[0] = capa1;
    capas[1] = capa2;
    capas[2] = saliente;

    actualizarContador();
    animando = false;
  }, DURACION_STACK);
}

// Pasa a la emoción anterior: es el mismo truco pero al revés. La carta que
// estaba al fondo (capas[2]) se recicla con la emoción que le toca al frente,
// se manda sin transición a "oculta" (como si viniera de atrás de la pila) y
// al frame siguiente sí se anima hacia la posición 0, mientras las otras dos
// retroceden un puesto.
function anterior() {
  if (animando) return;
  animando = true;

  const entrante = capas[2];
  const capa0 = capas[0];
  const capa1 = capas[1];

  orden.unshift(orden.pop());

  entrante.classList.add("sin-transicion");
  pintarCarta(entrante, heroes[orden[0]]);
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
  setTimeout(() => {
    animando = false;
  }, DURACION_STACK);
}

const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");

btnAnterior.addEventListener("click", anterior);
btnSiguiente.addEventListener("click", siguiente);

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
