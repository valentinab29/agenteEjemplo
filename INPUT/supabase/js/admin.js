document.getElementById('form-registro-admin').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;

  const { data, error } = await db.auth.signUp({
    email: form.elements['admin-registro-correo'].value,
    password: form.elements['admin-registro-password'].value,
  });

  if (error) {
    document.getElementById('estado-sesion-admin').innerText = 'Error al registrar: ' + error.message;
    return;
  }

  const { error: errorPerfil } = await db.from('admins_practica').insert([{
    id: data.user.id,
    nombre: form.elements['admin-registro-nombre'].value.trim(),
    correo: form.elements['admin-registro-correo'].value.trim(),
  }]);

  if (errorPerfil) {
    document.getElementById('estado-sesion-admin').innerText = 'Cuenta creada, pero falló el perfil: ' + errorPerfil.message;
    return;
  }

  document.getElementById('estado-sesion-admin').innerText = 'Cuenta de administrador creada. Ya puedes iniciar sesión.';
  form.reset();
});

document.getElementById('form-login-admin').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;

  const { error } = await db.auth.signInWithPassword({
    email: form.elements['admin-login-correo'].value,
    password: form.elements['admin-login-password'].value,
  });

  if (error) {
    document.getElementById('estado-sesion-admin').innerText = 'Error al iniciar sesión: ' + error.message;
    return;
  }

  mostrarEstadoSesionAdmin();
});

async function mostrarEstadoSesionAdmin() {
  const { data } = await db.auth.getUser();
  const estado = document.getElementById('estado-sesion-admin');

  if (!data.user) {
    estado.innerText = 'No has iniciado sesión.';
    return;
  }

  // Importante: tener sesión no basta — confirmamos que además exista
  // su fila en admins_practica.
  const { data: perfil } = await db.from('admins_practica').select('nombre').eq('id', data.user.id).single();
  estado.innerText = perfil ? 'Sesión iniciada como ' + perfil.nombre + ' (admin).' : 'Sesión iniciada, pero sin perfil de administrador.';
}

document.getElementById('btn-logout-admin').addEventListener('click', async () => {
  await db.auth.signOut();
  mostrarEstadoSesionAdmin();
});

mostrarEstadoSesionAdmin();


// ============================================================
// admin.js — Tienda con tarjetas (CRUD con Supabase)
//
// El archivo va en 3 partes, de "abajo" (datos) a "arriba" (pantalla):
//   1. CRUD: funciones que SOLO hablan con Supabase
//   2. Pintar: funciones que SOLO tocan el HTML
//   3. Eventos: clics y formularios, que unen las dos cosas
// Así, si cambia la tabla tocas la parte 1; si cambia el diseño, la 2.
// ============================================================


// ---------- 1. CRUD con Supabase ----------

// PAPELERA ("soft delete" = borrado suave):
// 🗑 ya NO borra la fila. Le pone la fecha en la columna "eliminado_en".
//   eliminado_en = null       → el producto está en la tienda
//   eliminado_en = una fecha  → está en la papelera (desde esa fecha)
// Recuperar = volver a ponerla en null. Solo "eliminar definitivamente"
// hace un delete de verdad. Por eso toda consulta de la tienda filtra
// con .is('eliminado_en', null): si no, saldrían también los borrados.
//
// Las dos funciones de "traer" devuelven { productos } o { error }
// (una de las dos claves), para que afuera se pueda mostrar QUÉ falló.

