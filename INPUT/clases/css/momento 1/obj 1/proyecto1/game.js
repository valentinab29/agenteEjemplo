// JS de game.html: valida el formulario de ingreso y, si todo cumple, pasa
// a la sección del juego.
const formIngreso = document.getElementById("form-ingreso");
const inputNombre = document.getElementById("ingreso-nombre");
const inputAlias = document.getElementById("ingreso-alias");
const inputEmail = document.getElementById("ingreso-email");
const inputPassword = document.getElementById("ingreso-password");
const ingresoMensaje = document.getElementById("ingreso-mensaje");
const seccionIngreso = document.getElementById("ingreso");
const seccionJuego = document.getElementById("juego");
const juegoSaludo = document.getElementById("juego-saludo");

// Regla del email, pieza por pieza (ej. "riley.andersen+juego@correo.com.co"):
//   (?!.*\.\.)              -> lookahead NEGATIVO: falla si en algún lugar hay
//                              dos puntos seguidos ("ana..g@x.com")
//   (?!\.)                  -> tampoco puede empezar con punto (".ana@x.com")
//   [\p{L}\p{N}._%+-]+      -> parte antes del @: letras (con tildes/ñ),
//                              números y . _ % + -   (el + = "1 o más")
//   (?<!\.)                 -> "lookbehind" negativo: mira hacia ATRÁS que
//                              lo anterior al @ no sea un punto ("ana.@x.com")
//   @                       -> exactamente una arroba
//   [\p{L}\p{N}-]+          -> nombre del dominio ("correo")
//   (?:\.[\p{L}\p{N}-]+)*   -> subdominios opcionales (".com" de ".com.co").
//                              (?:...) agrupa sin "guardar" el grupo; * = 0 o más
//   \.\p{L}{2,}             -> termina en punto + 2 o más letras (".co", ".com")
// No existe una regex "perfecta" para emails (la norma oficial es enorme);
// esta rechaza los errores de tipeo comunes sin rechazar correos reales.
const REGEX_EMAIL = /^(?!.*\.\.)(?!\.)[\p{L}\p{N}._%+-]+(?<!\.)@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}$/u;

// Regla de la contraseña, pieza por pieza:
//   ^ ... $               -> la regla aplica a TODO el texto, de principio a fin
//   (?=.*\d)              -> "lookahead": mira hacia adelante, sin avanzar, que
//                            en algún lugar haya un número (\d = 0-9)
//   (?=.*\p{Lu})          -> que haya una mayúscula. \p{Lu} = cualquier letra
//                            mayúscula, incluidas Ñ y Á (con [A-Z] no contarían)
//   (?=.*[^\p{L}\p{N}\s]) -> que haya un carácter especial: algo que NO sea
//                            letra (\p{L}, incluye ñ y tildes), NI número
//                            (\p{N}), NI espacio (\s)
//   .{6,}                 -> y que en total tenga 6 caracteres o más
//   u (al final)          -> modo Unicode: sin él, \p{...} no funciona
// Los (?=...) no "consumen" texto: los tres revisan la contraseña completa
// desde el inicio, por eso el orden de los requisitos no importa.
const REGEX_PASSWORD = /^(?=.*\d)(?=.*\p{Lu})(?=.*[^\p{L}\p{N}\s]).{6,}$/u;

// La misma regla separada en partes, SOLO para decirle al usuario qué le
// falta (la regex completa solo responde true/false, no el porqué).
const REQUISITOS_PASSWORD = [
  { regex: /.{6,}/u, texto: "al menos 6 caracteres" },
  { regex: /\d/u, texto: "un número" },
  { regex: /\p{Lu}/u, texto: "una mayúscula" },
  { regex: /[^\p{L}\p{N}\s]/u, texto: "un carácter especial" },
];

function mostrarError(texto) {
  ingresoMensaje.textContent = texto;
  ingresoMensaje.hidden = false;
}

// ---------- Usuarios registrados (localStorage) ----------

// localStorage solo guarda TEXTO bajo una clave. Por eso el arreglo de
// usuarios se guarda como texto JSON (JSON.stringify) y al leerlo se vuelve
// a convertir en arreglo (JSON.parse). Cada usuario queda así:
//   { id, nombre, alias, email, sal, passwordHash, partidas: [...] }
// y cada partida completada del juego de memoria:
//   { id, fecha, intentos, tiempoSegundos }
// Se ve en DevTools → Application → Local Storage → clave "usuarios".
const CLAVE_USUARIOS = "usuarios";

