# 🛒 TiendaOnline

Una aplicación de tienda online moderna desarrollada con Angular 20 y Firebase, que permite gestionar productos con un panel administrativo completo.

## 📋 Descripción de la Aplicación

**TiendaOnline** es una plataforma de comercio electrónico que incluye:

### 🏪 **Funcionalidades Principales**

#### **Área Pública**
- **Catálogo de productos**: Visualización de productos con imágenes, nombres, descripciones y precios en pesos argentinos
- **Búsqueda de productos**: Sistema de filtrado por nombre y descripción
- **Detalle de producto**: Vista completa de cada producto individual
- **Diseño responsive**: Adaptado para móviles, tablets y escritorio
- **Navegación intuitiva**: Header con búsqueda y navegación por secciones

#### **Panel Administrativo**
- **Gestión de productos**: Crear, editar, eliminar y visualizar productos
- **Subida de imágenes**: Sistema de upload a Firebase Storage
- **Autenticación de admin**: Sistema de login para acceso administrativo
- **Interfaz administrativa**: Panel dedicado con menú lateral y navegación optimizada

### 🛠 **Tecnologías Utilizadas**

- **Frontend**: Angular 20 con arquitectura standalone components
- **Estilos**: TailwindCSS para diseño moderno y responsive
- **Base de datos**: Firebase Firestore (NoSQL)
- **Almacenamiento**: Firebase Storage para imágenes
- **Estado**: Angular Signals para manejo reactivo del estado
- **Routing**: Angular Router con guards de protección
- **Formularios**: Angular Reactive Forms

### 🏗 **Arquitectura del Proyecto**

```
src/app/
├── admin/                    # Módulo administrativo
│   ├── admin/               # Componente principal del panel admin
│   ├── admin-products/      # Gestión de productos
│   └── product-form/        # Formulario de productos
├── components/              # Componentes reutilizables
│   ├── header/             # Navegación principal
│   ├── footer/             # Pie de página
│   └── product-card/       # Tarjeta de producto
├── pages/                   # Páginas principales
│   ├── home/               # Página de inicio/catálogo
│   ├── product-detail/     # Detalle de producto
│   ├── about/              # Acerca de
│   ├── terms/              # Términos y condiciones
│   ├── privacy/            # Política de privacidad
│   └── returns/            # Política de devoluciones
├── services/               # Servicios de la aplicación
│   ├── products.ts         # Gestión de productos
│   ├── auth.service.ts     # Autenticación
│   └── error-handler.service.ts # Manejo de errores
├── guards/                 # Guards de routing
│   └── admin.guard.ts      # Protección de rutas admin
├── models/                 # Modelos de datos
│   └── product.model.ts    # Interfaz de producto
└── shared/                 # Componentes compartidos
    ├── login-modal/        # Modal de login
    └── confirm-dialog/     # Diálogo de confirmación
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js (versión 18 o superior)
- Angular CLI (`npm install -g @angular/cli`)
- Cuenta de Firebase

### **1. Clonar el repositorio**
```bash
git clone https://github.com/sebasechazu/tienda-online.git
cd tienda-online
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar Firebase**
1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore Database
3. Habilitar Storage
4. Copiar la configuración y actualizar `src/environments/environment.ts`

### **4. Iniciar el servidor de desarrollo**
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`

## 🔧 Scripts Disponibles

```bash
# Desarrollo
ng serve                    # Servidor de desarrollo
ng build                    # Build de producción
ng build --watch           # Build con observación de cambios

# Testing
ng test                     # Ejecutar tests unitarios
ng e2e                      # Tests end-to-end (requiere configuración)

