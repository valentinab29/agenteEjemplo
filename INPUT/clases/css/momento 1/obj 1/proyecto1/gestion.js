// JS propio de gestion.html. Usa el arreglo "emociones" que viene de data.js,
// por eso gestion.html debe cargar data.js ANTES que este archivo.

// Todo el archivo va dentro de una IIFE (función que se ejecuta de una vez):
// así las variables y funciones de aquí quedan "privadas" a esta función y NO
// son globales — desde la consola, guardarEmociones(), mostrarTodos(),
// sesionIniciada, etc. dan ReferenceError. Ojo: "emociones" y "siguienteId"
// siguen siendo globales porque se declaran en data.js, fuera de esta función.
(function () {
  // Pasa a true solo con un login correcto. Como vive dentro de la IIFE, no
  // se puede cambiar desde la consola; cada operación del CRUD lo revisa antes
  // de hacer algo, así que disparar los forms a mano (ej. requestSubmit())
  // sin haber iniciado sesión no tiene efecto.
  let sesionIniciada = false;

  const botonesSidebar = document.querySelectorAll(".sidebar-item");
  const vistas = document.querySelectorAll(".vista");

  // Muestra la sección "vista-<nombreVista>" y oculta el resto; marca el
  // botón del sidebar correspondiente como activo.
  function mostrarVista(nombreVista) {
    vistas.forEach(vista => {
      vista.hidden = vista.id !== `vista-${nombreVista}`;
    });
    botonesSidebar.forEach(boton => {
      boton.classList.toggle("activo", boton.dataset.vista === nombreVista);
    });
  }

  botonesSidebar.forEach(boton => {
    boton.addEventListener("click", () => mostrarVista(boton.dataset.vista));
  });

  const listaTodos = document.getElementById("lista-todos");

  // Arma y devuelve la tarjeta (<div class="item-todos">) de UNA emoción, sin
  // agregarla a la página: quien la llama decide en qué grid ponerla. Así la
  // misma tarjeta sirve para "Mostrar todos" y para los resultados de "Buscar".
  function crearItem(emocion) {
    const item = document.createElement("div");
    item.className = "item-todos";
    item.style.setProperty("--color-item", emocion.color);

    const imagen = document.createElement("img");
    imagen.className = "item-todos-imagen";
    imagen.src = emocion.imagen;
    imagen.alt = emocion.nombre;

    const nombre = document.createElement("strong");
    nombre.textContent = emocion.nombre;

    const intensidad = document.createElement("span");
    intensidad.textContent = `Intensidad: ${emocion.nivelIntensidad}/100`;

    const info = document.createElement("div");
    info.className = "item-todos-info";
    info.append(nombre, intensidad);

    item.append(imagen, info);
    return item;
  }

  // Pinta un item por cada emoción de "emociones" dentro de #lista-todos.
  function mostrarTodos() {
    listaTodos.innerHTML = "";
    emociones.forEach(emocion => {
      listaTodos.appendChild(crearItem(emocion));
    });
  }

  // Vuelve a pintar todo lo que depende de "emociones" (grid, selects y
  // resultados de búsqueda). Se llama después de crear, actualizar o
  // eliminar, para que ninguna vista quede mostrando datos viejos.
  function refrescarVistas() {
    mostrarTodos();
    llenarSelectActualizar();
    llenarSelectEliminar();
    buscar();
  }

  const buscarTexto = document.getElementById("buscar-texto");
  const buscarResultados = document.getElementById("buscar-resultados");
  const buscarMensaje = document.getElementById("buscar-mensaje");

  // "Vergüenza" -> "verguenza": normalize("NFD") separa cada letra de su
  // tilde/diéresis, el replace borra esas marcas y toLowerCase quita las
  // mayúsculas. Así la búsqueda no depende de cómo se escriba el nombre.
  function normalizar(texto) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  // Pinta en #buscar-resultados las emociones cuyo nombre contiene lo escrito.
  function buscar() {
    if (!sesionIniciada) return;
    buscarResultados.innerHTML = "";
    buscarMensaje.hidden = true;

    const textoBuscado = normalizar(buscarTexto.value.trim());
    if (textoBuscado === "") return;

    const encontradas = emociones.filter(emocion =>
      normalizar(emocion.nombre).includes(textoBuscado)
    );

    if (encontradas.length === 0) {
      buscarMensaje.textContent = "Sin resultados.";
      buscarMensaje.hidden = false;
      return;
    }

    encontradas.forEach(emocion => {
      buscarResultados.appendChild(crearItem(emocion));
    });
  }

  buscarTexto.addEventListener("input", buscar);

  const selectEliminar = document.getElementById("eliminar-select");
  const botonEliminar = document.getElementById("eliminar-boton");
  const eliminarMensaje = document.getElementById("eliminar-mensaje");

  // Llena el <select> de Eliminar. El value es el id (no la posición en el
  // arreglo): así se borra exactamente esa emoción aunque el orden cambie.
  function llenarSelectEliminar() {
    selectEliminar.innerHTML = '<option value="">-- Elige una emoción --</option>';
    emociones.forEach(emocion => {
      const opcion = document.createElement("option");
      opcion.value = String(emocion.id);
      opcion.textContent = emocion.nombre;
      selectEliminar.appendChild(opcion);
    });
  }

  botonEliminar.addEventListener("click", function () {
    if (!sesionIniciada) return;

    if (selectEliminar.value === "") {
      eliminarMensaje.textContent = "Primero elige una emoción.";
      eliminarMensaje.hidden = false;
      return;
    }

    const idElegido = Number(selectEliminar.value);
    const indice = emociones.findIndex(emocion => emocion.id === idElegido);
    if (indice === -1) return;

    const nombre = emociones[indice].nombre;
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

    // splice(indice, 1) quita 1 elemento desde esa posición, modificando el
    // mismo arreglo "emociones" que usan data.js e index.html.
    emociones.splice(indice, 1);
    guardarEmociones();

    // refrescarVistas() también cierra el form de Actualizar: si justo se
    // estaba editando la emoción borrada, así no queda apuntando a otra.
    refrescarVistas();

    eliminarMensaje.textContent = `"${nombre}" se eliminó correctamente.`;
    eliminarMensaje.hidden = false;
  });

  const formCrear = document.getElementById("form-crear");
  const crearMensaje = document.getElementById("crear-mensaje");

  // Arma una emoción nueva con los datos del form y la agrega a "emociones".
  formCrear.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!sesionIniciada) return;

    const nombre = document.getElementById("crear-nombre").value.trim();
    const color = document.getElementById("crear-color").value;
    const imagen = document.getElementById("crear-imagen").value.trim();
    const edad = Number(document.getElementById("crear-edad").value);
    const nivelIntensidad = Number(document.getElementById("crear-intensidad").value);
    const esNueva = document.getElementById("crear-nueva").checked;
    const esMasculino = document.getElementById("crear-masculino").checked;

    // "Alegría, Miedo" -> ["Alegría", "Miedo"]; se descartan espacios vacíos
    // sueltos (ej. si quedó una coma de más al final).
    const relacionadasTexto = document.getElementById("crear-relacionadas").value.trim();
    const emocionesRelacionadas = relacionadasTexto === ""
      ? []
      : relacionadasTexto.split(",").map(texto => texto.trim()).filter(texto => texto !== "");

    if (nombre === "" || imagen === "") {
      crearMensaje.textContent = "Nombre e imagen son obligatorios.";
      crearMensaje.hidden = false;
      return;
    }

    // "siguienteId" viene de data.js; se usa y luego se incrementa para que la
    // próxima emoción creada (sin recargar la página) reciba otro id.
    emociones.push({
      id: siguienteId,
      nombre,
      color,
      imagen,
      edad,
      nivelIntensidad,
      esNueva,
      esMasculino,
      emocionesRelacionadas,
    });
    siguienteId++;

    guardarEmociones();

    crearMensaje.textContent = `"${nombre}" se agregó correctamente.`;
    crearMensaje.hidden = false;
    formCrear.reset();
    refrescarVistas();
  });

  // Guarda el array completo en localStorage para que index.html (y cualquier
  // recarga de gestion.html) lea esta misma versión desde data.js.
  function guardarEmociones() {
    if (!sesionIniciada) return;
    localStorage.setItem("emociones", JSON.stringify(emociones));
  }

  const selectActualizar = document.getElementById("actualizar-select");
  const formActualizar = document.getElementById("form-actualizar");
  const actualizarMensaje = document.getElementById("actualizar-mensaje");

  // Llena el <select> con el nombre de cada emoción, para elegir cuál editar.
  // Como el select vuelve a "-- Elige --", también se cierra el form: si
  // quedara abierto, un submit usaría Number("") = 0 y sobrescribiría la
  // primera emoción del arreglo.
  function llenarSelectActualizar() {
    selectActualizar.innerHTML = '<option value="">-- Elige una emoción --</option>';
    emociones.forEach((emocion, indice) => {
      const opcion = document.createElement("option");
      opcion.value = String(indice);
      opcion.textContent = emocion.nombre;
      selectActualizar.appendChild(opcion);
    });
    formActualizar.hidden = true;
  }

  // Al elegir una emoción del <select>, carga sus datos actuales en el form.
  selectActualizar.addEventListener("change", function () {
    if (!sesionIniciada) return;
    actualizarMensaje.hidden = true;

    if (selectActualizar.value === "") {
      formActualizar.hidden = true;
      return;
    }

    const emocion = emociones[Number(selectActualizar.value)];
    formActualizar.hidden = false;

    document.getElementById("actualizar-nombre").value = emocion.nombre;
    document.getElementById("actualizar-color").value = emocion.color;
    document.getElementById("actualizar-imagen").value = emocion.imagen;
    document.getElementById("actualizar-edad").value = emocion.edad;
    document.getElementById("actualizar-intensidad").value = emocion.nivelIntensidad;
    document.getElementById("actualizar-nueva").checked = emocion.esNueva;
    document.getElementById("actualizar-masculino").checked = emocion.esMasculino;
    document.getElementById("actualizar-relacionadas").value = emocion.emocionesRelacionadas.join(", ");
  });

  // Sobrescribe la emoción elegida con los valores (editados) del form.
  formActualizar.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!sesionIniciada || selectActualizar.value === "") return;

    const indice = Number(selectActualizar.value);
    const relacionadasTexto = document.getElementById("actualizar-relacionadas").value.trim();

    // El id no se edita desde el form: se conserva el que ya tenía la emoción.
    emociones[indice] = {
      id: emociones[indice].id,
      nombre: document.getElementById("actualizar-nombre").value.trim(),
      color: document.getElementById("actualizar-color").value,
      imagen: document.getElementById("actualizar-imagen").value.trim(),
      edad: Number(document.getElementById("actualizar-edad").value),
      nivelIntensidad: Number(document.getElementById("actualizar-intensidad").value),
      esNueva: document.getElementById("actualizar-nueva").checked,
      esMasculino: document.getElementById("actualizar-masculino").checked,
      emocionesRelacionadas: relacionadasTexto === ""
        ? []
        : relacionadasTexto.split(",").map(texto => texto.trim()).filter(texto => texto !== ""),
    };

    guardarEmociones();
    refrescarVistas();

    // refrescarVistas() dejó el select en "-- Elige --" y cerró el form; se
    // vuelve a elegir la misma emoción para poder seguir editándola.
    selectActualizar.value = String(indice);
    formActualizar.hidden = false;

    actualizarMensaje.textContent = `"${emociones[indice].nombre}" se actualizó correctamente.`;
    actualizarMensaje.hidden = false;
  });

  const seccionLogin = document.getElementById("login");
  const layoutCrud = document.querySelector(".layout");
  const formLogin = document.getElementById("form-login");
  const loginMensaje = document.getElementById("login-mensaje");

  // La verificación la hace validarLogin() de login.js. Solo si devuelve
  // true se marca la sesión como iniciada, se muestra el CRUD y se pinta su
  // contenido; si no, el .layout sigue oculto y vacío.
  formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const usuarioEscrito = document.getElementById("login-usuario").value.trim();
    const passwordEscrito = document.getElementById("login-password").value;

    if (!validarLogin(usuarioEscrito, passwordEscrito)) {
      loginMensaje.textContent = "Usuario o contraseña incorrectos.";
      loginMensaje.hidden = false;
      document.getElementById("login-password").value = "";
      return;
    }

    sesionIniciada = true;
    seccionLogin.hidden = true;
    layoutCrud.hidden = false;

    mostrarVista("todos");
    refrescarVistas();
  });
})();
