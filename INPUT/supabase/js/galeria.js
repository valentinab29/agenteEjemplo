// ============================================================
// galeria.js — Galería de productos + carrito (SIN Supabase todavía)
//
// Mismo orden que admin.js:
//   1. Datos y estado
//   2. Pintar (solo toca el HTML)
//   3. Eventos (clics que unen las dos cosas)
// ============================================================


// ---------- 1. Datos y estado ----------

// Productos de PRUEBA. Cada propiedad se llama IGUAL que la columna de
// productos_practica en Supabase (nombre, description, precio, descuento,
// disponible, unidades, categorias, image). Así, cuando conectemos
// Supabase, solo se cambia este array por lo que devuelva traerProductos()
// y el resto del archivo sigue igual.
const productos = [
  {
    id: 1,
    nombre: 'Café Etiopía Natural',
    description: 'Notas de frutos rojos, miel y jazmín. Tostión media.',
    precio: 32000,
    descuento: 0,
    disponible: true,
    unidades: 12,
    categorias: ['bebidas'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
  },
  {
    id: 2,
    nombre: 'Té Matcha Premium',
    description: 'Grado ceremonial. Procedente de Uji, Japón.',
    precio: 58000,
    descuento: 0.15,
    disponible: true,
    unidades: 5,
    categorias: ['bebidas'],
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  },
  {
    id: 3,
    nombre: 'Miel de Abejas Silvestres',
    description: 'Cosecha artesanal del Huila. Sin procesar.',
    precio: 24000,
    descuento: 0,
    disponible: true,
    unidades: 3,
    categorias: ['despensa'],
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
  },
  {
    id: 4,
    nombre: 'Granola Andina',
    description: 'Con quinua, frutas deshidratadas y cacao 70%.',
    precio: 19500,
    descuento: 0.1,
    disponible: true,
    unidades: 20,
    categorias: ['despensa', 'snacks'],
    image: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=400&q=80',
  },
  {
    id: 5,
    nombre: 'Chocolate Artesanal',
    description: 'Tableta de 100 g. Cacao de origen Tumaco.',
    precio: 15000,
    descuento: 0,
    disponible: false,          // ← agotado, para ver cómo se ve
    unidades: 0,
    categorias: ['snacks'],
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80',
  },
  {
    id: 6,
    nombre: 'Aceite de Coco Virgen',
    description: 'Extracción en frío. Ideal para cocinar y para la piel.',
    precio: 27000,
    descuento: 0,
    disponible: true,
    unidades: 8,
    categorias: ['despensa', 'cuidado'],
    image: null,                // ← sin foto, para ver la inicial
  },
];

// El carrito es un objeto { id: cantidad }. Ejemplo: { 1: 2, 4: 1 }
// = 2 cafés y 1 granola. Se guarda en localStorage para que NO se pierda
// al recargar (en el ejemplo de CodePen se perdía).
const CLAVE_CARRITO = 'carrito';
let carrito = cargarCarrito();

// Cantidad elegida en cada card ANTES de darle "Agregar". Es distinto
// del carrito: puedes poner 3 en la card y todavía no haber agregado nada.
const elegidas = {};
productos.forEach(p => { elegidas[p.id] = 1; });

// Chip activo: 'todas' o el nombre de una categoría
let categoriaActiva = 'todas';

function buscarProducto(id) {
  return productos.find(p => p.id === id);
}

// precio con el descuento ya aplicado (descuento 0.15 = 15%)
function precioFinal(p) {
  return p.precio * (1 - (p.descuento || 0));
}

// cuántas unidades hay para vender (si no está disponible, 0)
function stock(p) {
  return p.disponible ? p.unidades : 0;
}

// cuántas MÁS se pueden agregar: stock menos lo que ya está en el carrito.
// Esto es lo que pone el tope al botón +.
function disponiblesParaAgregar(p) {
  return stock(p) - (carrito[p.id] || 0);
}

function cargarCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || {};
    // Limpieza: lo guardado pudo quedar viejo (un producto que ya no
    // existe, o más unidades de las que hay ahora). Solo se conserva lo
    // que todavía tiene sentido.
    const limpio = {};
    for (const [id, cantidad] of Object.entries(guardado)) {
      const p = productos.find(prod => prod.id === Number(id));
      const maximo = p ? stock(p) : 0;
      if (maximo > 0) limpio[id] = Math.min(cantidad, maximo);
    }
    return limpio;
  } catch (e) {
    return {};   // localStorage bloqueado o JSON dañado → carrito vacío
  }
}