// CRUD: Leer todos (los de la tienda)
async function traerProductos() {

  // "await" pausa la ejecución DE ESTA FUNCIÓN (no de toda la página)
  // hasta que Supabase responda. Diferencia con localStorage (semana 7):
  // localStorage.getItem() es SINCRÓNICO — ocurre al instante en tu
  // computador. Una consulta a Supabase viaja por internet y vuelve, eso
  // toma tiempo real, y "await" es la forma de decir "espera la respuesta".
  // Sin "await", data y error serían una Promise sin resolver, no los datos.
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    // .is() y no .eq(): en SQL, "algo = null" nunca es verdadero (null
    // significa "sin valor", no se puede comparar con =). Para preguntar
    // "¿está vacío?" se usa IS NULL, y eso es lo que hace .is()
    .is('eliminado_en', null)
    .order('id');   // order() = ordénalos por id; sin esto Supabase no
                    // garantiza el orden y las tarjetas podrían "saltar"

  if (error) {
    console.log("Error al traer:", error);
    return { error };
  }
  return { productos: data };
}

// Los de la papelera: los que SÍ tienen fecha. .not('eliminado_en',
// 'is', null) = "eliminado_en NO ES null". Los más recientes primero.
async function traerPapelera() {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .not('eliminado_en', 'is', null)
    .order('eliminado_en', { ascending: false });

  if (error) {
    console.log("Error al traer la papelera:", error);
    return { error };
  }
  return { productos: data };
}

// CRUD: Crear
async function agregarProducto(datos) {

  const { data, error } = await db
    .from('productos_practica')  // la tabla
    .insert([datos])             // insert() siempre recibe un ARRAY de objetos,
                                  // aunque insertes uno solo
    .select();                    // .select() le pide a Supabase que te
                                   // devuelva la fila ya creada (con su id
                                   // nuevo) — sin esto, insert() no te
                                   // devuelve nada útil

  if (error) {
    console.log("Error al agregar:", error);
    return null;
  }

  return data[0];   // data siempre es un array — tomamos el primer
                     // elemento, que es la fila recién creada
}

// CRUD: Buscar
async function buscarProductoPorId(id) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .eq('id', id)    // eq = "equal" (igual a) — equivalente a find(p => p.id === id)
    .is('eliminado_en', null)   // el buscador no muestra lo que está en la papelera
    .single();         // single() = "espero exactamente una fila, dámela
                        // como objeto, no como array de un elemento"

  if (error) return null;
  return data;
}

async function buscarProductosPorNombre(texto) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .ilike('nombre', `%${texto}%`)
    .is('eliminado_en', null)
    .order('id');
    // ilike = "like" insensible a mayúsculas/minúsculas.
    // los símbolos % significan "cualquier texto antes/después" —
    // equivalente a .toLowerCase().includes(texto)

  if (error) return [];
  return data;
}

// CRUD: Modificar
// Supabase resuelve "encontrar y actualizar" en una sola instrucción
async function modificarProducto(id, cambios) {

  const { data, error } = await db
    .from('productos_practica')
    .update(cambios)   // solo actualiza las propiedades que vengan en "cambios"
    .eq('id', id)      // ...de la fila donde el id coincida
    .select();         // igual que en agregarProducto: devuélveme la fila ya cambiada

  if (error) {
    console.log("Error al modificar:", error);
    return null;
  }

  // Si NINGÚN producto tiene ese id (o los permisos de la tabla no dejan
  // hacer update), Supabase NO lo cuenta como error: data llega como []
  // y data[0] sería undefined. "?? null" lo convierte en null, así afuera
  // basta revisar un solo caso: null = no se modificó nada.
  return data[0] ?? null;
}

// Mandar a la papelera y recuperar NO necesitan funciones nuevas de
// Supabase: son un update de UNA columna, y eso ya lo hace
// modificarProducto. toISOString() da la fecha en el formato que
// entiende una columna timestamptz: "2026-10-29T19:05:00.000Z"
function moverAPapelera(id) {
  return modificarProducto(id, { eliminado_en: new Date().toISOString() });
}

function recuperarProducto(id) {
  return modificarProducto(id, { eliminado_en: null });
}