# Linting y formato
ng lint                     # Análisis de código
```

## 🎯 Uso de la Aplicación

### **Acceso Público**
1. Visita la página principal para ver el catálogo
2. Usa la barra de búsqueda para filtrar productos
3. Haz clic en cualquier producto para ver su detalle

### **Acceso Administrativo**
1. Haz clic en "Admin" en el header
2. Usa las credenciales: `admin` / `admin123`
3. Gestiona productos desde el panel administrativo

## 💰 Configuración de Moneda

La aplicación está configurada para mostrar precios en **pesos argentinos (ARS)** con formato localizado (`es-AR`).

---

## 🔒 IMPORTANTE: RECOMENDACIONES DE SEGURIDAD

> ⚠️ **ADVERTENCIA**: Esta aplicación contiene vulnerabilidades de seguridad críticas que deben ser solucionadas antes de desplegarla en producción.

### 🚨 **VULNERABILIDADES CRÍTICAS IDENTIFICADAS**

#### **1. Autenticación Insegura**
```typescript
// ❌ PROBLEMA: Credenciales hardcodeadas
private readonly adminCredentials = {
  username: 'admin',
  password: 'admin123'  // Contraseña débil y visible
};
```

**Riesgos:**
- Credenciales expuestas en el código fuente
- Contraseña extremadamente débil
- Sin hashing ni encriptación
- Fácil acceso no autorizado

#### **2. Reglas de Firestore Abiertas**
```javascript
// ❌ PROBLEMA: Acceso total sin restricciones
allow read, write: if true; // Cualquiera puede hacer todo
```

**Riesgos:**
- Cualquier usuario puede leer toda la base de datos
- Cualquier usuario puede modificar/eliminar productos
- Sin validación de datos de entrada
- Exposición total de información

#### **3. Información Sensible Expuesta**
```typescript
// ❌ PROBLEMA: Configuración de Firebase visible
firebase: {
  apiKey: "AIzaSyAMJ0MOzacmSPrIk8VdGsjQLgm-d6bc8r4", // Público
  // ... otras credenciales expuestas
}
```

#### **4. Ausencia de Headers de Seguridad**
- Sin Content Security Policy (CSP)
- Sin protección contra clickjacking
- Sin validación de tipos MIME
- Sin protección HTTPS obligatoria

### 🛡️ **SOLUCIONES RECOMENDADAS**

#### **🔥 CRÍTICO - Implementar Inmediatamente**

1. **Autenticación Real con Firebase Auth**
   ```bash
   # Habilitar Firebase Authentication
   # Configurar proveedores de autenticación
   # Implementar roles y permisos
   ```

2. **Reglas de Firestore Seguras**
   ```javascript
   // ✅ SOLUCIÓN: Reglas restrictivas
   match /products/{productId} {
     allow read: if true; // Solo lectura pública
     allow write: if request.auth != null && request.auth.token.admin == true;
   }
   ```

3. **Contraseñas Seguras**
   ```typescript
   // ✅ SOLUCIÓN: Usar variables de entorno
   const adminPassword = process.env['ADMIN_PASSWORD']; // Fuerte y secreta
   ```

#### **⚠️ ALTO RIESGO - Implementar Pronto**

4. **Headers de Seguridad**
   ```html
   <!-- Content Security Policy -->
   <meta http-equiv="Content-Security-Policy" content="default-src 'self';">
   ```

5. **Validación de Entrada**
   ```typescript
   // Validar todos los inputs
   // Sanitizar datos antes de guardar
   // Límites en tamaños de archivo
   ```

6. **Rate Limiting**
   ```typescript
   // Límites de intentos de login
   // Protección contra ataques de fuerza bruta
   // Cooldown entre intentos
   ```

### 📋 **PLAN DE ACCIÓN INMEDIATO**

#### **Fase 1: Crítico (Implementar YA)**
- [ ] Cambiar credenciales de administrador
- [ ] Configurar Firebase Authentication
- [ ] Actualizar reglas de Firestore
- [ ] Mover configuraciones sensibles a variables de entorno

#### **Fase 2: Alto Riesgo (Esta semana)**
- [ ] Implementar headers de seguridad
- [ ] Agregar validación de entrada
- [ ] Configurar rate limiting
- [ ] Eliminar logs sensibles

#### **Fase 3: Mejoras (Próximo mes)**
- [ ] Implementar auditoría de acciones
- [ ] Configurar monitoreo de seguridad
- [ ] Agregar tests de seguridad
- [ ] Documentar políticas de seguridad

### 🔍 **HERRAMIENTAS RECOMENDADAS**

- **Análisis de seguridad**: `npm audit`, Snyk
- **Validación**: Joi, class-validator
- **Autenticación**: Firebase Auth, Auth0
- **Monitoreo**: Sentry, LogRocket
- **Headers de seguridad**: Helmet.js (para Express)

### 📞 **Contacto de Seguridad**

Si encuentras vulnerabilidades adicionales, por favor:
1. No las publiques públicamente
2. Contacta al equipo de desarrollo
3. Proporciona detalles técnicos
4. Espera confirmación antes de divulgar

---

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🎯 Roadmap

- [ ] Implementar carrito de compras
- [ ] Sistema de pagos
- [ ] Gestión de usuarios
- [ ] Notificaciones
- [ ] API REST
- [ ] **Solucionar vulnerabilidades de seguridad** 🚨