function guardarCarrito() {
  try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito)); } catch (e) {}
}


// ---------- 2. Pintar ----------

const galeria = document.getElementById('galeria');
const chips = document.getElementById('chips');
const listaCarrito = document.getElementById('lista-carrito');

function formatoPrecio(numero) {
  return '$' + Math.round(numero).toLocaleString('es-CO');
}

// Atajo para crear un elemento con clase y texto en una línea.
// Todo con textContent (nunca innerHTML con datos): cuando los productos
// vengan de Supabase, un nombre con <script> se mostrará como texto,
// no se ejecutará.
function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

// Foto del producto, o la inicial si no tiene (o si la URL está rota)
function crearFoto(p, claseInicial) {
  const inicial = crear('span', claseInicial, (p.nombre || '?').charAt(0).toUpperCase());
  if (!p.image) return inicial;

  const img = document.createElement('img');
  img.src = p.image;
  img.alt = p.nombre;
  img.loading = 'lazy';
  img.addEventListener('error', () => img.replaceWith(inicial));
  return img;
}

// Botón con data-accion y data-id: NO tiene listener propio. Hay uno solo
// en la galería y otro en el carrito que leen estos datos (delegación).
function crearBoton(texto, accion, id, clase, etiqueta) {
  const b = crear('button', clase, texto);
  b.type = 'button';
  b.dataset.accion = accion;
  b.dataset.id = id;
  if (etiqueta) b.setAttribute('aria-label', etiqueta);
  return b;
}

// Control − n + (se usa en las cards y en el carrito)
function crearCantidad(p, valor, prefijo) {
  const caja = crear('div', 'cantidad');
  // <output> = elemento hecho para mostrar un valor calculado
  const numero = crear('output', '', valor);
  numero.setAttribute('aria-label', 'Cantidad');
  caja.append(
    crearBoton('−', prefijo + 'restar', p.id, '', `Quitar una unidad de ${p.nombre}`),
    numero,
    crearBoton('+', prefijo + 'sumar', p.id, '', `Agregar una unidad de ${p.nombre}`),
  );
  return caja;
}

function crearCard(p) {
  const agotado = stock(p) === 0;
  const card = crear('article', agotado ? 'card agotada' : 'card');
  card.dataset.id = p.id;

  // --- foto + badges ---
  const caja = crear('div', 'card-img');
  caja.appendChild(crearFoto(p, 'inicial'));
  if (p.descuento > 0) caja.appendChild(crear('span', 'badge descuento', `-${Math.round(p.descuento * 100)}%`));
  if (agotado) caja.appendChild(crear('span', 'badge agotado', 'Agotado'));

  // --- textos ---
  const cuerpo = crear('div', 'card-cuerpo');
  cuerpo.appendChild(crear('h3', '', p.nombre));
  if (p.description) cuerpo.appendChild(crear('p', 'descripcion', p.description));

  const precio = crear('div', 'precio');
  precio.appendChild(crear('strong', '', formatoPrecio(precioFinal(p))));
  if (p.descuento > 0) precio.appendChild(crear('s', '', formatoPrecio(p.precio)));
  cuerpo.appendChild(precio);

  cuerpo.appendChild(crear('p', 'stock', ''));   // lo llena actualizarCard()

  // --- acciones ---
  const acciones = crear('div', 'card-acciones');
  acciones.append(
    crearCantidad(p, elegidas[p.id], ''),
    crearBoton('Agregar', 'agregar', p.id, 'agregar', `Agregar ${p.nombre} al carrito`),
  );

  card.append(caja, cuerpo, acciones);
  actualizarCard(card, p);
  return card;
}