// Id del usuario que inició sesión (null = nadie todavía). Con él se sabe a
// quién guardarle las partidas.
let usuarioActualId = null;

// Mayor "id" numérico de una lista de objetos (0 si está vacía). reduce
// recorre la lista "acumulando" un valor: aquí, el mayor visto hasta ahora.
// Ojo con el nombre: data.js ya declara una función global mayorId(); si
// aquí se llamara igual, la reemplazaría para toda la página.
function mayorIdDe(lista) {
  return lista.reduce(
    (mayor, item) => (typeof item.id === "number" && item.id > mayor ? item.id : mayor),
    0
  );
}

function leerUsuarios() {
  const guardado = localStorage.getItem(CLAVE_USUARIOS);
  if (guardado === null) return []; // primera vez: aún no hay nadie

  // try/catch: si el texto guardado se dañó (ej. alguien lo editó a mano en
  // DevTools), JSON.parse lanzaría un error y rompería el login entero.
  let usuarios;
  try {
    usuarios = JSON.parse(guardado);
  } catch {
    return [];
  }
  if (!Array.isArray(usuarios)) return [];

  // Migración: los usuarios registrados antes de que existieran los ids y
  // las partidas no traen esos campos. Se les agregan una sola vez y se
  // vuelve a guardar, así en las próximas lecturas ya vienen completos.
  let siguienteIdUsuario = mayorIdDe(usuarios) + 1;
  let huboCambios = false;
  usuarios.forEach(usuario => {
    if (typeof usuario.id !== "number") {
      usuario.id = siguienteIdUsuario;
      siguienteIdUsuario++;
      huboCambios = true;
    }
    if (!Array.isArray(usuario.partidas)) {
      usuario.partidas = [];
      huboCambios = true;
    }
  });
  if (huboCambios) guardarUsuarios(usuarios);

  return usuarios;
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

// ---------- Hash de la contraseña ----------

// La contraseña NUNCA se guarda tal cual: se guarda su "hash" SHA-256, una
// huella de 64 caracteres que no se puede revertir ("Gato1!" -> "a3f9…",
// pero de "a3f9…" no se puede volver a "Gato1!"). Para el login se calcula
// el hash de lo que se escribió y se compara con el guardado.
//
// La "sal" es un texto aleatorio distinto por usuario que se mezcla con la
// contraseña antes del hash. Sin sal, dos usuarios con la misma contraseña
// tendrían el mismo hash, y existen tablas enormes de hashes ya calculados
// de contraseñas comunes para "adivinarlas". Con sal, esas tablas no sirven.
//
// Ojo: en un proyecto real esto se hace en el SERVIDOR; aquí todo vive en el
// navegador, así que es para practicar la idea, no seguridad de verdad.

// Convierte los bytes del resultado a texto hexadecimal ("0f", "a3", ...).
function bytesAHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

// 16 bytes aleatorios "de verdad" (crypto, no Math.random) en hexadecimal.
function crearSal() {
  return bytesAHex(crypto.getRandomValues(new Uint8Array(16)));
}

// crypto.subtle.digest es ASÍNCRONO: devuelve una Promesa (un "te lo doy
// cuando esté listo"). "await" pausa esta función hasta que el hash esté
// calculado, y por eso la función tiene que ser "async".
async function hashearPassword(password, sal) {
  // digest trabaja con bytes, no con texto: TextEncoder hace la conversión.
  const bytes = new TextEncoder().encode(sal + password);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return bytesAHex(hash);
}

// ---------- Envío del formulario ----------

// ---------- Partidas del juego de memoria ----------

// memoria.js llama a esta función cada vez que se completa un tablero.
// Se vuelve a leer localStorage (en vez de usar un arreglo guardado desde el
// login) para escribir sobre la versión más reciente de los datos.
function guardarPartida(resultado) {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.id === usuarioActualId);
  if (!usuario) return;

  // El id de partida es único en TODO el JSON, no solo en este usuario:
  // flatMap junta las partidas de todos los usuarios en un solo arreglo
  // ([[p1, p2], [p3]] -> [p1, p2, p3]) para buscar el mayor id.
  const todasLasPartidas = usuarios.flatMap(u => u.partidas);

  usuario.partidas.push({
    id: mayorIdDe(todasLasPartidas) + 1,
    // toISOString: formato estándar "2026-09-25T14:32:10.000Z" (hora UTC).
    // Como texto se ordena bien (año, mes, día, hora…) y JSON lo guarda tal
    // cual; un objeto Date no sobreviviría a JSON.stringify/parse.
    fecha: new Date().toISOString(),
    intentos: resultado.intentos,
    tiempoSegundos: resultado.segundos,
  });
  guardarUsuarios(usuarios);
}

