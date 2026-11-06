async function registrarCliente(nombre, correo, contrasena) {
// db.auth.signUp() NO toca ninguna tabla tuya todavía — habla directo con
// el sistema de autenticación interno de Supabase (algo así como una
// tabla especial, auth.users, que tú no administras a mano). Le mandas
// correo y contraseña, y Supabase por detrás: valida el formato del
// correo, guarda la contraseña de forma segura (nunca en texto plano),
// y crea un identificador único nuevo (un uuid) para esta persona.
//
// El resultado llega en dos partes, igual que en todas las llamadas a
// Supabase que ya conoces (data / error):
// - data.user → los datos del usuario recién creado. data.user.id
// es el uuid real — EL MISMO que vamos a usar como id
// en clientes_practica, dos líneas más abajo.
// - data.session → si tu proyecto exige confirmar el correo antes de
// dejar entrar (ver guía, sección 7), esto llega en
// null: el usuario ya existe, pero todavía no hay
// sesión iniciada hasta que confirme.
const { data, error } = await db.auth.signUp({
email: correo,
password: contrasena,
});
// Mismo patrón de "revisar error antes de seguir" que ya usaste en el
// CRUD de productos — si signUp() falló (correo repetido, contraseña
// muy corta, etc.), ni siquiera intentamos el segundo paso.
if (error) {
console.log('Error al registrar:', error);
return { cliente: null, sesion: null, error };
}
// Ahora sí tocamos una tabla tuya: clientes_practica. Este insert() es
// igual al que ya usaste en agregarProducto() — la única diferencia es
// que aquí SÍ mandamos el id a mano (data.user.id), en vez de dejar que
// Supabase lo autogenere, porque este id tiene que coincidir exactamente
// con el que Auth le acaba de asignar al usuario.
const { data: cliente, error: errorCliente } = await db
.from('clientes_practica')
.insert([{ id: data.user.id, nombre, correo, rol: 'cliente' }])
.select();
if (errorCliente) {
console.log('Error al crear el perfil:', errorCliente);
return { cliente: null, sesion: data.session, error: errorCliente };
}
// Devolvemos un objeto con la misma forma que usa Supabase ({ ..., error }):
// así quien llama a esta función puede mostrar el error REAL, no uno genérico.
// sesion llega en null si el proyecto exige confirmar el correo.
return { cliente: cliente[0], sesion: data.session, error: null };
}

// Traduce los errores de Supabase que más salen a un mensaje claro. Antes
// cualquier error mostraba "Correo o contraseña incorrectos", y eso
// escondía la causa real (por ejemplo, "Email not confirmed").
function mensajeDeError(error) {
if (error.message === 'Email not confirmed') {
return 'Tu correo todavía no está confirmado. Confírmalo (o desactiva "Confirm email" en Supabase) y vuelve a intentar.';
}
if (error.message === 'Invalid login credentials') {
return 'Correo o contraseña incorrectos.';
}
if (error.message === 'User already registered') {
return 'Ese correo ya tiene una cuenta. Inicia sesión.';
}
// 429 = "Too Many Requests": Supabase limita cuántos correos manda por hora.
if (error.status === 429) {
return 'Demasiados intentos seguidos. Espera un rato y vuelve a intentar.';
}
// Para cualquier otro caso, mostramos el mensaje original de Supabase.
return 'Error: ' + error.message;
}


// 'submit' es el evento que dispara un <form> cuando alguien hace clic en
// su botón de tipo submit (o presiona Enter dentro de un campo). Por
// defecto, ese evento hace que el navegador RECARGUE la página entera —
// comportamiento heredado de cuando los formularios mandaban sus datos a
// otra página de servidor, décadas atrás. Como aquí todo lo manejamos con
// JavaScript (sin recargar nada), hay que apagar ese comportamiento a
// propósito.
document.getElementById('form-registro').addEventListener('submit', async (event) => {
// event.preventDefault() le dice al navegador "no hagas lo que harías
// normalmente con este evento" — en este caso, no recargues la página.
// Sin esta línea, la página se refrescaría apenas se hiciera clic en
// "Crear cuenta", y perderías cualquier mensaje que fueras a mostrar.
event.preventDefault();
// event.target es el elemento que disparó el evento — en un 'submit',
// siempre es el propio <form>. Lo guardamos en una variable para poder
// usarlo más abajo (form.reset()) sin tener que volver a buscarlo.
const form = event.target;
// Destructuring: sacamos cliente, sesion y error del objeto que devuelve
// registrarCliente, igual que haces con { data, error } de Supabase.
const { cliente, sesion, error } = await registrarCliente(
document.getElementById('registro-nombre').value.trim(),
document.getElementById('registro-correo').value.trim(),
document.getElementById('registro-password').value
);
if (error) {
document.getElementById('estado-sesion').textContent = mensajeDeError(error);
return; // cortamos aquí: no hay nada más que hacer si falló
}
form.reset(); // vacía los 3 campos del formulario, para la próxima persona
if (sesion) {
// "Confirm email" está apagado: signUp() ya deja la sesión iniciada.
mostrarEstadoSesion();
} else {
document.getElementById('estado-sesion').textContent =
'Cuenta creada para ' + cliente.correo + '. Confirma tu correo y luego inicia sesión.';
}
});