// CRUD: Eliminar DEFINITIVAMENTE (solo se usa desde la papelera)
async function eliminarProducto(id) {

  const { data, error } = await db
    .from('productos_practica')
    .delete()
    .eq('id', id)
    .select();   // devuélveme las filas que borraste — sin esto no hay
                 // forma de saber si borró 1 fila o 0

  if (error) {
    console.log("Error al eliminar:", error);
    return false;
  }

  // Mismo caso que en modificarProducto: si el id no existe o los
  // permisos no dejan borrar, NO hay error, solo se borran 0 filas.
  // "return !error" diría true (¡borrado!) sin haber borrado nada;
  // contar las filas devueltas sí dice la verdad.
  return data.length > 0;
}

// Vaciar papelera: un solo delete que borra TODAS las filas con fecha.
// Devuelve cuántas borró (o null si hubo error).
async function vaciarPapelera() {
  const { data, error } = await db
    .from('productos_practica')
    .delete()
    .not('eliminado_en', 'is', null)
    .select('id');

  if (error) {
    console.log("Error al vaciar la papelera:", error);
    return null;
  }
  return data.length;
}


// ---------- 2. Pintar en la página ----------

const lista = document.getElementById('lista-productos');

// Los productos que se ven AHORA en pantalla (todos o los de una
// búsqueda). Cuando tocas ✏️ en una tarjeta, de aquí sale el producto
// completo para llenar el formulario, sin volver a pedirlo a Supabase.
let productosEnPantalla = [];

function formatoPrecio(numero) {
  return '$' + Math.round(numero).toLocaleString('es-CO');
}

// Crea UNA tarjeta. Todo con createElement + textContent (no innerHTML):
// los textos vienen de la base de datos, y así nunca se interpretan como HTML.
// La misma tarjeta sirve para la tienda y para la papelera: lo único que
// cambia son los botones y la fecha de eliminado. "vista === 'papelera'"
// decide cuál; vista es la variable de la parte 3.
function crearTarjeta(p) {
  const enPapelera = vista === 'papelera';
  const tarjeta = document.createElement('article');
  tarjeta.className = enPapelera ? 'tarjeta en-papelera' : 'tarjeta';

  // --- imagen (o la inicial del nombre si no hay) ---
  const caja = document.createElement('div');
  caja.className = 'tarjeta-img';

  const inicial = document.createElement('span');
  inicial.className = 'inicial';
  inicial.textContent = (p.nombre || '?').charAt(0).toUpperCase();

  if (p.image) {
    const img = document.createElement('img');
    img.src = p.image;
    img.alt = p.nombre;
    img.loading = 'lazy';   // la descarga solo cuando la tarjeta se va a ver
    // si la URL está rota, se cambia la foto por la inicial
    img.addEventListener('error', () => img.replaceWith(inicial));
    caja.appendChild(img);
  } else {
    caja.appendChild(inicial);
  }

  const id = document.createElement('span');
  id.className = 'badge id';
  id.textContent = '#' + p.id;
  caja.appendChild(id);

  // descuento se guarda como 0.15 → se muestra "-15%"
  if (p.descuento > 0) {
    const badge = document.createElement('span');
    badge.className = 'badge descuento';
    badge.textContent = `-${Math.round(p.descuento * 100)}%`;
    caja.appendChild(badge);
  }

  // --- textos ---
  const cuerpo = document.createElement('div');
  cuerpo.className = 'tarjeta-cuerpo';

  const titulo = document.createElement('h3');
  titulo.textContent = p.nombre;
  cuerpo.appendChild(titulo);

  if (p.description) {
    const desc = document.createElement('p');
    desc.className = 'descripcion';
    desc.textContent = p.description;
    cuerpo.appendChild(desc);
  }

  // Array.isArray: por si la columna llega vacía (null) en vez de [],
  // así no se rompe con null.forEach
  if (Array.isArray(p.categorias) && p.categorias.length > 0) {
    const chips = document.createElement('ul');
    chips.className = 'chips';
    p.categorias.forEach(c => {
      const li = document.createElement('li');
      li.textContent = c;
      chips.appendChild(li);
    });
    cuerpo.appendChild(chips);
  }

  // precio final = precio * (1 - descuento). Si hay descuento, el
  // precio original se muestra tachado (<s>) al lado
  const precio = document.createElement('div');
  precio.className = 'precio';
  const final = document.createElement('strong');
  final.textContent = formatoPrecio(p.precio * (1 - (p.descuento || 0)));
  precio.appendChild(final);
  if (p.descuento > 0) {
    const antes = document.createElement('s');
    antes.textContent = formatoPrecio(p.precio);
    precio.appendChild(antes);
  }
  cuerpo.appendChild(precio);

  const stock = document.createElement('p');
  stock.className = 'stock ' + (p.disponible ? 'si' : 'no');
  stock.textContent = (p.disponible ? '● Disponible' : '● Agotado') + ` · ${p.unidades} u.`;
  cuerpo.appendChild(stock);

  if (enPapelera) {
    // new Date("2026-10-29T19:05:00Z") convierte el texto de Supabase en
    // una fecha de JS, y toLocaleString la escribe en formato colombiano
    // y en TU hora local (Supabase la guarda en UTC)
    const fecha = document.createElement('p');
    fecha.className = 'fecha-eliminado';
    fecha.textContent = 'Eliminado: ' + new Date(p.eliminado_en)
      .toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
    cuerpo.appendChild(fecha);
  }

  // --- botones ---
  // data-accion y data-id: los botones NO tienen su propio listener.
  // Hay UNO solo en #lista-productos (ver parte 3) que lee estos datos
  // para saber qué botón de qué producto se tocó.
  const acciones = document.createElement('div');
  acciones.className = 'tarjeta-acciones';
  if (enPapelera) {
    acciones.append(
      crearBotonIcono('♻️', 'recuperar', p, 'icono secundario', `Recuperar ${p.nombre}`),
      crearBotonIcono('❌', 'definitivo', p, 'icono peligro', `Eliminar definitivamente ${p.nombre}`),
    );
  } else {
    acciones.append(
      crearBotonIcono('✏️', 'editar', p, 'icono secundario', `Editar ${p.nombre}`),
      crearBotonIcono('🗑', 'papelera', p, 'icono peligro', `Mandar ${p.nombre} a la papelera`),
    );
  }

  tarjeta.append(caja, cuerpo, acciones);
  return tarjeta;
}

