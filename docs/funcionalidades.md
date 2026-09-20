# Funcionalidades

Comportamiento vigente del producto en lenguaje de negocio. Describe **qué hace el sistema**, no cómo lo implementa.

## 🛍️ Tienda pública

### Catálogo
- El visitante ve productos destacados al ingresar y un catálogo completo en `/catalogo`.
- Puede buscar por texto y filtrar por categoría.
- Cada producto tiene una página de detalle accesible por slug en `/product/:slug`, con navegación entre productos relacionados.

### Páginas estáticas
- `/about`: información de la tienda.
- `/terms`: términos y condiciones.
- `/privacy`: política de privacidad.
- `/returns`: política de devoluciones.

### Localización
- Moneda: ARS (pesos argentinos), formato localizado `es-AR`.
- Textos de la UI en español rioplatense.

## 🛠️ Panel de administración

Acceso desde el header mediante login. Protegido por un guard que verifica sesión activa.

### Productos
- Listar todos los productos con filtros.
- Crear, editar y eliminar productos, con confirmación explícita antes de borrar.
- Subir imágenes a Firebase Storage.

### Categorías
- Gestión de rubros, categorías y subcategorías (3 niveles).

### Contenido dinámico
- Página de contacto y página legal editables desde el admin (texto cargado dinámicamente).

## 🔐 Autenticación

- Modal de login con usuario y contraseña.
- Sesión persiste en el navegador del cliente.
- Al cerrar sesión se limpia la sesión y se vuelve al flujo público.