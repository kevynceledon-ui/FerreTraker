# FerreTraker - Sistema de Monitoreo de Precios de Materiales de Construcción

## 📋 Visión General

FerreTraker es un proyecto personal de aprendizaje diseñado para monitorear y comparar precios de materiales de construcción en tiendas como Sodimac, Easy e Imperial. El sistema automatiza la extracción de datos mediante web scraping, los almacena en una base de datos y proporciona una interfaz para visualizar tendencias de precios.

Este proyecto fue desarrollado como un ejercicio de aprendizaje continuo, partiendo de cero sin experiencia previa en las tecnologías utilizadas, enfocándose en la resolución práctica de problemas y la mejora constante de habilidades técnicas.

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con **Vite** - Framework para interfaz de usuario reactiva
- **JavaScript ES6+** - Lenguaje de programación
- **CSS3** - Estilos y diseño responsive

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** (implícito en server.js) - Framework para API REST
- **Sequelize** - ORM para interacción con base de datos PostgreSQL
- **Playwright** - Biblioteca para web scraping automatizado
- **Dotenv** - Gestión de variables de entorno

### Infraestructura y DevOps
- **GitHub Actions** - Automatización de CI/CD para ejecución diaria del scraper
- **Supabase** - Base de datos PostgreSQL alojada (plan gratuito)
- **Playwright Browsers** - Chromium para scraping en modo headless

### Herramientas de Desarrollo
- **ESLint** - Linting para mantener calidad de código
- **Git** - Control de versiones
- **npm** - Gestor de paquetes

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   Frontend      │    │   Backend API    │    │   Base de Datos    │
│ (React/Vite)    │◄──►│ (Node/Express)   │◄──►│ (Supabase/Postgres)│
└─────────────────┘    └──────────────────┘    └────────────────────┘
                                   ▲
                                   │
                           ┌───────▼───────┐
                           │  Web Scraper  │
                           │ (Playwright)  │
                           └───────▼───────┘
                                   │
                           ┌───────▼───────┐
                           │  Tiendas Web  │
                           │ (Sodimac,     │
                           │  Easy, Imperial)│
                           └───────────────┘
```

### Flujo de Trabajo
1. **Extracción de Datos**: Cada día a las 4:00 AM, GitHub Actions ejecuta un scraper que:
   - Navega a Sodimac, Easy e Imperial usando Playwright
   - Busca productos en categorías específicas (madera dimensionada, melamina, taladro)
   - Extrae nombre, precio, imagen y enlace de cada producto
   - Aplica filtros para eliminar productos no relevantes y ruido
   - Ordena por precio y selecciona los 15 mejores opciones por categoría

2. **Almacenamiento**: Los datos extraídos se guardan/actualizan en Supabase mediante:
   - Upsert (insertar si no existe, actualizar si existe) de tiendas
   - Upsert de productos (identificados por título + tienda_id)
   - Creación de registros en historial de precios con timestamp

3. **Presentación**: El frontend consume la API del backend para mostrar:
   - Lista de productos con sus precios actuales
   - Comparativa entre tiendas
   - Tendencias históricas de precios

## 🔑 Características Implementadas

### Scraping Inteligente
- Extracción paralela de múltiples tiendas usando `Promise.all()`
- Navegación inteligente con espera de carga de contenido
- Scroll automático para cargar todos los productos
- Filtrado avanzado para eliminar ruido (promociones, productos no relacionados)
- Ordenación por precio para mostrar las mejores opciones

### Manejo Robusto de Datos
- Normalización de precios (eliminación de símbolos, conversión a números)
- Validación de datos antes de almacenar
- Evitación de duplicados mediante upsert inteligente
- Registro histórico completo de precios

### Automatización y Fiabilidad
- Programa diario vía GitHub Actions (cron: '0 4 * * *')
- Recuperación automática de errores de conexión
- Logging detallado para depuración
- Modo headless para ejecución en entornos sin GUI

### Experiencia de Usuario
- Interfaz limpia y responsive
- Visualización clara de precios y tiendas
- Diseño enfocado en legibilidad y usabilidad

## 💡 Desafíos Superados y Lecciones Aprendidas

### 1. **Problema: Supabase Free Tier "Cold Start"**
- **Desafío**: La base de datos gratuita de Supabase se "duerme" tras 7 días de inactividad, causando retrasos de 3+ minutos al reactivarse
- **Solución**: Implementación de un "heartbeat" mediante scrapers programados que mantienen actividad constante en la BD
- **Aprendizaje**: Importancia de entender los límites de los servicios gratuitos y diseñar soluciones proactivas

### 2. **Problema: Ejecutar Playwright en Entornos Headless**
- **Desafío**: Error "Missing X server or $DISPLAY" al intentar lanzar navegadores en GitHub Actions
- **Solución**: Configuración de Playwright en modo headless (`{headless: true}`)
- **Aprendizaje**: Diferencias entre entornos de desarrollo local y de producción/CI, y cómo adaptar las aplicaciones accordingly

### 3. **Problema: Gestión de Variables de Entorno en CI/CD**
- **Desafío**: Variables de entorno no accesibles en workflows de GitHub Actions
- **Solución**: Configuración adecuada de secrets en el repositorio y referenciación correcta en workflows (`${{ secrets.NOMBRE_VARIABLE }}`)
- **Aprendizaje**: Buenas prácticas para manejar información sensible en pipelines de automatización

### 4. **Problema: Manejo de Contenido Dinámico en Web Scraping**
- **Desafío**: Sitios web que cargan contenido asincronicamente mediante JavaScript
- **Solución**: Uso de `waitForTimeout()` y técnicas de scroll para forzar la carga completa
- **Aprendizaje**: Limitaciones del scraping tradicional y necesidad de herramientas que interpreten JavaScript como Playwright

### 5. **Problema: Estructuración de Datos para Consulta Eficiente**
- **Desafío**: Diseñar un esquema de base de datos que permita consultas rápidas de históricos y comparativas
- **Solución**: Modelo relacional con tiendas → productos → historial de precios
- **Aprendizaje**: Principios de modelado de datos y normalización para aplicaciones analíticas

## 🚀 Cómo Ejecutar Localmente

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Cuenta en Supabase (para obtener credenciales de conexión)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/FerreTraker.git
cd FerreTraker
```