function crearBotonIcono(icono, accion, producto, clases, etiqueta) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = clases;
  boton.textContent = icono;
  boton.dataset.accion = accion;     // → atributo data-accion="editar"
  boton.dataset.id = producto.id;    // → atributo data-id="3"
  boton.setAttribute('aria-label', etiqueta);  // el ícono solo no dice nada a un lector de pantalla
  return boton;
}

function mensajeVacio(texto) {
  const p = document.createElement('p');
  p.className = 'vacio';
  p.textContent = texto;
  return p;
}

function pintarProductos(productos) {
  productosEnPantalla = productos;

  if (productos.length === 0) {
    lista.replaceChildren(mensajeVacio(
      vista === 'papelera' ? 'La papelera está vacía' : 'No hay productos para mostrar'));
    return;
  }
  // map() convierte cada producto en una tarjeta; los "..." (spread)
  // pasan el array como argumentos sueltos: replaceChildren(t1, t2, t3)
  lista.replaceChildren(...productos.map(crearTarjeta));
}

// Las listas de práctica de antes (map / filter), ahora dentro del
// bloque plegable "Ver datos crudos"
function listaPildoras(textos) {
  const ul = document.createElement('ul');
  textos.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });
  return ul;
}

function pintarDatosCrudos(data) {
  // map() transforma: de objetos completos a solo strings
  const nombres = data.map(producto => producto.nombre);
  document.getElementById('resultado2').replaceChildren(listaPildoras(nombres));

  // filter() mantiene solo los elementos para los que la función
  // devuelve true — "disponible" ya es booleano, así que basta con
  // devolverlo. A diferencia de map(), no transforma: solo escoge.
  const disponibles = data.filter(producto => producto.disponible);
  document.getElementById('resultado3').replaceChildren(listaPildoras(disponibles.map(p => p.nombre)));

  const precios = data.map(producto => producto.precio);
  document.getElementById('resultado4').replaceChildren(listaPildoras(precios.map(formatoPrecio)));

  // JSON.stringify(data, null, 2) convierte el array completo a texto,
  // con sangría (el "2") para que se lea ordenado
  document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
}