async function iniciarSesion(correo, contrasena) {
// db.auth.signInWithPassword() es para alguien que YA se registró antes
// (sección 4.1) — no crea ningún usuario nuevo, solo verifica que el
// correo y la contraseña coincidan con uno que ya existe en Auth.
//
// Lo importante pasa "por detrás", sin que se vea en este código: si la
// verificación sale bien, el cliente de Supabase (la variable db, la
// misma de siempre) GUARDA la sesión internamente — normalmente en el
// almacenamiento del navegador — y, desde este momento, la adjunta sola
// a cada petición futura que hagas con db, sea a productos_practica, a
// clientes_practica o a cualquier otra tabla. No hay que "pasarle" el
// usuario a mano a ninguna otra función.
const { data, error } = await db.auth.signInWithPassword({
email: correo,
password: contrasena,
});
if (error) {
console.log('Error al iniciar sesión:', error);
return { usuario: null, error };
}
// Aquí data.user también trae el id real del usuario — el mismo valor
// que auth.uid() va a devolver dentro de cualquier política de RLS
// mientras esta sesión siga activa.
return { usuario: data.user, error: null };
}
// Mismo patrón explicado en el formulario de registro: 'submit' es el
// evento del <form>, y hay que apagar la recarga automática de página.
document.getElementById('form-login').addEventListener('submit', async (event) => {
event.preventDefault(); // evita que el navegador recargue la página
const form = event.target; // el propio <form>, guardado para usar después
const { usuario, error } = await iniciarSesion(
document.getElementById('login-correo').value.trim(),
document.getElementById('login-password').value
);
if (usuario) {
form.reset();
mostrarEstadoSesion();
} else {
// Mensaje según el error real (antes siempre decía "incorrectos").
document.getElementById('estado-sesion').textContent = mensajeDeError(error);
}
});

// Muestra en la página si hay alguien con sesión iniciada, y deja ver solo
// lo que tiene sentido: sin sesión → los dos formularios; con sesión → el
// botón de cerrar sesión.
async function mostrarEstadoSesion() {
// getSession() no habla con ninguna tabla: lee la sesión que el cliente
// de Supabase guardó en el navegador al iniciar sesión. Por eso, si
// recargas la página, sigues con la sesión iniciada.
const { data } = await db.auth.getSession();
const sesion = data.session;
const estado = document.getElementById('estado-sesion');
// hidden es un atributo de HTML: true = el elemento no se muestra.
document.getElementById('form-registro').hidden = Boolean(sesion);
document.getElementById('form-login').hidden = Boolean(sesion);
document.getElementById('btn-logout').hidden = !sesion;
// El menú lateral (y su botón ☰ en celular) solo existe con sesión iniciada.
document.getElementById('menu-lateral').hidden = !sesion;
document.getElementById('btn-menu').hidden = !sesion;
// Las dos vistas empiezan ocultas; se muestra una solo si pudimos leer la fila.
document.getElementById('vista-inicio').hidden = true;
document.getElementById('form-datos').hidden = true;
if (!sesion) {
estado.textContent = 'No has iniciado sesión.';
return;
}
// PRIMERO leemos los datos del cliente; DESPUÉS los ponemos en el formulario.
const { cliente, error } = await leerCliente(sesion.user.id);
if (error) {
estado.textContent = mensajeDeError(error);
return;
}
if (!cliente) {
// Sin error pero sin fila: o no existe en clientes_practica, o la política
// de RLS de select no te deja verla (RLS no da error, solo devuelve 0 filas).
estado.textContent = 'Sesión iniciada como ' + sesion.user.email +
', pero no se encontraron tus datos en clientes_practica (revisa la política de select).';
return;
}
estado.textContent = 'Sesión iniciada como ' + cliente.nombre + '.';
llenarFormularioDatos(cliente);
mostrarVista('inicio'); // al entrar, se ve Inicio; los datos se abren desde el menú
}

