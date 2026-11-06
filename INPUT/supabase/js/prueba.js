document.getElementById('btn-traer').addEventListener('click', async () => {

  // Mismo "async" que en el Paso 2: esta función necesita "await" para
  // esperar la respuesta real de Supabase antes de seguir.
  const { data, error } = await db.from('productos_practica').select('*');
  // ↑ El código se DETIENE en esta línea hasta que la base de datos
  //   responde. Compáralo con localStorage.getItem('productos'): esa
  //   llamada te devuelve el valor guardado EN EL MISMO INSTANTE, sin
  //   esperar nada, porque no sale de tu computador. Esta línea sí
  //   puede tardar (viaja a internet y vuelve) — por eso necesita await.

  if (error) {
    // Revisamos "error" ANTES de tocar "data": si la consulta falló,
    // "data" llega como null, y usar null más adelante (ej. null.map())
    // rompería el script. Mismo patrón de "validar antes de operar"
    // que ya usaste en el CRUD de la semana 7.
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // JSON.stringify(data, null, 2) convierte el array completo a texto,
  // con sangría (el "2") para que se lea ordenado. Esta línea SÍ es
  // sincrónica (no necesita await) — ya no estamos esperando nada de
  // Supabase, solo transformando el array "data" que ya llegó.
  document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
});


document.getElementById('btn-traer').addEventListener('click', async () => {

  // async/await, igual que en los Pasos 2 y 3: necesitamos esperar la
  // respuesta real de Supabase antes de poder usar "data".
  const { data, error } = await db.from('productos_practica').select('*');

  if (error) {
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // map() es SINCRÓNICO (igual que con cualquier array normal, como ya
  // usaste en localStorage/semana 8) — por eso NO lleva await. No viaja
  // a ningún lado: solo transforma el array "data" que ya tienes en
  // memoria, después de que el await de arriba terminó de esperar.
  // Esta es la diferencia clave a quedarte con esta sección: "await" es
  // solo para lo que viaja por la red (la consulta a Supabase); una vez
  // que los datos ya están en tu computador, trabajar con ellos
  // (map, filter, etc.) es exactamente igual que con localStorage.
  const nombres = data.map(producto => producto.nombre);
  // nombres es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos

  document.getElementById('resultado').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';
});

// Paso 5 — Tabla con TODAS las columnas de productos_practica
document.getElementById('btn-tabla').addEventListener('click', async () => {
  const contenedor = document.getElementById('tabla-productos');

  const { data, error } = await db.from('productos_practica').select('*');

  if (error) {
    contenedor.textContent = 'Error: ' + error.message;
    return;
  }

  // Cada columna: su nombre en Supabase, el título que se ve y cómo
  // mostrar el valor. Así cada tipo (int8, float8, bool, json) tiene su
  // propio formato sin llenar el código de if/else.
  const columnas = [
    // image guarda una URL (text) → en vez de texto, devolvemos un <img>
    { key: 'image',       titulo: 'Imagen',      formato: v => {
        const img = document.createElement('img');
        img.src = v;
        img.alt = 'Imagen del producto';
        img.className = 'miniatura';
        return img;
      } },
    { key: 'nombre',      titulo: 'Nombre',      formato: v => v },
    // ojo: en Supabase la columna se llama "description" (en inglés)
    { key: 'description', titulo: 'Descripción', formato: v => v },
    { key: 'precio',      titulo: 'Precio',      formato: v => '$' + Number(v).toLocaleString('es-CO'), num: true },
    { key: 'unidades',    titulo: 'Unidades',    formato: v => v, num: true },
    // descuento llega como fracción (0.15) → lo mostramos como 15%
    { key: 'descuento',   titulo: 'Descuento',   formato: v => Math.round(v * 100) + '%', num: true },
    { key: 'disponible',  titulo: 'Disponible',  formato: v => v ? 'Sí' : 'No' },
    // categorias es un array (json) → lo unimos en un solo texto
    { key: 'categorias',  titulo: 'Categorías',  formato: v => Array.isArray(v) ? v.join(', ') : v },
  ];

  const tabla = document.createElement('table');

  // Encabezado: una <th> por columna
  const filaTitulos = tabla.createTHead().insertRow();
  columnas.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.titulo;
    filaTitulos.appendChild(th);
  });

  // Cuerpo: una fila por producto, una celda por columna
  const cuerpo = tabla.createTBody();
  data.forEach(producto => {
    const fila = cuerpo.insertRow();
    columnas.forEach(col => {
      const celda = fila.insertCell();
      const valor = producto[col.key];
      // null = la celda está vacía en Supabase → mostramos "—"
      // textContent (no innerHTML): si un dato trae "<script>", se ve
      // como texto y no se ejecuta.
      const contenido = valor === null || valor === undefined ? '—' : col.formato(valor);
      // Si el formato devolvió un elemento (el <img>), se agrega como
      // nodo; si devolvió texto, va por textContent como antes.
      if (contenido instanceof Node) celda.appendChild(contenido);
      else celda.textContent = contenido;
      if (col.num) celda.className = 'num';
    });
  });

  contenedor.innerHTML = '';
  contenedor.appendChild(tabla);
});