// Aviso flotante abajo ("toast"). Se esconde solo a los 3,5 segundos.
const aviso = document.getElementById('aviso');
let temporizadorAviso;

function mostrarAviso(texto, esError = false) {
  aviso.textContent = texto;
  aviso.classList.toggle('error', esError);   // toggle(clase, true/false) la pone o la quita
  aviso.hidden = false;
  // si llega un aviso nuevo antes de que se esconda el anterior, se
  // cancela el temporizador viejo — si no, el viejo escondería al nuevo
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { aviso.hidden = true; }, 3500);
}


// ---------- 3. Eventos ----------

const formBuscar = document.getElementById('form-buscar');
const estadoBusqueda = document.getElementById('estado-busqueda');

const btnPapelera = document.getElementById('btn-papelera');

// ¿Qué se está viendo? 'tienda' o 'papelera'. Una sola variable decide
// qué pinta cargarVista(), qué botones lleva cada tarjeta y qué partes
// de la página se esconden.
let vista = 'tienda';

// Si falta la columna, Postgres responde el código 42703 ("undefined
// column"). En vez de un "mira la consola", decimos exactamente qué hacer.
function textoDeError(error) {
  if (error.code === '42703') {
    return 'Falta la columna "eliminado_en" en productos_practica. Créala en Supabase ' +
           '(Table Editor → Insert column → tipo timestamptz, sin valor por defecto) y recarga.';
  }
  return 'No se pudieron traer los productos — mira la consola';
}

// Trae de Supabase la tienda Y la papelera, y pinta la vista actual. Se
// llama al abrir la página y después de cada acción, para que lo que ves
// sea siempre lo que hay en la base de datos.
async function cargarVista() {
  // Promise.all lanza las DOS consultas a la vez y espera a que terminen
  // ambas: tarda lo que la más lenta, no la suma de las dos
  const [tienda, papelera] = await Promise.all([traerProductos(), traerPapelera()]);

  const error = tienda.error || papelera.error;
  if (error) {
    lista.replaceChildren(mensajeVacio(textoDeError(error)));
    return;
  }

  const enPapelera = vista === 'papelera';
  const n = papelera.productos.length;
  btnPapelera.textContent = enPapelera ? '← Tienda' : `🗑 Papelera (${n})`;

  // en la papelera no se busca ni se crea: se esconden esas partes
  formBuscar.hidden = enPapelera;
  document.getElementById('btn-nuevo').hidden = enPapelera;
  document.getElementById('datos-crudos').hidden = enPapelera;
  document.getElementById('barra-papelera').hidden = !enPapelera;
  document.getElementById('btn-vaciar').hidden = n === 0;   // nada que vaciar
  estadoBusqueda.hidden = true;

  if (enPapelera) {
    pintarProductos(papelera.productos);
  } else {
    pintarProductos(tienda.productos);
    pintarDatosCrudos(tienda.productos);
  }
}

// 🏠 Inicio: deja todo como al abrir la página — vista tienda, sin
// búsqueda — y sube al principio. behavior: 'smooth' hace que el scroll
// se deslice en vez de saltar
document.getElementById('btn-inicio').addEventListener('click', () => {
  vista = 'tienda';
  formBuscar.reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cargarVista();
});

