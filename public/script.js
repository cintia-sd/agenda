// Carga los contactos desde la API y los muestra en la tabla, aplicando un filtro si se proporciona
function cargarContactos(filtro = '') {
    fetch('/api/contactos')
        .then(response => response.json())
        .then(contactos => {
            const tabla = document.querySelector('#contactos tbody');
            tabla.innerHTML = '';

            contactos
                .filter(c =>
                    c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                    c.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
                    c.telefono.toLowerCase().includes(filtro.toLowerCase())
                )
                .forEach(contacto => {
                    const fila = document.createElement('tr');
                    fila.classList.add('contact-row');
                    fila.dataset.id = contacto.id;
                    fila.dataset.direccion = contacto.direccion || '';
                    fila.dataset.imagen = contacto.imagen || '';

                    fila.innerHTML = `
                        <td>${contacto.nombre}</td>
                        <td>${contacto.apellidos}</td>
                        <td>${contacto.telefono}</td>
                        <td>${contacto.tipo == 1 ? 'Personal' : 'Empresa'}</td>
                        <td class="acciones">
                            <button class="btn-eliminar" title="Eliminar contacto">❌</button>
                            <button class="btn-editar" title="Editar contacto">✏️</button>
                        </td>
                    `;

                    tabla.appendChild(fila);

                    // Clic para abrir detalles
                    fila.addEventListener('click', (event) => {
                        if (
                            event.target.closest('.btn-eliminar') ||
                            event.target.closest('.btn-editar')
                        ) {
                            return;
                        }
                    
                        openContactDetails(contacto.id);
                    });
                });
        });
}

// Cargar contactos al cargar la página
window.addEventListener('DOMContentLoaded', () => cargarContactos());

// Manejo de clics global para botones de editar y eliminar
document.addEventListener('click', async event => {
    const eliminarBtn = event.target.closest('.btn-eliminar');
    const editarBtn = event.target.closest('.btn-editar');

    // Eliminar contacto
    if (eliminarBtn) {
        const row = eliminarBtn.closest('.contact-row');
        const contactId = row.dataset.id;

        const result = await Swal.fire({
            title: '¿Seguro que desea eliminar este contacto?',
            text: 'La acción se ejecutará de manera permanente',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (result.isConfirmed) {
            await fetch(`/api/contactos/${contactId}`, { method: 'DELETE' });
            row.remove();
            Swal.fire('¡Eliminado!', 'El contacto ha sido eliminado.', 'success');
        }
    }

    // Editar contacto
    if (editarBtn) {
        const row = editarBtn.closest('.contact-row');
        const contactId = row.dataset.id;
        const nombre = row.children[0].textContent;
        const apellidos = row.children[1].textContent;
        const telefono = row.children[2].textContent;
        const direccion = row.dataset.direccion || '';
        const tipo = row.children[3].textContent;

        const { value: formValues } = await Swal.fire({
            title: 'Editar contacto',
            html: `
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${nombre}">
                <input id="swal-apellidos" class="swal2-input" placeholder="Apellidos" value="${apellidos}">
                <input id="swal-telefono" class="swal2-input" placeholder="Teléfono" value="${telefono}">
                <input id="swal-direccion" class="swal2-input" placeholder="Dirección" value="${direccion}">
                <select id="swal-tipo" class="swal2-input">
                    <option value="1" ${tipo === 'Personal' ? 'selected' : ''}>Personal</option>
                    <option value="2" ${tipo === 'Empresa' ? 'selected' : ''}>Empresa</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => ({
                nombre: document.getElementById('swal-nombre').value,
                apellidos: document.getElementById('swal-apellidos').value,
                telefono: document.getElementById('swal-telefono').value,
                direccion: document.getElementById('swal-direccion').value,
                tipo: document.getElementById('swal-tipo').value
            })
        });

        if (formValues) {
            const confirmEdit = await Swal.fire({
                title: '¿Desea realizar los cambios?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            });

            if (confirmEdit.isConfirmed) {
                await fetch(`/editar-contacto/${contactId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValues)
                });

                Swal.fire('¡Cambios guardados!', '', 'success');
                cargarContactos();
            }
        }
    }
});

// Filtrar contactos a medida que se escribe
document.getElementById('filtroInput').addEventListener('input', e => {
    cargarContactos(e.target.value);
});

