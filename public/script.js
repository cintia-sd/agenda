// Variables globales
let contactosTotales = [];
let paginaActual = 1;
const contactosPorPagina = 10;
let originalData = {};
let imagenSeleccionada = null;

// Funciones principales
function cargarContactos(filtro = '', pagina = 1) {
    fetch('/api/contactos')
        .then(response => response.json())
        .then(contactos => {
            contactosTotales = filtrarContactos(contactos, filtro);
            contactosTotales.sort(ordenarPorApellido);
            mostrarPagina(pagina);
            crearPaginacion(contactosTotales.length);
        });
}

function mostrarPagina(pagina) {
    const tabla = document.querySelector('#contactos tbody');
    tabla.innerHTML = '';

    const inicio = (pagina - 1) * contactosPorPagina;
    const fin = inicio + contactosPorPagina;
    const contactosPagina = contactosTotales.slice(inicio, fin);

    contactosPagina.forEach(contacto => {
        const fila = crearFilaContacto(contacto);
        tabla.appendChild(fila);
    });

    paginaActual = pagina;
}

function crearPaginacion(totalContactos) {
    const paginacionDiv = document.getElementById('paginacion');
    paginacionDiv.innerHTML = '';
    const totalPaginas = Math.ceil(totalContactos / contactosPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = crearBotonPaginacion(i);
        paginacionDiv.appendChild(btn);
    }
}

// Funciones auxiliares
function filtrarContactos(contactos, filtro) {
    const filtroNormalizado = filtro.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return contactos.filter(c =>
        // Normalizamos los campos de contacto y los comparamos con el filtro
        c.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(filtroNormalizado.toLowerCase()) ||
        c.apellidos.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(filtroNormalizado.toLowerCase()) ||
        c.telefono.toLowerCase().includes(filtroNormalizado.toLowerCase())
    );
    }
function ordenarPorApellido(a, b) {
    return a.apellidos.toLowerCase().localeCompare(b.apellidos.toLowerCase());
}

function crearFilaContacto(contacto) {
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

    fila.addEventListener('click', event => {
        if (!event.target.closest('.btn-eliminar') && !event.target.closest('.btn-editar')) {
            openContactDetails(contacto.id);
        }
    });

    return fila;
}

function crearBotonPaginacion(pagina) {
    const btn = document.createElement('button');
    btn.textContent = pagina;
    btn.classList.add('btn-pagina');
    if (pagina === paginaActual) btn.classList.add('activa');

    btn.addEventListener('click', () => {
        mostrarPagina(pagina);
        crearPaginacion(contactosTotales.length);
    });

    return btn;
}

function obtenerRutaImagen(nombreArchivo) {
    if (!nombreArchivo || nombreArchivo === 'null') return '/uploads/default-avatar.png';
    return nombreArchivo.startsWith('/') ? nombreArchivo : `/uploads/${nombreArchivo}`;
}

// Manejo de eventos
document.addEventListener('DOMContentLoaded', () => cargarContactos());

document.addEventListener('click', async event => {
    const eliminarBtn = event.target.closest('.btn-eliminar');
    const editarBtn = event.target.closest('.btn-editar');

    if (eliminarBtn) await eliminarContacto(eliminarBtn);
    if (editarBtn) await editarContacto(editarBtn);
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const modal = document.getElementById('contactDetailsModal');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    }
  });
  
document.getElementById('filtroInput').addEventListener('input', e => {
    cargarContactos(e.target.value);
});

document.getElementById('nuevoContactoBtn').addEventListener('click', () => {
    añadirNuevoContacto();
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('contactDetailsModal').classList.add('hidden');
});

document.getElementById('editImageBtn').addEventListener('click', () => {
    document.getElementById('uploadAvatar').click();
});

document.getElementById('uploadAvatar').addEventListener('change', async function () {
    await subirNuevaImagen(this.files[0]);
});

document.getElementById('deleteImageBtn').addEventListener('click', async () => {
    await eliminarImagen();
});
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modal = document.getElementById('contactDetailsModal');
    if (modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    }
  }
});
// Funciones de acciones
async function eliminarContacto(eliminarBtn) {
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

async function editarContacto(editarBtn) {
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

function añadirNuevoContacto() {
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
                cargarContactos();
                return data;
            })
            .catch(err => {
                Swal.showValidationMessage(`❌ ${err.message}`);
            });
        }
    });
}

function openContactDetails(contactId) {
    fetch(`/api/contacto/${contactId}`)
        .then(res => res.json())
        .then(data => {
            originalData = JSON.parse(JSON.stringify(data));

            document.getElementById('contactName').textContent = `${data.nombre} ${data.apellidos}`;
            document.getElementById('contactAddress').textContent = data.direccion;
            document.getElementById('contactPhone').textContent = data.telefono;
            document.getElementById('contactType').textContent = data.tipo == 1 ? 'Personal' : 'Empresa';
            document.getElementById('avatar-img').src = obtenerRutaImagen(data.avatar);

            imagenSeleccionada = data.avatar;

            document.getElementById('contactDetailsModal').classList.remove('hidden');
        });
}

async function subirNuevaImagen(file) {
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
}

async function eliminarImagen() {
    try {
        const response = await fetch(`/api/eliminar-imagen/${originalData.id}`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Error al eliminar imagen');

        document.getElementById('avatar-img').src = '/uploads/default-avatar.png?t=' + Date.now();

        Swal.fire('Imagen eliminada', '', 'success');
    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
}