btnPapelera.addEventListener('click', () => {
  vista = vista === 'tienda' ? 'papelera' : 'tienda';
  formBuscar.reset();
  cargarVista();
});

document.getElementById('btn-vaciar').addEventListener('click', async () => {
  const n = productosEnPantalla.length;
  if (!confirm(`¿Eliminar DEFINITIVAMENTE los ${n} productos de la papelera? Esto no se puede deshacer.`)) return;

  const borrados = await vaciarPapelera();
  if (borrados === null) {
    mostrarAviso('No se pudo vaciar — mira la consola', true);
  } else {
    mostrarAviso(`Papelera vaciada: ${borrados} ${borrados === 1 ? 'producto' : 'productos'}`);
  }
  cargarVista();
});

// Buscar: un número busca por id; texto busca por nombre.
formBuscar.addEventListener('submit', async (event) => {
  event.preventDefault();   // sin recarga de la página

  const texto = formBuscar.busqueda.value.trim();
  if (texto === '') {        // buscar vacío = volver a ver todos
    cargarVista();
    return;
  }

  // /^\d+$/ = "solo dígitos de principio a fin" → "12" sí, "12a" no
  let productos;
  if (/^\d+$/.test(texto)) {
    const producto = await buscarProductoPorId(Number(texto));
    // buscarProductoPorId devuelve UN objeto (o null); lo metemos en un
    // array para pintar los dos casos con la misma función
    productos = producto ? [producto] : [];
  } else {
    productos = await buscarProductosPorNombre(texto);
  }

  pintarProductos(productos);
  const n = productos.length;
  document.getElementById('texto-busqueda').textContent =
    `${n} ${n === 1 ? 'resultado' : 'resultados'} para "${texto}"`;
  estadoBusqueda.hidden = false;
});

document.getElementById('btn-ver-todos').addEventListener('click', () => {
  formBuscar.reset();
  cargarVista();
});


// --- Modal de crear / editar ---
const modal = document.getElementById('modal-producto');
const form = document.getElementById('form-producto');
const btnGuardar = document.getElementById('btn-guardar');

// null = el modal está CREANDO; un número = está EDITANDO ese id.
// Con esta sola variable el mismo formulario sirve para las dos cosas.
let idEditando = null;

function abrirModal(producto = null) {
  form.reset();
  idEditando = producto ? producto.id : null;

  document.getElementById('modal-titulo').textContent =
    producto ? `Editar #${producto.id}` : 'Nuevo producto';
  btnGuardar.textContent = producto ? 'Guardar cambios' : 'Crear producto';

  if (producto) {
    // al revés que leerFormulario(): del producto hacia los campos
    form.nombre.value = producto.nombre ?? '';
    form.description.value = producto.description ?? '';
    form.precio.value = producto.precio;
    form.unidades.value = producto.unidades;
    form.descuento.value = Math.round((producto.descuento || 0) * 100);   // 0.15 → 15
    form.disponible.checked = Boolean(producto.disponible);
    form.categorias.value = Array.isArray(producto.categorias) ? producto.categorias.join(', ') : '';
    form.image.value = producto.image ?? '';
  }

  modal.showModal();   // showModal() (no show()) = encima de todo + fondo oscuro + Escape cierra
}

// Lee los campos y arma el objeto con los nombres de las columnas
function leerFormulario() {
  // .value SIEMPRE es texto (aunque el input sea type="number"),
  // así que los números se convierten con Number()
  return {
    nombre: form.nombre.value.trim(),
    description: form.description.value.trim(),
    precio: Number(form.precio.value),
    unidades: Number(form.unidades.value),
    // el form pide 0–100 (%), pero la columna guarda 0.15 para 15%
    descuento: Number(form.descuento.value) / 100,
    // un checkbox no se lee con .value sino con .checked (true/false)
    disponible: form.disponible.checked,
    // "tecnología, audio" → ["tecnología", "audio"]; filter(Boolean)
    // quita los vacíos si sobra una coma al final
    categorias: form.categorias.value.split(',').map(c => c.trim()).filter(Boolean),
    // si no pegan URL, se guarda null en vez de un texto vacío
    image: form.image.value.trim() || null,
  };
}

