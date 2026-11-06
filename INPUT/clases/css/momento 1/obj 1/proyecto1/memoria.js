// Juego de memoria (flip cards) de game.html.
//
// Basado en "cardGame" de Julian Bejarano, licencia MIT:
// https://codepen.io/julianbejarano/pen/myrzjBG
// (ver ejemplojuego/cardgame/cardgame/LICENSE.txt).
//
// Cambios respecto al original:
// - Usa TODAS las emociones de "emociones" (data.js, o lo guardado desde
//   gestion.html) en vez de 8 productos fijos: el total de pares se calcula
//   con .length, no está escrito a mano.
// - Las cartas se crean con createElement + textContent en vez de innerHTML:
//   como las emociones se pueden crear desde un formulario, un nombre con
//   código HTML adentro no se ejecuta, solo se muestra como texto.
// - Al reiniciar se cancelan los setTimeout pendientes (en el original, si se
//   reiniciaba justo mientras dos cartas distintas estaban boca arriba, el
//   timeout se ejecutaba con carta1 = null y lanzaba un TypeError).
// - El cronómetro arranca con el primer clic, no al pintar el tablero.
//
// Todo va dentro de una IIFE para que sus variables (intentos, carta1, ...)
// no sean globales. Lo único que "sale" es la función que devuelve, guardada
// en iniciarMemoria, que es la que llama game.js.
//
// Este archivo NO sabe nada de usuarios ni de localStorage: cuando se
// completa el tablero, solo llama a la función "alTerminar" que le pasó
// game.js, con el resultado. Qué hacer con él (guardarlo) es asunto de game.js.
const iniciarMemoria = (function () {
  const tablero = document.getElementById("tablero");
  const tableroMensaje = document.getElementById("tablero-mensaje");
  const hudTiempo = document.getElementById("hud-tiempo");
  const hudIntentos = document.getElementById("hud-intentos");
  const hudPares = document.getElementById("hud-pares");
  const overlayVictoria = document.getElementById("overlay-victoria");
  const victoriaTexto = document.getElementById("victoria-texto");
  const statTiempo = document.getElementById("stat-tiempo");
  const statIntentos = document.getElementById("stat-intentos");
  const statPares = document.getElementById("stat-pares");

  // Cuánto tiempo se ven dos cartas que NO coinciden antes de voltearse.
  const ESPERA_NO_COINCIDEN = 900;
  // Pausa entre el último par y la ventana de victoria (para ver el par).
  const ESPERA_VICTORIA = 500;

  // Estado del turno: las (hasta) 2 cartas boca arriba sin resolver.
  let carta1 = null;
  let carta2 = null;
  // true mientras se muestran 2 cartas que no coinciden: bloquea más clics.
  let esperando = false;

  // Estado de la partida.
  let totalPares = 0;
  let paresEncontrados = 0;
  let intentos = 0;
  let segundos = 0;

  // Ids de los temporizadores, para poder cancelarlos al reiniciar.
  let intervaloTimer = null;
  let timeoutVolteo = null;
  let timeoutVictoria = null;

  // Callback que llega desde game.js (ver el final del archivo). Se llama
  // una vez por partida completada con { intentos, segundos }.
  let alTerminar = null;

  // ---------- Cronómetro ----------

  // 75 -> "01:15". padStart rellena con ceros a la izquierda hasta 2 dígitos.
  function formatearTiempo(segs) {
    const mm = String(Math.floor(segs / 60)).padStart(2, "0");
    const ss = String(segs % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // setInterval repite la función cada 1000 ms y devuelve un id; guardarlo es
  // la única forma de detenerlo después con clearInterval.
  function iniciarTimer() {
    intervaloTimer = setInterval(() => {
      segundos++;
      hudTiempo.textContent = formatearTiempo(segundos);
    }, 1000);
  }

  function detenerTimer() {
    clearInterval(intervaloTimer);
    intervaloTimer = null;
  }

  // ---------- Mazo ----------

  // Mezcla Fisher-Yates: recorre el arreglo de atrás hacia adelante y cambia
  // cada elemento por otro al azar de los que quedan antes. Así todas las
  // ordenaciones posibles tienen la misma probabilidad. Trabaja sobre una
  // copia (slice) para no desordenar el arreglo original.
  function mezclar(arreglo) {
    const copia = arreglo.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]]; // intercambio
    }
    return copia;
  }

  // Crea UNA carta. Por dentro tiene dos caras superpuestas: el reverso
  // (lo que se ve al empezar) y la cara con la emoción, que está girada
  // 180° de fábrica. Al voltear, se gira el contenedor .flip-card-inner
  // completo y la cara queda al frente (ver style.css).
  function crearCarta(emocion) {
    const carta = document.createElement("div");
    carta.className = "flip-card";
    // El id es lo que se compara para saber si dos cartas son par.
    carta.dataset.id = String(emocion.id);
    carta.style.setProperty("--color-carta", emocion.color);

    const interior = document.createElement("div");
    interior.className = "flip-card-inner";

    const reverso = document.createElement("div");
    reverso.className = "flip-card-reverso";
    reverso.textContent = "✦";

    const cara = document.createElement("div");
    cara.className = "flip-card-cara";

    const imagen = document.createElement("img");
    imagen.src = emocion.imagen;
    imagen.alt = emocion.nombre;

    const info = document.createElement("div");
    info.className = "flip-card-info";

    const nombre = document.createElement("p");
    nombre.className = "flip-card-nombre";
    nombre.textContent = emocion.nombre;

    const intensidad = document.createElement("p");
    intensidad.className = "flip-card-intensidad";
    intensidad.textContent = `Intensidad ${emocion.nivelIntensidad}/100`;

    info.append(nombre, intensidad);
    cara.append(imagen, info);
    interior.append(reverso, cara);
    carta.appendChild(interior);

    carta.addEventListener("click", () => manejarClic(carta));
    return carta;
  }

  function actualizarHudPares() {
    hudPares.textContent = `${paresEncontrados}/${totalPares}`;
  }

  // Muestra/oculta el mensaje debajo del tablero.
  function mostrarMensaje(texto) {
    tableroMensaje.textContent = texto;
    tableroMensaje.hidden = texto === "";
  }

  function renderizarTablero() {
    tablero.innerHTML = "";
    // Muestra = universo: una pareja por CADA emoción que exista.
    totalPares = emociones.length;
    actualizarHudPares();

    if (totalPares < 2) {
      mostrarMensaje("Se necesitan al menos 2 emociones para jugar. Agrégalas desde gestion.html.");
      return;
    }
    mostrarMensaje("");

    // [...emociones, ...emociones] duplica la lista: 2 cartas por emoción.
    mezclar([...emociones, ...emociones]).forEach(emocion => {
      tablero.appendChild(crearCarta(emocion));
    });
  }

  // ---------- Turnos ----------

  function manejarClic(carta) {
    if (esperando) return;
    if (carta.classList.contains("volteada")) return;   // ya está boca arriba
    if (carta.classList.contains("encontrada")) return; // ya es un par resuelto

    // El cronómetro arranca con el primer clic de la partida.
    if (intervaloTimer === null) iniciarTimer();

    carta.classList.add("volteada");

    // Primera carta del turno: se guarda y se espera la segunda.
    if (carta1 === null) {
      carta1 = carta;
      return;
    }

    // Segunda carta del turno: se cuenta el intento y se comparan.
    carta2 = carta;
    intentos++;
    hudIntentos.textContent = intentos;

    if (carta1.dataset.id === carta2.dataset.id) {
      procesarPar();
    } else {
      esperando = true;
      timeoutVolteo = setTimeout(voltearDeNuevo, ESPERA_NO_COINCIDEN);
    }
  }

  function procesarPar() {
    // classList.replace cambia una clase por otra en un solo paso.
    carta1.classList.replace("volteada", "encontrada");
    carta2.classList.replace("volteada", "encontrada");
    paresEncontrados++;
    actualizarHudPares();
    limpiarSeleccion();

    if (paresEncontrados === totalPares) {
      detenerTimer();
      // Se avisa YA (no dentro del timeout de la ventana): si alguien
      // reinicia en esos 500 ms, la partida igual quedó completada.
      if (alTerminar) {
        alTerminar({ intentos, segundos });
      }
      timeoutVictoria = setTimeout(mostrarVictoria, ESPERA_VICTORIA);
    }
  }

  function voltearDeNuevo() {
    carta1.classList.remove("volteada");
    carta2.classList.remove("volteada");
    limpiarSeleccion();
  }

  function limpiarSeleccion() {
    carta1 = null;
    carta2 = null;
    esperando = false;
    timeoutVolteo = null;
  }

  // ---------- Victoria y reinicio ----------

  // El mínimo posible es 1 intento por par (acertar siempre a la primera).
  // Los umbrales se calculan sobre totalPares, así sirven con cualquier
  // cantidad de emociones.
  function mostrarVictoria() {
    let texto = "🌀 ¡Completado! Algunos recuerdos casi se van al olvido.";
    if (intentos <= totalPares * 1.5) {
      texto = "🌟 ¡Memoria de recuerdo central! Casi no fallaste.";
    } else if (intentos <= totalPares * 2.5) {
      texto = "✨ ¡Muy bien! Tus recuerdos están a salvo.";
    }

    victoriaTexto.textContent = texto;
    statTiempo.textContent = formatearTiempo(segundos);
    statIntentos.textContent = intentos;
    statPares.textContent = totalPares;
    overlayVictoria.hidden = false;
  }

  // Deja todo en cero y arma un tablero nuevo. Primero cancela cualquier
  // timeout pendiente: si no, un voltearDeNuevo() programado ANTES del
  // reinicio se ejecutaría DESPUÉS, con carta1 = null (TypeError).
  function reiniciar() {
    clearTimeout(timeoutVolteo);
    clearTimeout(timeoutVictoria);
    detenerTimer();

    carta1 = null;
    carta2 = null;
    esperando = false;
    paresEncontrados = 0;
    intentos = 0;
    segundos = 0;

    hudTiempo.textContent = formatearTiempo(0);
    hudIntentos.textContent = "0";
    overlayVictoria.hidden = true;

    renderizarTablero();
  }

  document.getElementById("btn-reiniciar").addEventListener("click", reiniciar);
  document.getElementById("btn-jugar-de-nuevo").addEventListener("click", reiniciar);

  // Esto es lo que recibe iniciarMemoria: guarda el callback y arranca una
  // partida nueva. Los botones de reiniciar usan reiniciar() directo, así
  // que el callback se conserva entre partidas.
  return function (funcionAlTerminar) {
    alTerminar = funcionAlTerminar;
    reiniciar();
  };
})();