// Actualiza los números y botones de UNA card sin volver a crearla.
// Si se recreara, el botón que acabas de tocar desaparecería y el foco
// del teclado se perdería (molesto si navegas con Tab).
function actualizarCard(card, p) {
  const quedan = disponiblesParaAgregar(p);

  // la cantidad elegida nunca puede pasar de lo que queda
  elegidas[p.id] = Math.max(1, Math.min(elegidas[p.id], quedan));

  card.querySelector('output').textContent = elegidas[p.id];
  card.querySelector('[data-accion="restar"]').disabled = quedan === 0 || elegidas[p.id] <= 1;
  card.querySelector('[data-accion="sumar"]').disabled = elegidas[p.id] >= quedan;
  card.querySelector('[data-accion="agregar"]').disabled = quedan === 0;

  const enCarrito = carrito[p.id] || 0;
  let texto;
  if (stock(p) === 0) texto = 'Sin unidades';
  else if (quedan === 0) texto = `Ya tienes las ${enCarrito} disponibles en el carrito`;
  else if (enCarrito > 0) texto = `${enCarrito} en el carrito · quedan ${quedan}`;
  else texto = `${stock(p)} disponibles`;
  card.querySelector('.stock').textContent = texto;
}

function actualizarCardPorId(id) {
  const card = galeria.querySelector(`.card[data-id="${id}"]`);
  if (card) actualizarCard(card, buscarProducto(id));
}

// Chips: "Todas" + una por cada categoría que exista en los productos.
// new Set() quita los repetidos; flatMap junta todos los arrays de
// categorías en uno solo: [['bebidas'], ['despensa','snacks']] → ['bebidas','despensa','snacks']
function pintarChips() {
  const categorias = [...new Set(productos.flatMap(p => p.categorias || []))].sort();
  chips.replaceChildren(...['todas', ...categorias].map(c => {
    const li = document.createElement('li');
    const b = crear('button', '', c === 'todas' ? 'Todas' : c.charAt(0).toUpperCase() + c.slice(1));
    b.type = 'button';
    b.dataset.categoria = c;
    // aria-pressed le dice al lector de pantalla si el chip está activo
    b.setAttribute('aria-pressed', String(c === categoriaActiva));
    li.appendChild(b);
    return li;
  }));
}

function pintarGaleria() {
  const visibles = categoriaActiva === 'todas'
    ? productos
    : productos.filter(p => (p.categorias || []).includes(categoriaActiva));

  if (visibles.length === 0) {
    galeria.replaceChildren(crear('p', 'vacio', 'No hay productos en esta categoría'));
    return;
  }
  galeria.replaceChildren(...visibles.map(crearCard));
}

function pintarCarrito() {
  const ids = Object.keys(carrito).map(Number);
  let total = 0;
  let unidades = 0;

  if (ids.length === 0) {
    listaCarrito.replaceChildren(crear('li', 'vacio', 'Tu carrito está vacío 🛒'));
  } else {
    listaCarrito.replaceChildren(...ids.map(id => {
      const p = buscarProducto(id);
      const cantidad = carrito[id];
      const subtotal = precioFinal(p) * cantidad;
      total += subtotal;
      unidades += cantidad;

      const item = crear('li', 'item');
      const foto = crear('div', 'item-foto');
      foto.appendChild(crearFoto(p, ''));

      const info = crear('div', 'item-info');
      info.append(crear('strong', '', p.nombre), crear('span', '', `${formatoPrecio(precioFinal(p))} c/u`));

      const control = crearCantidad(p, cantidad, 'carrito-');
      control.querySelector('[data-accion="carrito-restar"]').disabled = cantidad <= 1;
      control.querySelector('[data-accion="carrito-sumar"]').disabled = cantidad >= stock(p);

      item.append(
        foto,
        info,
        crearBoton('✕', 'carrito-quitar', id, 'quitar', `Quitar ${p.nombre} del carrito`),
        control,
        crear('span', 'item-subtotal', formatoPrecio(subtotal)),
      );
      return item;
    }));
  }

  document.getElementById('total').textContent = formatoPrecio(total);
  document.getElementById('btn-pagar').disabled = ids.length === 0;
  document.getElementById('btn-vaciar').disabled = ids.length === 0;

  const contador = document.getElementById('contador');
  if (contador.textContent !== String(unidades)) {
    contador.textContent = unidades;
    // quitar y volver a poner la clase reinicia la animación.
    // void offsetWidth obliga al navegador a "darse cuenta" del cambio
    contador.classList.remove('salta');
    void contador.offsetWidth;
    contador.classList.add('salta');
  }
  document.getElementById('btn-carrito').setAttribute('aria-label',
    `Abrir carrito, ${unidades} ${unidades === 1 ? 'producto' : 'productos'}`);
}

