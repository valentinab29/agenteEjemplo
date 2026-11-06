// Modo claro / oscuro
//
// El CSS de prueba2.html ya sabe pintar los dos temas: solo mira si
// <html> tiene data-theme="dark" o data-theme="light". Este archivo
// solo decide CUÁL poner y lo recuerda en localStorage.

const CLAVE_TEMA = 'tema';

// 1) Esto corre de inmediato (el script está en el <head>), antes de que
// exista el <body>: por eso solo toca document.documentElement (<html>),
// que ya existe. Si el usuario eligió un tema antes, se lo ponemos ya.
// try/catch: en modo incógnito o con cookies bloqueadas, localStorage
// puede lanzar error, y no queremos que eso rompa la página.
try {
  const guardado = localStorage.getItem(CLAVE_TEMA);
  if (guardado === 'dark' || guardado === 'light') {
    document.documentElement.dataset.theme = guardado;
  }
} catch (e) {}

// Si no hay nada guardado, no ponemos data-theme: el CSS usa el tema
// del sistema (@media prefers-color-scheme). Esta función responde
// "¿qué tema se está viendo AHORA?" en los dos casos.
function temaActual() {
  const elegido = document.documentElement.dataset.theme;
  if (elegido) return elegido;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 2) El botón todavía no existe cuando corre la parte de arriba.
// DOMContentLoaded espera a que el HTML esté completo para buscarlo.
document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('btn-tema');

  // el ícono muestra a qué tema VAS a pasar, no en el que estás
  function pintarBoton() {
    const oscuro = temaActual() === 'dark';
    boton.textContent = oscuro ? '☀️' : '🌙';
    boton.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }

  boton.addEventListener('click', () => {
    const nuevo = temaActual() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    try { localStorage.setItem(CLAVE_TEMA, nuevo); } catch (e) {}
    pintarBoton();
  });

  pintarBoton();
});
