# Documentación Técnica · Agenda Virtual

## Índice

- [1. Estructura del proyecto](#estructura-del-proyecto)
- [2. Lógica del backend](#lógica-del-backend)
- [3. Lógica del frontend](#lógica-del-frontend)
- [4. Base de datos](#base-de-datos)
- [5. Decisiones tomadas](#decisiones-tomadas)
- [6. Mejoras por implementar](#mejoras-por-implementar)

---

## 1. Estructura del proyecto

📦 agenda 

┣ 📂 public ┃ ┗ 📜 index.html 

┣ 📂 routes ┃ ┗ 📜 contactos.js 

┣ 📂 db ┃ ┗ 📜 connection.js 

┣ 📂 images ┃ ┗ 📜 [capturas] 

┣ 📂 docs ┃ ┗ 📜 README.md (este archivo) 

┣ 📜 index.js ┣ 📜 package.json ┗ 📜 agenda.sql


---

## 2. Lógica del backend

- El archivo `index.js` es el punto de entrada.
- Se importa Express, conexión MySQL y rutas.
- Se utilizan rutas en `/routes/contactos.js` para manejar el CRUD.

## 3. Lógica del frontend

- HTML puro para la interfaz.
- SweetAlert2 para confirmaciones visuales.
- Script JS maneja llamadas `fetch` al backend.

## 4. Base de datos

- Tabla principal: `contactos`
- Campos: id, nombre, apellidos, teléfono, dirección, tipo

## 5. Decisiones tomadas

- Se optó por no usar ORM (Sequelize) para practicar SQL directo.
- Se modularizó el código en rutas separadas.
- Se mantuvo el estilo sencillo en la UI para centrarse en lógica funcional.

## 6. Mejoras por implementar


---

## 🧠 Cosas a mejorar (corto plazo)

- [ ] Al hacer clic en los iconos de **editar** o **eliminar**, añadir hover o feedback visual.
- [ ] Si se detectan cambios en el popup de modificación y se cierra sin guardar:  
      Mostrar confirmación `"¿Seguro que quieres salir sin guardar?"` con botones:
      - **Sí, salir**
      - **No, volver**
- [ ] Al eliminar un contacto: permitir revertir la acción (alerta tipo “Deshacer”).

---

## 📈 Mejoras avanzadas (medio plazo)

- [ ] Detectar número duplicado al añadir/editar:  
      Mostrar alerta `"Este número ya existe"` con opciones:
      - **Añadir de todas formas**
      - **Descartar cambios**

- [ ] Propuesta de “merge” si se detectan contactos duplicados.  
      Mostrar sugerencia con posibles coincidencias.

- [ ] Posibilidad de asignar **varios números** a un mismo contacto.

- [ ] Agrupar contactos por lotes visuales (10, 15 por página) con paginación:
      - Mostrar: `"10 de 134"`
      - Navegación con flechas `<< >>` para cambiar de página.

---

## 🔐 Posibles evoluciones a futuro (largo plazo)

- [ ] Implementar **login de usuario** con HTML/PHP + base de datos.
- [ ] Asignar espacios o agendas individuales por usuario registrado.
- [ ] Autenticación básica y protección de rutas privadas.
- [ ] Versión oscura (tema oscuro).

---

## 📌 Notas técnicas

- Actualmente no se utiliza ningún ORM.
- SweetAlert2 facilita el feedback visual al usuario.
- Se prioriza la lógica funcional antes que la estética (por ahora).
- En próximas fases se evaluará el despliegue con Render o Vercel.

---

## ✍️ Última actualización: _2 de mayo de 2025_

---