2. **Instalar dependencias del backend**
```bash
cd construfacil-backend
npm install
```

3. **Configurar variables de entorno**
Crear un archivo `.env` en `construfacil-backend/` con:
```
DIRECT_URL=postgresql://postgres:[tu-contraseña]@db.[tu-proyecto].supabase.co:5432/postgres
```

4. **Instalar dependencias del frontend**
```bash
cd ../construfacil-frontend
npm install
```

5. **Iniciar los servicios**
- Backend: `npm run dev` (en construfacil-backend)
- Frontend: `npm run dev` (en construfacil-frontend)

6. **Ejecutar el scraper manualmente** (opcional)
```bash
# Desde construfacil-backend
node src/jobs/dataMiner.js
```

## 📈 Estado Actual y Próximos Pasos

### Funcionalidades Actuales
✅ Scraping diario automatizado de 3 tiendas principales
✅ Almacenamiento histórico de precios en Supabase
✅ API REST para consulta de datos
✅ Interfaz básica de visualización en React/Vite
✅ Manejo de errores y logging detallado
✅ Integración completa con GitHub Actions

### Mejoras Planeadas (Aprendizaje Futuro)
🔹 Implementación de gráficos de tendencias de precios usando Chart.js o D3.js
🔹 Sistema de notificaciones por email cuando se detecten caídas de precio significativas
🔹 Optimización de selectores de scraping para mayor resiliencia ante cambios en los sitios web
🔹 Implementación de caching en el API para mejorar rendimiento
🔹 Pruebas unitarias y de integración con Jest
🔹 Dockerización para despliegue más sencillo
🔹 Autenticación de usuarios y personalización de seguimiento

## 🎓 Reflexiones sobre el Proceso de Aprendizaje

Este proyecto representa un viaje significativo de aprendizaje autodirigido donde cada desafío técnico se convirtió en una oportunidad para adquirir nuevos conocimientos:

### Áreas de Crecimiento Técnico
- **Desarrollo Full Stack**: Integración coherente entre frontend y backend
- **Bases de Datos**: Diseño de esquemas, consultas eficientes y manejo de relaciones
- **Testing y Calidad**: Implementación de prácticas de código limpio y mantenible
- **DevOps**: Configuración de pipelines de CI/CD y comprensión de entornos de producción
- **Web Scraping Ético**: Técnicas respetuosas de extracción de datos con delays apropiados
- **Resolución de Problemas**: Metodología sistemática para diagnosticar y solucionar problemas técnicos

### Filosofía de Desarrollo Adoptada
1. **Aprender haciendo**: Cada característica se implementó investigando primero, luego aplicando
2. **Iteración constante**: Mejoras continuas basadas en pruebas y retroalimentación
3. **Documentación como aprendizaje**: El acto de explicar el código refuerza la comprensión
4. **Manejo constructivo de errores**: Los fallos se vieron como datos valiosos para mejorar
5. **Escalabilidad pensada**: Diseñar considerando futuras expansiones desde el inicio

### Valor Personal del Proyecto
Más allá del producto final, FerreTraker representa:
- Confianza para abordar proyectos técnicos complejos desde cero
- Capacidad para aprender y aplicar nuevas tecnologías rápidamente
- Habilidad para decomponer problemas grandes en tareas manejables
- Experiencia práctica en todo el ciclo de desarrollo de software
- Preparación para desafíos profesionales reales en desarrollo web

---

*Este README fue creado como parte del proceso de aprendizaje, documentando no solo qué se construyó, sino cómo y por qué se tomaron ciertas decisiones técnicas. El proyecto continúa evolucionando como vehículo para el crecimiento técnico continuo.*

**Última actualización**: Mayo 2026
**Desarrollado con**: Curiosidad, perseverancia y compromiso con el aprendizaje constante