let emociones = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
    nombre: "Furia",
    color: "#E53E3E",
    imagen: "https://media.tycsports.com/files/2024/07/04/737723/furia_862x485.webp",
    edad: 0,
    nivelIntensidad: 85,
    esNueva: false,
    esMasculino: true,
    emocionesRelacionadas: ["Ansiedad", "Envidia"],
  },
  {
    id: 4,
    nombre: "Temor",
    color: "#8B5FBF",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTURHLx5yPLwSwMJEfLsHbE5GH6Spzs6B3G7KviZqKfnw&s=10",
    edad: 0,
    nivelIntensidad: 74,
    esNueva: false,
    esMasculino: true,
    emocionesRelacionadas: ["Ansiedad", "Vergüenza"],
  },
  {
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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

// Si gestion.html ya guardó una versión más nueva en localStorage (ej. con
// una emoción agregada desde el form de Crear), se usa esa en vez de la lista
// fija de arriba — así index.html y gestion.html "ven" los mismos datos.
// El "|| legacy" es solo para migrar una sola vez lo que haya quedado
// guardado con el nombre de key anterior ("heroes"), de cuando el tema
// todavía se llamaba así en el código.
const emocionesGuardadas = localStorage.getItem("emociones") || localStorage.getItem("heroes");
if (emocionesGuardadas) {
  emociones = JSON.parse(emocionesGuardadas);
  localStorage.setItem("emociones", emocionesGuardadas);
  localStorage.removeItem("heroes");
}

// Devuelve el id más alto que haya en "emociones" (0 si ninguna tiene id).
function mayorId() {
  let mayor = 0;
  emociones.forEach(emocion => {
    if (typeof emocion.id === "number" && emocion.id > mayor) {
      mayor = emocion.id;
    }
  });
  return mayor;
}

// Lo guardado en localStorage antes de que existieran los ids no trae "id".
// A esas emociones se les asigna uno a partir del mayor id que ya exista, y
// se vuelve a guardar para que el id quede fijo en las próximas recargas.
let idFaltante = mayorId() + 1;
let huboIdsNuevos = false;
emociones.forEach(emocion => {
  if (typeof emocion.id !== "number") {
    emocion.id = idFaltante;
    idFaltante++;
    huboIdsNuevos = true;
  }
});
if (huboIdsNuevos) {
  localStorage.setItem("emociones", JSON.stringify(emociones));
}

// Id que recibirá la próxima emoción creada desde gestion.html. Se calcula
// al cargar a partir de los datos reales, así nunca repite un id existente.
let siguienteId = mayorId() + 1;

