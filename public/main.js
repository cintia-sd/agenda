document.getElementById('nuevoContactoBtn').addEventListener('click', () => {
  Swal.fire({
    title: 'Añadir nuevo contacto',
    html: `
      <input type="text" id="nombre" class="swal2-input" placeholder="Nombre">
      <input type="text" id="apellidos" class="swal2-input" placeholder="Apellidos">
      <input type="text" id="direccion" class="swal2-input" placeholder="Dirección">
      <input type="text" id="telefono" class="swal2-input" placeholder="Teléfono">
      <select id="tipo" class="swal2-input">
        <option value="1">Personal</option>
        <option value="2">Empresa</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    preConfirm: () => {
      const nombre = document.getElementById('nombre').value;
      const apellidos = document.getElementById('apellidos').value;
      const direccion = document.getElementById('direccion').value;
      const telefono = document.getElementById('telefono').value;
      const tipo = document.getElementById('tipo').value;

      return fetch('/api/contactos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellidos, direccion, telefono, tipo })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al guardar el contacto');
          }
          return response.json();
        })
        .then(data => {
          Swal.fire('Éxito', data.mensaje, 'success');
        })
        .catch(err => {
          Swal.showValidationMessage(`❌ ${err.message}`);
        });
    }
  });
});