// Añadir nuevo contacto
document.getElementById('nuevoContactoBtn').addEventListener('click', () => {
    Swal.fire({
        title: 'Añadir nuevo contacto',
        html: `
            <input type="text" id="nombre" class="swal2-input" placeholder="Nombre">
            <input type="text" id="apellidos" class="swal2-input" placeholder="Apellidos">
            <input type="text" id="direccion" class="swal2-input" placeholder="Dirección">
            <input type="text" id="telefono" class="swal2-input" placeholder="Teléfono">
            <input type="file" id="imagen" class="swal2-file" accept="image/*">
            <img id="previewImagen" src="" alt="Vista previa" style="margin-top:10px; max-width:100%; max-height:150px; display:none;">
            <select id="tipo" class="swal2-input">
                <option value="1">Personal</option>
                <option value="2">Empresa</option>
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        didOpen: () => {
            const inputImagen = document.getElementById('imagen');
            const preview = document.getElementById('previewImagen');

            inputImagen.addEventListener('change', () => {
                const file = inputImagen.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    preview.src = '';
                    preview.style.display = 'none';
                }
            });
        },
        preConfirm: () => {
            const nombre = document.getElementById('nombre').value.trim();
            const apellidos = document.getElementById('apellidos').value.trim();
            const direccion = document.getElementById('direccion').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const tipo = document.getElementById('tipo').value;
            const imagen = document.getElementById('imagen').files[0];

            if (!nombre || !apellidos || !telefono) {
                Swal.showValidationMessage('⚠️ Nombre, Apellidos y Teléfono son obligatorios.');
                return false;
            }

            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('apellidos', apellidos);
            formData.append('direccion', direccion);
            formData.append('telefono', telefono);
            formData.append('tipo', tipo);
            if (imagen) formData.append('avatar', imagen);

            return fetch('/api/contactos', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al guardar el contacto');
                }
                return response.json();
            })
            .then(data => {
                Swal.fire('Éxito', data.mensaje || 'Contacto guardado correctamente.', 'success');
                console.log('Contacto guardado:', data);
                cargarContactos();
                return data;
            })
            .catch(err => {
                Swal.showValidationMessage(`❌ ${err.message}`);
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('Datos enviados correctamente:', result.value);
        }
        }).catch(error => {
            Swal.fire('Error', `Algo salió mal: ${error.message}`, 'error');
        });
    
    });


// Devuelve la ruta de la imagen del contacto o una por defecto si no hay imagen
function obtenerRutaImagen(nombreArchivo) {
    if (!nombreArchivo || nombreArchivo === 'null') {
      return '/uploads/default-avatar.png';
    }
  
    // Si empieza por "/", ya es ruta absoluta
    if (nombreArchivo.startsWith('/')) {
      return nombreArchivo;
    }
  
    // Si no, lo armamos
    return `/uploads/${nombreArchivo}`;
  }
  

let originalData = {};
let imagenSeleccionada = null;

// Abrir modal con detalles del contacto
function openContactDetails(contactId) {
    fetch(`/api/contacto/${contactId}`)
        .then(res => res.json())
        .then(data => {
            originalData = JSON.parse(JSON.stringify(data));

            // Rellenar datos en el modal
            document.getElementById('contactName').textContent = `${data.nombre} ${data.apellidos}`;
            document.getElementById('contactAddress').textContent = data.direccion;
            document.getElementById('contactPhone').textContent = data.telefono;
            document.getElementById('contactType').textContent = data.tipo == 1 ? 'Personal' : 'Empresa';
            document.getElementById('avatar-img').src = obtenerRutaImagen(data.avatar);

            imagenSeleccionada = data.avatar;

            document.getElementById('contactDetailsModal').classList.remove('hidden');
        });
}

// Cerrar modal de detalles
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('contactDetailsModal').classList.add('hidden');
});

// Botón "Cambiar" imagen
document.getElementById('editImageBtn').addEventListener('click', () => {
    document.getElementById('uploadAvatar').click();
});

// Subir nueva imagen
document.getElementById('uploadAvatar').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch(`/api/subir-imagen/${originalData.id}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Error al subir la imagen');

        const result = await response.json();
        document.getElementById('avatar-img').src = result.rutaImagen + `?t=${Date.now()}`;
        imagenSeleccionada = result.rutaImagen;

        Swal.fire('Imagen actualizada', '', 'success');
    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
});

// Eliminar imagen → volver al avatar por defecto
document.getElementById('deleteImageBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/eliminar-imagen/${originalData.id}`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Error al eliminar imagen');

        // Actualiza el src de la imagen con cache busting
        document.getElementById('avatar-img').src = '/uploads/default-avatar.png?t=' + Date.now();

        Swal.fire('Imagen eliminada', '', 'success');
    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
});