// ---------- Envío del formulario ----------

function entrarAlJuego(usuario) {
  usuarioActualId = usuario.id;
  ingresoMensaje.hidden = true;
  juegoSaludo.textContent = `Hola, ${usuario.alias}`;
  seccionIngreso.hidden = true;
  seccionJuego.hidden = false;
  // Viene de memoria.js: arma un tablero nuevo y, cada vez que se complete,
  // llama a guardarPartida. Se pasa la función SIN paréntesis: no se
  // ejecuta ahora, se le entrega a memoria.js para que la llame después.
  iniciarMemoria(guardarPartida);
}

const botonContinuar = formIngreso.querySelector("button[type='submit']");

// "async" porque adentro se espera (await) el hash de la contraseña.
formIngreso.addEventListener("submit", async function (evento) {
  // Sin esto, el form recargaría la página y se perdería todo. Va ANTES de
  // cualquier await: después ya sería tarde para cancelar el envío.
  evento.preventDefault();

  const nombre = inputNombre.value.trim();
  const alias = inputAlias.value.trim();
  // toLowerCase: "Riley@Correo.com" y "riley@correo.com" son el mismo
  // usuario, así que el email siempre se guarda y se busca en minúsculas.
  const email = inputEmail.value.trim().toLowerCase();
  // La contraseña NO lleva trim(): un espacio al inicio o al final también
  // es parte de ella.
  const password = inputPassword.value;

  if (nombre === "" || alias === "") {
    mostrarError("Nombre y alias son obligatorios.");
    return;
  }

  if (!REGEX_EMAIL.test(email)) {
    mostrarError("Escribe un email válido (ej. riley@correo.com).");
    inputEmail.focus();
    return;
  }

  // .test() devuelve true si el texto cumple la regex. Si no cumple, el
  // "return" corta la función aquí: no se puede continuar al juego.
  if (!REGEX_PASSWORD.test(password)) {
    const faltantes = REQUISITOS_PASSWORD
      .filter(requisito => !requisito.regex.test(password))
      .map(requisito => requisito.texto);
    mostrarError(`A la contraseña le falta: ${faltantes.join(", ")}.`);
    inputPassword.focus();
    return;
  }

  // crypto.subtle solo existe en contextos "seguros" (https, localhost o
  // archivo abierto directo). Si no está, se avisa en vez de romperse.
  if (!window.crypto || !crypto.subtle) {
    mostrarError("Este navegador no permite proteger la contraseña. Abre la página con https o desde localhost.");
    return;
  }

  // Se desactiva el botón mientras se calcula el hash, para que un doble
  // clic no registre al mismo usuario dos veces.
  botonContinuar.disabled = true;
  try {
    const usuarios = leerUsuarios();
    // find devuelve el PRIMER usuario que cumpla la condición, o undefined.
    const usuario = usuarios.find(u => u.email === email);

    if (usuario) {
      // Ya está registrado: se hashea lo escrito con SU sal y se compara.
      const hashEscrito = await hashearPassword(password, usuario.sal);
      if (hashEscrito !== usuario.passwordHash) {
        mostrarError("Contraseña incorrecta.");
        inputPassword.value = "";
        inputPassword.focus();
        return;
      }
      // Se saluda con el alias con el que se registró, no con lo escrito hoy.
      entrarAlJuego(usuario);
      return;
    }

    // No está registrado: se le pregunta. confirm() devuelve true si elige
    // "Aceptar" y false si elige "Cancelar".
    const quiereRegistrarse = confirm(`No hay ninguna cuenta con ${email}. ¿Quieres registrarte?`);
    if (!quiereRegistrarse) {
      mostrarError("No se creó la cuenta. Revisa el email si ya te habías registrado.");
      return;
    }

    const sal = crearSal();
    const nuevoUsuario = {
      // Id autogenerado: el mayor que ya exista + 1, así nunca se repite.
      id: mayorIdDe(usuarios) + 1,
      nombre,
      alias,
      email,
      sal,
      passwordHash: await hashearPassword(password, sal),
      partidas: [],
    };
    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    entrarAlJuego(nuevoUsuario);
  } finally {
    // "finally" se ejecuta SIEMPRE, incluso después de un return: así el
    // botón se reactiva sin importar por qué camino terminó el login.
    botonContinuar.disabled = false;
  }
});