document.getElementById('btn-nuevo').addEventListener('click', () => abrirModal());
document.getElementById('btn-cancelar').addEventListener('click', () => modal.close());

// Clic en la capa oscura de afuera = cerrar. Si el clic cae en el fondo,
// event.target es el <dialog> mismo; si cae en el form, es un campo.
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});

form.addEventListener('submit', async (event) => {
  // preventDefault() cancela la recarga: ahora JS decide qué pasa
  event.preventDefault();

  const datos = leerFormulario();

  // botón apagado mientras Supabase responde: evita que un doble clic
  // cree el mismo producto dos veces
  btnGuardar.disabled = true;

  let guardado;
  if (idEditando === null) {
    guardado = await agregarProducto(datos);
  } else {
    // el form ya viene lleno con los datos actuales, así que "cambios"
    // trae TODAS las columnas: las que no tocaste van con su mismo valor
    guardado = await modificarProducto(idEditando, datos);
  }

  btnGuardar.disabled = false;

  if (!guardado) {
    // el modal se queda abierto para no perder lo que escribiste
    mostrarAviso('No se pudo guardar — mira el error en la consola', true);
    return;
  }

  modal.close();
  mostrarAviso(idEditando === null ? `Creado: ${guardado.nombre}` : `Guardado: ${guardado.nombre}`);
  formBuscar.reset();
  cargarVista();
});


// --- Botones de las tarjetas: ✏️ 🗑 (tienda) y ♻️ ❌ (papelera) ---
// "Delegación de eventos": en vez de un listener por botón (que habría
// que volver a poner cada vez que se repintan las tarjetas), hay UNO en
// la lista. El clic "sube" (burbujea) desde el botón hasta aquí, y
// closest() encuentra qué botón fue.
lista.addEventListener('click', async (event) => {
  const boton = event.target.closest('button[data-accion]');
  if (!boton) return;   // el clic fue en otra parte de la tarjeta

  // dataset.id es texto ("3"); los id de Supabase son números
  const producto = productosEnPantalla.find(p => p.id === Number(boton.dataset.id));
  if (!producto) return;

  const accion = boton.dataset.accion;

  if (accion === 'editar') {
    abrirModal(producto);
    return;
  }

  // ❌ es lo único que no se puede deshacer, así que es lo único que
  // pide confirmación. confirm() ESPERA la respuesta (true = Aceptar).
  // 🗑 no pregunta: si te equivocas, lo recuperas con ♻️
  if (accion === 'definitivo' &&
      !confirm(`¿Eliminar DEFINITIVAMENTE #${producto.id} ${producto.nombre}? Esto no se puede deshacer.`)) {
    return;
  }

  boton.disabled = true;

  // las 3 acciones devuelven algo "verdadero" si funcionó (la fila o
  // true) y null/false si no — por eso se pueden revisar con un solo if
  let ok;
  let mensaje;
  if (accion === 'papelera') {
    ok = await moverAPapelera(producto.id);
    mensaje = `A la papelera: ${producto.nombre}`;
  } else if (accion === 'recuperar') {
    ok = await recuperarProducto(producto.id);
    mensaje = `Recuperado: ${producto.nombre}`;
  } else if (accion === 'definitivo') {
    ok = await eliminarProducto(producto.id);
    mensaje = `Eliminado para siempre: ${producto.nombre}`;
  }

  if (ok) {
    mostrarAviso(mensaje);
    cargarVista();
  } else {
    boton.disabled = false;
    mostrarAviso('No funcionó — puede que los permisos de la tabla no lo dejen (mira la consola)', true);
  }
});


// Al abrir la página se cargan los productos solos — ya no hace falta
// un botón "Traer productos"
cargarVista();
