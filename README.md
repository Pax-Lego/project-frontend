# Pax-Saporis - Frontend

Frontend para la aplicación de tracking de calorías de Pax-Saporis construido con React, Vite, Tailwind CSS y Zustand.

## Descripción

El frontend proporciona una interfaz moderna y responsiva para gestionar:
- **Autenticación**: Login y registro de usuarios
- **Ingredientes**: Visualización y gestión de ingredientes personalizados
- **Recetas**: Creación, edición y consulta de recetas con información nutricional
- **Planes**: Organización de comidas por día y seguimiento de macros
- **Perfil**: Configuración de metas, peso, actividad y restricciones dietarias

## Estructura del Proyecto

```
.
├── public/              # Archivos estáticos públicos
├── src/
│   ├── api/             # Cliente Axios y servicios para la API
│   ├── components/      # Componentes reutilizables (Layout, Sidebar)
│   ├── context/         # Contextos de autenticación y tema
│   ├── hooks/           # Hooks personalizados (por ejemplo, favoritos)
│   ├── pages/           # Vistas principales del sistema
│   │   ├── auth/        # Login y registro
│   │   ├── dashboard/   # Resumen y métricas
│   │   ├── ingredients/ # Gestión de ingredientes
│   │   ├── plans/       # Planes alimenticios
│   │   ├── profile/     # Perfil y metas
│   │   └── recipes/     # Gestión de recetas
│   ├── App.jsx          # Definición de rutas principales
│   ├── main.jsx         # Punto de entrada de React
│   └── index.css        # Estilos base y Tailwind
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Quick Start

La aplicación consume la API del backend desde el cliente ubicado en `src/api/client.js`. Por defecto apunta a:

`http://localhost:8000/api`

Si prefieres externalizar esta URL, puedes implementar una variable de entorno con el prefijo `VITE_` y ajustarla en el cliente.

1. **Entrar al directorio del frontend**:
```bash
cd project-frontend
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Asegurar que el backend esté corriendo**:
```bash
# En otra terminal, desde project-backend/pax-saporis si NO se está corriendo Docker
python manage.py runserver
```

4. **Ejecutar la aplicación en modo desarrollo**:
```bash
npm run dev
```

5. **Acceso**:
- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:8000/api/`


## Aplicación

La interfaz principal está organizada por secciones:
- **Dashboard**: resumen del día, macros, planes recientes y progreso
- **Ingredients**: listado y administración de ingredientes
- **Recipes**: recetas con nutrición calculada y agregado de ingredientes
- **Plans**: creación de planes diarios y asignación de comidas
- **Profile**: datos personales, objetivos y seguimiento de peso

## Endpoints de la API que consume

El frontend se comunica con la API REST del backend a través de los módulos de `src/api/`:

### Autenticación
- `POST /api/auth/register/` - Registrar usuario
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/logout/` - Cerrar sesión
- `GET /api/auth/me/` - Obtener usuario actual

### Ingredientes
- `GET /api/ingredients/` - Listar ingredientes
- `POST /api/ingredients/` - Crear ingrediente
- `PUT /api/ingredients/{id}/` - Actualizar ingrediente
- `DELETE /api/ingredients/{id}/` - Eliminar ingrediente

### Recetas
- `GET /api/recipes/` - Listar recetas
- `POST /api/recipes/` - Crear receta
- `PUT /api/recipes/{id}/` - Actualizar receta
- `DELETE /api/recipes/{id}/` - Eliminar receta

### Planes y perfil
- `GET /api/plans/` - Listar planes
- `POST /api/plans/` - Crear plan
- `GET /api/profile/` - Ver perfil del usuario
- `POST /api/profile/weight/` - Registrar peso

## Funcionalidades Principales

- Autenticación con sesión y protección de rutas
- Gestión de ingredientes y recetas
- Creación de planes alimenticios con tipos de comida
- Seguimiento de calorías y macros recomendados
- Perfil personalizado con restricciones dietarias y objetivos
- Diseño responsive y experiencia visual moderna

## Gestión de Estado

El frontend usa una combinación de tecnologías simples y claras:
- **React Router** para la navegación entre páginas
- **Context API** para autenticación y tema
- **Zustand** para estados reutilizables como favoritos
- **Axios** para las peticiones HTTP al backend

## Próximas Fases

- [ ] Mejoras en manejo de errores y estados vacíos
- [ ] Pruebas automatizadas de interfaz
- [ ] Configuración centralizada de variables de entorno para la API
- [ ] Mejoras en visualización de métricas y reportes