// Aviso flotante. Es un popover (ver galeria.html): showPopover() lo pone
// en la capa superior, encima del carrito si está abierto. Se cierra y
// se vuelve a abrir para que quede encima de lo ÚLTIMO que se abrió.
const aviso = document.getElementById('aviso');
let temporizadorAviso;
function mostrarAviso(texto) {
  aviso.textContent = texto;
  if (aviso.matches(':popover-open')) aviso.hidePopover();
  aviso.showPopover();
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.hidePopover(), 2500);
}

// Cada vez que el carrito cambia: se guarda, se repinta el panel y se
// actualiza la card de ese producto (su tope de + depende del carrito)
function carritoCambio(id) {
  guardarCarrito();
  pintarCarrito();
  if (id === undefined) productos.forEach(p => actualizarCardPorId(p.id));
  else actualizarCardPorId(id);
}


// ---------- 3. Eventos ----------

// Chips de categoría (delegación: un listener para todos los chips)
chips.addEventListener('click', (evento) => {
  const b = evento.target.closest('button[data-categoria]');
  if (!b) return;
  categoriaActiva = b.dataset.categoria;
  pintarChips();
  pintarGaleria();
});

// Botones de las cards: − + Agregar
galeria.addEventListener('click', (evento) => {
  const b = evento.target.closest('button[data-accion]');
  if (!b) return;
  const id = Number(b.dataset.id);   // dataset siempre es texto
  const p = buscarProducto(id);

  if (b.dataset.accion === 'restar') {
    elegidas[id]--;
    actualizarCardPorId(id);
  } else if (b.dataset.accion === 'sumar') {
    elegidas[id]++;
    actualizarCardPorId(id);
  } else if (b.dataset.accion === 'agregar') {
    const cantidad = elegidas[id];
    carrito[id] = (carrito[id] || 0) + cantidad;
    elegidas[id] = 1;
    carritoCambio(id);
    mostrarAviso(`Agregado: ${cantidad} × ${p.nombre}`);

    // feedback en el botón: con una CLASE (no con style.background
    // como en el ejemplo), así el color sigue viniendo del CSS
    b.textContent = '✓ Agregado';
    b.classList.add('ok');
    setTimeout(() => {
      b.textContent = 'Agregar';
      b.classList.remove('ok');
    }, 1200);
  }
});

// Botones dentro del carrito: − + ✕
listaCarrito.addEventListener('click', (evento) => {
  const b = evento.target.closest('button[data-accion]');
  if (!b) return;
  const id = Number(b.dataset.id);

  if (b.dataset.accion === 'carrito-restar') carrito[id]--;
  else if (b.dataset.accion === 'carrito-sumar') carrito[id]++;
  else if (b.dataset.accion === 'carrito-quitar') delete carrito[id];   // delete borra la clave del objeto

  carritoCambio(id);
});

// Abrir / cerrar el carrito. showModal() ya trae Escape para cerrar.
const panel = document.getElementById('carrito');
document.getElementById('btn-carrito').addEventListener('click', () => panel.showModal());
document.getElementById('btn-cerrar-carrito').addEventListener('click', () => panel.close());
// clic en el fondo oscuro = cerrar (el clic cae en el <dialog> mismo)
panel.addEventListener('click', (evento) => {
  if (evento.target === panel) panel.close();
});

document.getElementById('btn-vaciar').addEventListener('click', () => {
  carrito = {};
  carritoCambio();
  mostrarAviso('Carrito vacío');
});

// El pago todavía no existe: se avisa en vez de no hacer nada
document.getElementById('btn-pagar').addEventListener('click', () => {
  mostrarAviso('El pago llega en la próxima versión 💜');
});


// ---------- Inicio ----------
pintarChips();
pintarGaleria();
pintarCarrito();