// Cambia lo que se ve en la parte principal según el ítem del menú.
// No cambia de página: los dos bloques ya están en el HTML, y aquí solo
// decidimos cuál lleva hidden. nombre es 'inicio' o 'configuracion'.
function mostrarVista(nombre) {
document.getElementById('vista-inicio').hidden = nombre !== 'inicio';
document.getElementById('form-datos').hidden = nombre !== 'configuracion';
// classList.toggle(clase, condición) pone la clase si la condición es
// true y la quita si es false: así se marca solo el ítem activo.
document.querySelectorAll('.menu-item').forEach((boton) => {
boton.classList.toggle('activo', boton.dataset.vista === nombre);
});
// En celular, al elegir algo cerramos el menú para que se vea el contenido.
document.getElementById('menu-lateral').classList.remove('abierto');
}

// dataset.vista lee el atributo data-vista="..." del botón. Así un solo
// listener sirve para todos los ítems: cada botón dice a qué vista va.
document.querySelectorAll('.menu-item').forEach((boton) => {
boton.addEventListener('click', () => mostrarVista(boton.dataset.vista));
});

// Botón ☰ (solo se ve en celular): abre o cierra el menú lateral.
document.getElementById('btn-menu').addEventListener('click', () => {
document.getElementById('menu-lateral').classList.toggle('abierto');
});

// Lee la fila del cliente con sesión iniciada. Usamos el id del usuario de
// Auth (el mismo id que guardamos al registrarlo). maybeSingle() devuelve
// un solo objeto, o null si no hay fila, en vez de un arreglo.
async function leerCliente(id) {
const { data, error } = await db
.from('clientes_practica')
// rol no se pide: el cliente no lo edita. Ojo: la columna se llama
// "dirección" CON tilde en Supabase, así que hay que escribirla igual.
.select('id, nombre, correo, telefono, dirección')
.eq('id', id)
.maybeSingle();
if (error) {
console.log('Error al leer el cliente:', error);
return { cliente: null, error };
}
return { cliente: data, error: null };
}

// Pone cada dato leído en su campo. .value es lo que se ve escrito dentro
// del <input>: asignarlo es como si alguien lo hubiera tecleado.
function llenarFormularioDatos(cliente) {
document.getElementById('datos-nombre').value = cliente.nombre;
document.getElementById('datos-correo').value = cliente.correo;
// telefono y dirección pueden venir en null (nunca se llenaron); ?? '' deja
// el campo vacío en vez de escribir la palabra "null".
document.getElementById('datos-telefono').value = cliente.telefono ?? '';
// cliente.dirección con punto también funcionaría (JS acepta tildes), pero
// con corchetes y comillas queda claro que es el nombre exacto de la columna.
document.getElementById('datos-direccion').value = cliente['dirección'] ?? '';
}

// update() cambia las columnas que le pasas, solo en las filas que cumplan
// el .eq(). Sin el .eq('id', ...) intentaría cambiar TODAS las filas.
// .select() al final hace que Supabase devuelva las filas cambiadas: si
// vuelve vacío, no se actualizó nada (otra vez, RLS no avisa con error).
async function actualizarCliente(id, cambios) {
const { data, error } = await db
.from('clientes_practica')
.update(cambios)
.eq('id', id)
.select('id, nombre, correo, telefono, dirección');
if (error) {
console.log('Error al actualizar el cliente:', error);
return { cliente: null, error };
}
return { cliente: data[0] ?? null, error: null };
}

document.getElementById('form-datos').addEventListener('submit', async (event) => {
event.preventDefault(); // mismo patrón: sin esto la página se recarga
const estado = document.getElementById('estado-sesion');
const { data } = await db.auth.getSession();
if (!data.session) {
mostrarEstadoSesion(); // la sesión se cerró: volvemos a los formularios
return;
}
// El correo es de solo lectura y rol no se toca, así que no se mandan.
// || null: si el campo quedó vacío, guardamos null (sin dato) en vez de ''.
const { cliente, error } = await actualizarCliente(data.session.user.id, {
nombre: document.getElementById('datos-nombre').value.trim(),
telefono: document.getElementById('datos-telefono').value.trim() || null,
'dirección': document.getElementById('datos-direccion').value.trim() || null,
});
if (error) {
estado.textContent = mensajeDeError(error);
} else if (!cliente) {
estado.textContent = 'No se guardó nada: revisa la política de update en clientes_practica.';
} else {
estado.textContent = 'Datos guardados. Sesión iniciada como ' + cliente.nombre + '.';
llenarFormularioDatos(cliente); // mostramos lo que quedó guardado de verdad
}
});

document.getElementById('btn-logout').addEventListener('click', async () => {
// signOut() borra la sesión que el cliente guardó en el navegador; desde
// aquí, las peticiones con db vuelven a ir sin usuario.
await db.auth.signOut();
mostrarEstadoSesion();
});

// Al abrir la página revisamos si ya había una sesión guardada.
mostrarEstadoSesion();
