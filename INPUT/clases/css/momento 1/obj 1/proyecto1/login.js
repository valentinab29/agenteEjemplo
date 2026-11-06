// Verificación de los datos de login. Usa "usuario" y "password" de
// credenciales.js, por eso gestion.html debe cargar credenciales.js ANTES que
// este archivo.
//
// Solo responde true/false: no muestra el CRUD ni cambia ninguna sesión. Eso
// lo decide gestion.js, así que llamar esta función desde la consola no
// desbloquea nada.

// Devuelve true si lo escrito coincide con las credenciales de administración.
// Los parámetros NO se llaman "usuario"/"password" a propósito: si se
// llamaran igual, taparían (shadowing) las variables de credenciales.js y la
// función terminaría comparando cada valor consigo mismo.
function validarLogin(usuarioEscrito, passwordEscrito) {
  return usuarioEscrito === usuario && passwordEscrito === password;
}
