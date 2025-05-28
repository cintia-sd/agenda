# 📇 Agenda Virtual · Proyecto Fullstack

Gestor de contactos web desarrollado con Node.js, Express y MySQL.

---

## Índice
1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Lógica del backend](#lógica-del-backend)
3. [Lógica del frontend](#lógica-del-frontend)
4. [Base de datos](#base-de-datos)
5. [Decisiones tomadas](#decisiones-tomadas)
6. [Mejoras por implementar](#mejoras-por-implementar)

---

## 1. Estructura del proyecto

📦 agenda
┣ 📂 public
┃ ┣ 📜 index.html
┃ ┣ 📜 style.css
┃ ┗ 📜 script.js
┣ 📂 uploads
┣ 📂 routes
┃ ┗ 📜 contactos.js (migrado a index.js)
┣ 📂 db
┃ ┗ 📜 connection.js (migrado a server.js)
┣ 📂 images
┃ ┣ formulario.png
┃ ┗ listado.png
┣ 📂 docs
┃ ┗ 📜 README.md (este archivo)
┣ 📜 server.js
┣ 📜 package.json
┗ 📜 agenda.sql


---

## 2. Lógica del backend

* `server.js` es el punto de entrada.
* Utiliza Express, Multer, CORS y MySQL para la gestión de contactos.
* Endpoints disponibles:
  - `GET /api/contactos` → Obtener todos
  - `POST /api/contactos` → Crear nuevo contacto (con imagen)
  - `PUT /editar-contacto/:id` → Editar contacto
  - `DELETE /api/contactos/:id` → Eliminar
  - `GET /buscar?termino=` → Filtro dinámico
  - `GET /api/contacto/:id` → Detalles
  - `POST /api/subir-imagen/:id` → Subir imagen
  - `POST /api/eliminar-imagen/:id` → Eliminar imagen
  - `GET /api/contactos/export` → Exportar a Excel

---

## 3. Lógica del frontend

* Interfaz desarrollada con HTML5, CSS3, JavaScript y Tailwind.
* SweetAlert2 para formularios, confirmaciones y mensajes.
* Filtros dinámicos con mínimo 3 caracteres.
* Paginación client-side de contactos.
* Modal con detalles y gestión de imagen del contacto.
* Modo claro/oscuro con persistencia (`localStorage`).

---

## 4. Base de datos

* Base de datos: `agenda`
* Tabla: `contactos`
* Campos: `id`, `nombre`, `apellidos`, `direccion`, `telefono`, `tipo`, `avatar`

---

## 5. Decisiones tomadas

* No se utiliza ORM: conexión directa con SQL (MySQL).
* Se modularizó el backend de forma progresiva.
* SweetAlert2 permite UX más rica sin recargar la página.
* Tailwind se usa para diseño responsive y limpio.
* Se prioriza la funcionalidad sobre la estética (en fase actual).

---

## 6. Mejoras por implementar

### 🧠 Corto plazo
- Confirmación al cerrar modal de edición sin guardar cambios.
- Aviso de contacto duplicado por teléfono.
- Alertas tipo "deshacer" tras eliminar contacto.

### 📈 Medio plazo
- Soporte para múltiples teléfonos por contacto.
- Ordenación por columnas.
- Exportación a CSV además de Excel.
- Paginación completa en servidor.
- Ficha expandida con más detalles.

### 🔐 Largo plazo
- Login de usuario.
- Agendas por usuario.
- Protección de rutas.
- Despliegue en Render/Vercel.
- Tema oscuro automático.

---

## 📌 Notas técnicas

* Multer gestiona las imágenes de los contactos.
* Tailwind CSS permite estilo oscuro y responsivo.
* SweetAlert2 ofrece una UX más profesional y moderna.
* Proyecto en desarrollo activo.

✍️ Última actualización: *28 de mayo de 2025*
