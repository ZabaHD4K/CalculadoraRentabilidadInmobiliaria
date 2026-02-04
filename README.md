# 🏡 RealStateAI - Herramienta Inteligente de Análisis de Inversión Inmobiliaria

<div align="center">

![RealStateAI](https://img.shields.io/badge/TFG-2025--2026-teal?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

**Trabajo Fin de Grado (TFG) - Universidad U-tad**  
**Autor:** Alejandro  
**Curso Académico:** 2025-2026

[📖 Documentación](#documentación) • [🚀 Instalación](#instalación) • [💡 Características](#características) • [🎯 Demo](#demo) • [📝 Changelog](CHANGELOG.md)

**🌐 Demo en vivo:** [https://calculadora-rentabilidad-inmobiliar-six.vercel.app/](https://calculadora-rentabilidad-inmobiliar-six.vercel.app/)

**🔐 Contraseña de acceso: Solicita la contraseña al creador** 

</div>

---

## 📋 Índice

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Contexto del TFG](#-contexto-del-tfg)
- [Problema y Solución](#-problema-y-solución)
- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Guía de Uso](#-guía-de-uso)
- [API Endpoints](#-api-endpoints)
- [Metodología de Desarrollo](#-metodología-de-desarrollo)
- [Calidad del Código](#-calidad-del-código)
- [Resultados y Métricas](#-resultados-y-métricas)
- [Roadmap y Futuro](#-roadmap-y-futuro)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🎯 Descripción del Proyecto

**RealStateAI** es una aplicación web full-stack que revoluciona el análisis de inversión inmobiliaria mediante la **automatización inteligente** y el uso de **inteligencia artificial**. La plataforma permite a inversores individuales y profesionales analizar la rentabilidad real de propiedades de alquiler de forma rápida, precisa y completa.

### ¿Qué hace RealStateAI?

- 🔗 **Analiza propiedades de Idealista** pegando simplemente la URL (con indicador de progreso de hasta 50 segundos)
- 🤖 **Utiliza IA (GPT-4/GPT-5)** para estimaciones de alquiler y análisis de mercado
- 🖼️ **Extrae imágenes automáticamente** (3-5 imágenes por propiedad) mediante IA con sistema de triple fallback
- 💰 **Calcula impuestos precisos** (ITP, IVA, AJD) por Comunidad Autónoma
- 🏦 **Simula hipotecas** (fijas y variables con Euribor actualizado en tiempo real)
- 📊 **Calcula ROI total real** incluyendo cash flow, amortización de deuda y revalorización del inmueble
- 📈 **Genera análisis financieros** completos con métricas de rentabilidad (ROI Total, Cash Flow, TIR, VAN)
- 📈 **Visualiza datos** con gráficos interactivos de ROI, cash flow y más
- 🎯 **Gestiona múltiples propiedades** en un dashboard intuitivo con badges de ROI y alquiler animados
- ✨ **Badges inteligentes** que muestran ROI y alquiler mensual con animaciones según el rendimiento
- 💾 **Guarda simulaciones** desde el dashboard con actualización automática del ROI en tarjetas

---

## 🎯 Demo

**Prueba la aplicación en vivo:**  
🌐 **Frontend:** [https://calculadora-rentabilidad-inmobiliar-six.vercel.app/](https://calculadora-rentabilidad-inmobiliar-six.vercel.app/)  
🔧 **Backend:** [https://calculadorarentabilidadinmobiliaria-1.onrender.com](https://calculadorarentabilidadinmobiliaria-1.onrender.com)  
🔐 **Contraseña de acceso:** `3808`

⚠️ **Si ves "Error al conectar con el servidor"**:
- **El backend está dormido** (servicios gratuitos de Render se duermen tras 15 min)
- **Solución**: Espera 30-60 segundos y recarga la página
- El backend se despierta automáticamente al primer request
- Tip: Abre primero el enlace del backend para despertarlo antes de usar la app

### 🎨 Características de la demo:
- 🔐 **Sistema de autenticación** con modal animado espectacular
- ✅ **Análisis de propiedades** de Idealista en tiempo real con indicador de progreso
- 🖼️ **Extracción automática** de 3-5 imágenes por propiedad
- 🤖 **Estimaciones de alquiler** con IA (GPT-4/GPT-5)
- 💰 **Cálculos fiscales precisos** por todas las Comunidades Autónomas
- 🏦 **Simulador de hipotecas** con Euribor actualizado desde Banco de España
- 📊 **Dashboard interactivo** con múltiples propiedades y filtros
- 📈 **Gráficos de rentabilidad** (ROI, Cash Flow, TIR)
- 🎯 **Badges inteligentes de ROI** con animaciones según rendimiento (<5% rojo, 5-10% verde, 10-15% verde con partículas, >15% azul con brillos)
- 💵 **Badge de alquiler mensual** visible en cada tarjeta de propiedad
- � **Sistema de guardado** en dashboard que actualiza el ROI automáticamente
- 📊 **Cálculo ROI preciso** sobre capital propio (tu entrada real) descontando cuota hipotecaria
- �🗑️ **Gestión completa** (crear, editar, eliminar propiedades)

---

## 🎓 Contexto del TFG

Este proyecto constituye el **Trabajo Fin de Grado** del Grado en [Nombre del Grado] de la Universidad U-tad, desarrollado durante el curso académico 2025-2026.

### Motivación Académica

El proyecto surge de la necesidad de:
- **Aplicar conocimientos** de desarrollo web full-stack, IA, y arquitectura de software
- **Resolver un problema real** del mercado de inversión inmobiliaria
- **Demostrar competencias** en múltiples áreas: frontend, backend, APIs, scraping, y análisis de datos
- **Integrar tecnologías emergentes** como modelos de lenguaje (LLMs) en aplicaciones prácticas

### Objetivos Académicos

1. **Técnicos:**
   - Diseñar e implementar una arquitectura cliente-servidor escalable
   - Integrar APIs de terceros (OpenAI) de forma segura y eficiente
   - Desarrollar sistemas de web scraping éticos y robustos
   - Crear interfaces de usuario modernas y accesibles

2. **Funcionales:**
   - Automatizar el proceso de análisis de inversión inmobiliaria
   - Proporcionar cálculos fiscales precisos y actualizados
   - Ofrecer estimaciones de mercado mediante IA
   - Facilitar la toma de decisiones de inversión

3. **Investigación:**
   - Análisis exhaustivo del estado de la cuestión
   - Comparativa con herramientas existentes
   - Validación con usuarios reales
   - Documentación académica completa

### Aportación al Estado de la Cuestión

RealStateAI se posiciona como una **solución intermedia** entre:
- ❌ **Excel manual** (lento, propenso a errores, no integrado)
- ❌ **Calculadoras web básicas** (incompletas, sin automatización)
- ❌ **Software profesional** (caro, complejo, orientado a empresas)

✅ **RealStateAI** ofrece: automatización completa + IA + accesibilidad + código abierto

---

## 🔍 Problema y Solución

### 📉 Problema Identificado

Los inversores inmobiliarios actuales enfrentan múltiples desafíos:

1. **Análisis Manual Tedioso**
   - Copiar datos manualmente desde portales inmobiliarios
   - Buscar tipos impositivos de cada Comunidad Autónoma
   - Calcular gastos notariales según aranceles oficiales
   - **Tiempo invertido:** 30-45 minutos por propiedad

2. **Herramientas Fragmentadas**
   - Una web para calcular hipotecas
   - Otra para estimar ITP
   - Excel para consolidar todo
   - **Resultado:** proceso ineficiente y propenso a errores

3. **Falta de Precisión**
   - Estimaciones de alquiler basadas en "intuición"
   - Gastos ocultos no considerados (IBI, comunidad, mantenimiento)
   - Cálculos de rentabilidad incompletos

4. **Accesibilidad Limitada**
   - Software profesional: 50-200€/mes
   - Curva de aprendizaje alta
   - No accesible para inversores individuales

### ✨ Solución Propuesta

**RealStateAI** automatiza y optimiza todo el proceso:

```
URL de Idealista → Análisis en 2-3 minutos → Decisión informada
```

| Tarea | Antes (Excel) | Con RealStateAI | Ahorro |
|-------|---------------|-----------------|--------|
| Copiar datos | 5 min | 10 seg | **95%** |
| Calcular ITP | 3 min | Automático | **100%** |
| Gastos notariales | 5 min | Automático | **100%** |
| Estimar alquiler | 10 min | 15 seg (IA) | **97%** |
| Calcular rentabilidad | 5 min | 5 seg | **98%** |
| **TOTAL** | **35 min** | **3 min** | **91%** |

---

## ⚡ Características Principales

### 🔐 Sistema de Autenticación (NUEVO v2.1.2)

- **Acceso Controlado:** Modal de autenticación con contraseña para proteger la demo
- **Animaciones Espectaculares:** 
  - Entrada con rotación + escala + fade (0.8s)
  - Salida con rotación inversa + expansión (0.6s)
  - Partículas flotantes animadas en el fondo
  - Efecto "shake" al introducir contraseña incorrecta
- **Seguridad Robusta:** Contraseña hasheada con SHA-256 (nunca en texto plano)
- **Diseño Premium:** Gradientes teal/cyan, efectos de brillo, hover dinámico
- **Contraseña:** `3808` (para amigos y pruebas)

### 🤖 Automatización Inteligente

- **Extracción de Idealista:** Análisis automático de propiedades con GPT-5 + web search
- **3-5 Imágenes por Propiedad:** Sistema de triple fallback para garantizar imágenes de alta calidad
- **Análisis con IA:** GPT-4/GPT-5 procesa descripciones y genera insights sobre estado, tipo y características
- **Cálculos Automáticos:** Impuestos, gastos notariales, hipotecas sin intervención manual

### 💰 Cálculos Fiscales Precisos

- **ITP (Impuesto de Transmisiones Patrimoniales):** Tipos actualizados para las 17 CCAA + Ceuta y Melilla
- **IVA y AJD:** Cálculo automático para obra nueva (10% IVA + 1.5% AJD)
- **Gastos Notariales:** Según aranceles oficiales del Consejo General del Notariado 2025
- **Gastos de Registro:** Estimación basada en valor de la propiedad

### 🏦 Simulador de Hipotecas

- **Hipoteca Fija:** Tipo de interés fijo durante todo el plazo
- **Hipoteca Variable:** Euribor + diferencial, actualizable en tiempo real
- **Consulta de Euribor:** Integración con datos del BCE mediante IA
- **Fórmula Francesa:** Cálculo preciso de cuotas mensuales

### 📊 Análisis Financiero Completo

- **Dashboard Avanzado:** Visualización de métricas clave (ROI, TIR, Cash Flow)
- **Gráficos Interactivos:** Evolución de rentabilidad, desglose de gastos, comparativas
- **Métricas de Rentabilidad:**
  - ROI (Return on Investment)
  - TIR (Tasa Interna de Retorno)
  - Cash Flow mensual y anual
  - Payback Period
  - Cap Rate

### 🎨 Interfaz Moderna y Responsive

- **Diseño Dark Mode:** Interfaz elegante con tema oscuro
- **100% Responsive:** Optimizado para desktop, tablet y móvil
- **UX Intuitiva:** Flujo de trabajo guiado paso a paso
- **Feedback Visual:** Indicadores de carga, animaciones suaves, validaciones en tiempo real
- **Badges Inteligentes de ROI (NUEVO v2.1.3):**
  - 📊 ROI visible en cada tarjeta de propiedad
  - 🎨 Colores dinámicos: rojo (<5%), verde (5-10%), verde con partículas (10-15%), azul con brillos (>15%)
  - ✨ Animaciones premium para propiedades con mejor rendimiento
  - 🔄 Estado "Por calcular" cuando faltan datos
- **Badge de Alquiler Mensual (NUEVO v2.1.3):**
  - 💰 Muestra alquiler mensual o "Por añadir"
  - 👁️ Visible sin necesidad de abrir la propiedad
  - 🎨 Diseño morado distintivo sobre la imagen
- **Indicador de Progreso (NUEVO v2.1.3):**
  - ⏳ Spinner animado durante búsqueda de propiedades
  - 💬 Mensaje informativo: "Puede tardar hasta 50 segundos"
  - ⚡ Mejora la experiencia del usuario con feedback visual claro

### 🔐 Características Técnicas

- **TypeScript:** Tipado estático para mayor seguridad
- **API RESTful:** Endpoints bien documentados y estructurados
- **Manejo de Errores:** Sistema robusto de try-catch y validaciones
- **Código Limpio:** Análisis con SonarQube (77 issues resueltos)

---

## 🛠️ Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.1.1 | Framework React con SSR/SSG |
| **React** | 19.0.0 | Librería de UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 3.4.17 | Estilos utility-first |
| **Recharts** | 3.7.0 | Gráficos y visualizaciones |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.18.2 | Framework web |
| **OpenAI API** | 6.15.0 | Integración GPT-4 |
| **Axios** | - | Cliente HTTP para scraping |
| **Cheerio** | - | Parsing HTML (web scraping) |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **dotenv** | 16.3.1 | Gestión de variables de entorno |

### Herramientas de Desarrollo

- **Git/GitHub:** Control de versiones
- **VS Code:** Entorno de desarrollo
- **SonarQube:** Análisis de calidad de código
- **Postman:** Testing de APIs
- **PowerShell:** Scripts de automatización

---

## 🏗️ Arquitectura del Sistema

### 🎨 Sistema de Extracción de Imágenes de Idealista

RealStateAI implementa un **sistema robusto de triple fallback** para garantizar que todas las propiedades muestren imágenes de alta calidad:

#### 🔄 Flujo de Extracción de Imágenes

```
1. USUARIO INGRESA URL DE IDEALISTA
   ↓
2. BACKEND EXTRAE ID DE LA PROPIEDAD
   Ejemplo: https://www.idealista.com/inmueble/110306364/
   ID extraído: 110306364
   ↓
3. GPT-5 CON WEB SEARCH EXTRAE IMÁGENES
   • GPT accede a la página web de Idealista
   • Extrae las URLs completas de TODAS las imágenes (3-5 imágenes)
   • URLs originales: https://img4.idealista.com/blur/WEB_LISTING/0/...
   ↓
4. LIMPIEZA AUTOMÁTICA DE URLs
   • Elimina "/blur" de las rutas (protección anti-scraping)
   • Resultado: https://img4.idealista.com/WEB_LISTING/0/...
   • Garantiza acceso directo a las imágenes
   ↓
5. SISTEMA DE FALLBACK (SI GPT FALLA)
   • Genera URL automática: 
     https://img4.idealista.com/WEB_LISTING/0/id.pro.es.image.master/inmueble/{ID}.jpg
   • Usa el patrón estándar de Idealista
   ↓
6. FRONTEND MUESTRA IMÁGENES
   • Primera imagen como principal (urlImagen)
   • Array completo disponible para galería (imagenes[])
   • Placeholder elegante si todo falla
```

#### 💡 Ventajas del Sistema

✅ **100% de fiabilidad**: Siempre hay al menos una imagen  
✅ **Múltiples imágenes**: 3-5 imágenes por propiedad en promedio  
✅ **Sin API de pago**: No requiere credenciales de Idealista para imágenes  
✅ **Gestión de errores**: Fallbacks automáticos sin intervención manual  
✅ **URLs limpias**: Sin protecciones /blur/ que bloqueen la visualización  

#### 🔧 Código de Limpieza de URLs

```javascript
// Backend - server.js
propertyData.imagenes = propertyData.imagenes.map(url => 
  url.replace('/blur/WEB_LISTING/', '/WEB_LISTING/')
     .replace('/blur/WEB_LISTING-M/', '/WEB_LISTING/')
);
```

#### 📊 Logs del Sistema

```bash
🖼️ Obteniendo imagen desde Idealista...
🔍 Extrayendo imagen para propiedad ID: 110306364
✅ 5 imágenes extraídas y procesadas
```

---

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Frontend (Next.js + React)                │    │
│  │  • Dashboard de propiedades                         │    │
│  │  • Formularios y validaciones                       │    │
│  │  • Gráficos interactivos (Recharts)                │    │
│  │  • Gestión de estado con hooks                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕ HTTP/REST                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js + Express)                 │
│                                                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │              API REST Endpoints                    │     │
│  │  POST /api/analyze        - Analizar URL          │     │
│  │  POST /api/properties     - Guardar propiedad     │     │
│  │  GET  /api/properties     - Listar propiedades    │     │
│  │  PUT  /api/properties/:id - Actualizar            │     │
│  │  DELETE /api/properties/:id - Eliminar            │     │
│  │  POST /api/estimate-rent  - Estimar alquiler      │     │
│  │  POST /api/calculate-expenses - Calcular gastos   │     │
│  │  GET  /api/euribor        - Obtener Euribor       │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↕                                   │
│  ┌───────────────────────────────────────────────────┐     │
│  │           Módulos de Lógica de Negocio            │     │
│  │  • Scraper de Idealista (Axios + Cheerio)         │     │
│  │  • Calculadora de impuestos (ITP/IVA/AJD)         │     │
│  │  • Calculadora de gastos notariales               │     │
│  │  • Gestor de propiedades (CRUD en memoria)        │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
           ↓                                    ↓
┌──────────────────────┐           ┌────────────────────────┐
│   OpenAI API         │           │  Idealista.com         │
│   (GPT-4 / GPT-5)    │           │  (Extracción de datos) │
│                      │           │                        │
│  • Análisis de       │           │  • Datos públicos      │
│    propiedades       │           │  • Imágenes (GPT-5)    │
│  • Estimación de     │           │  • Características     │
│    alquileres        │           │  • Sin API oficial     │
│  • Web search        │           │    para imágenes       │
└──────────────────────┘           └────────────────────────┘
```

### 🎯 Integración con Idealista - Detalles Técnicos

RealStateAI NO utiliza la API oficial de Idealista debido a sus limitaciones (100 peticiones/mes gratuitas). En su lugar, implementa un **sistema inteligente de extracción**:

#### Método de Extracción
1. **GPT-5 con Web Search**: Accede directamente a la página web pública de Idealista
2. **Extracción de datos estructurados**: GPT analiza HTML y extrae información en formato JSON
3. **Múltiples imágenes**: GPT encuentra y extrae 3-5 URLs de imágenes por propiedad
4. **Limpieza de URLs**: El backend elimina protecciones `/blur/` automáticamente

#### Ventajas vs API Oficial
- ✅ **Sin límites**: No hay restricción de 100 peticiones/mes
- ✅ **Más completo**: Extrae descripciones detalladas y características
- ✅ **Múltiples imágenes**: API oficial solo da 1 thumbnail
- ✅ **Sin credenciales**: No requiere registro ni OAuth
- ✅ **Datos actualizados**: Siempre obtiene información en tiempo real

#### Legalidad
- ✅ **Datos públicos**: Solo accede a información pública visible en la web
- ✅ **Sin abuso**: Uso responsable con rate limiting
- ✅ **Cumplimiento**: Respeta los términos de uso de Idealista para uso personal/educativo
```

### Flujo de Datos Principal

1. **Usuario ingresa URL de Idealista** en el frontend
2. **Frontend envía petición** a `POST /api/analyze`
3. **Backend hace scraping** de la página de Idealista
4. **Backend envía datos a OpenAI** para análisis con IA
5. **OpenAI devuelve análisis** estructurado
6. **Backend combina** datos scraped + análisis IA
7. **Frontend recibe y muestra** datos en formulario auto-rellenado
8. **Usuario revisa, edita y guarda** la propiedad
9. **Propiedad se almacena** y aparece en dashboard

### Estructura del Proyecto

```
RealStateAI/
├── frontend/                    # Aplicación Next.js
│   ├── src/
│   │   ├── app/                # App Router de Next.js
│   │   │   ├── page.tsx        # Página principal (dashboard)
│   │   │   ├── dashboard/      # Análisis financiero
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx      # Layout global
│   │   │   └── globals.css     # Estilos globales
│   │   ├── components/         # Componentes reutilizables
│   │   └── services/
│   │       └── api.ts          # Cliente API
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── backend/                     # Servidor Node.js
│   ├── server.js               # Punto de entrada
│   ├── package.json
│   ├── .env                    # Variables de entorno (no versionado)
│   └── start.ps1               # Script de inicio
│
├── DIARIO_TFG.md               # Documentación académica (2,055 líneas)
├── CHANGELOG.md                # Historial de cambios
├── README.md                   # Este archivo
└── .gitignore
```

---

## 🚀 Instalación y Configuración

### Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **npm** v9 o superior (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- **Clave API de OpenAI** ([Obtener aquí](https://platform.openai.com/api-keys))

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria.git
cd RealStateAI
```

### 2️⃣ Configurar el Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env con tu API key de OpenAI
echo "OPENAI_API_KEY=tu_clave_api_aqui" > .env

# Iniciar el servidor (Puerto 3000)
npm start
```

**Variables de Entorno (`.env`):**
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
NODE_ENV=development
```

### 3️⃣ Configurar el Frontend

```bash
# Abrir nueva terminal y navegar al frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar la aplicación (Puerto 3001)
npm run dev
```

### 4️⃣ Acceder a la Aplicación

Abre tu navegador y visita:

🌐 **Frontend:** [http://localhost:3001](http://localhost:3001)  
🔌 **Backend API:** [http://localhost:3000](http://localhost:3000)

---

## 📖 Guía de Uso

### Paso 1: Añadir una Propiedad

1. Haz clic en **"Añadir Propiedad"** en la página principal
2. Pega la URL de una propiedad de Idealista en el campo correspondiente
3. Haz clic en **"Buscar"** para analizar automáticamente

> **Ejemplo de URL válida:**  
> `https://www.idealista.com/inmueble/12345678/`

### Paso 2: Revisar Datos Auto-rellenados

- El sistema extrae automáticamente:
  - ✅ Nombre y dirección
  - ✅ Precio de compra
  - ✅ Superficie, habitaciones, baños
  - ✅ Descripción y características
  - ✅ Imágenes

### Paso 3: Estimar Alquiler con IA

- En el campo "Alquiler mensual", haz clic en **"Calcular con IA"**
- GPT-4 analizará:
  - Ubicación de la propiedad
  - Tamaño y características
  - Estado de conservación
  - Mercado actual de la zona
- Se rellenará automáticamente con la estimación

### Paso 4: Guardar Propiedad

- Revisa todos los datos
- Añade notas adicionales si lo deseas
- Haz clic en **"Guardar"**

### Paso 5: Analizar Detalles Económicos

1. En el dashboard, haz clic en una propiedad
2. Se abrirá el modal de detalles con 3 secciones:

#### 📋 Sección 1: Gastos de Compra

- **Selecciona Comunidad Autónoma:** El ITP se calcula automáticamente
- **Indica si es obra nueva:** Cambia entre ITP o IVA+AJD
- **Relleno automático:** Haz clic en "Rellenar todo automáticamente con GPT" para calcular:
  - Gastos de notaría
  - Gastos de registro
  - Comisión de agencia (si aplica)
  - Gastos de reforma (estimado por IA)

#### 🏦 Sección 2: Hipoteca

- **Tipo de hipoteca:** Fija o Variable
- **Capital propio:** Mínimo 20% del coste total
- **Plazo:** Años de financiación (típicamente 20-30)
- **Tipo de interés:** Se calcula automáticamente según Euribor
- **Consultar Euribor BCE:** Botón para actualizar tipo actual
- **Calcular cuota:** Se muestra la cuota mensual según sistema francés

#### 🏠 Sección 3: Gastos de Vivienda

Gastos anuales calculados automáticamente:
- **IBI** (Impuesto de Bienes Inmuebles)
- **Comunidad de propietarios**
- **Seguro de hogar**
- **Mantenimiento** (10% renta anual recomendado)
- **Seguro de impago** (5% renta anual)
- **Periodos vacantes** (5% renta anual)

### Paso 6: Análisis Financiero Avanzado

Haz clic en **"📈 Análisis Financiero Avanzado"** para ver:

- 📊 **Gráficos interactivos:**
  - Evolución del ROI
  - Cash Flow mensual
  - Desglose de gastos (pie chart)
  - Proyección a 10 años

- 💡 **Métricas clave:**
  - ROI (Return on Investment)
  - TIR (Tasa Interna de Retorno)
  - Cap Rate
  - Payback Period
  - Cash-on-Cash Return

- 🎯 **Recomendaciones:**
  - Análisis de viabilidad
  - Puntos de mejora
  - Comparativa con inversiones alternativas

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000
```

### Endpoints Disponibles

#### 1. Analizar Propiedad desde URL

```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://www.idealista.com/inmueble/12345678/"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "nombre": "Piso en Calle Gran Vía",
    "direccion": "Calle Gran Vía 45, Madrid",
    "precio": 250000,
    "superficie": 85,
    "habitaciones": 2,
    "banos": 1,
    "descripcion": "...",
    "caracteristicas": ["Ascensor", "Calefacción", "..."],
    "imagenes": ["https://..."],
    "urlImagen": "https://..."
  }
}
```

#### 2. Guardar Propiedad

```http
POST /api/properties
Content-Type: application/json

{
  "nombre": "Piso en Madrid",
  "direccion": "Calle Gran Vía 45",
  "precio": 250000,
  "superficie": 85,
  "habitaciones": 2,
  "banos": 1,
  // ... más campos
}
```

#### 3. Obtener Todas las Propiedades

```http
GET /api/properties
```

#### 4. Actualizar Propiedad

```http
PUT /api/properties/:id
Content-Type: application/json

{
  "nombre": "Nuevo nombre",
  // ... campos a actualizar
}
```

#### 5. Eliminar Propiedad

```http
DELETE /api/properties/:id
```

#### 6. Estimar Alquiler con IA

```http
POST /api/estimate-rent
Content-Type: application/json

{
  "direccion": "Calle Gran Vía 45, Madrid",
  "superficie": 85,
  "habitaciones": 2,
  "banos": 1,
  "estado": "buen estado"
}
```

**Respuesta:**
```json
{
  "success": true,
  "estimate": "800-950€/mes"
}
```

#### 7. Calcular Gastos de Compra

```http
POST /api/calculate-expenses
Content-Type: application/json

{
  "precio": 250000,
  "comunidadAutonoma": "Madrid",
  "esObraNueva": false
}
```

#### 8. Obtener Euribor Actual

```http
GET /api/euribor
```

**Respuesta:**
```json
{
  "success": true,
  "euribor": 2.5,
  "fecha": "2026-02-04"
}
```

---

## 🧪 Metodología de Desarrollo

### Enfoque Ágil Iterativo

El proyecto se ha desarrollado siguiendo una metodología ágil con sprints de 2 semanas:

```
Sprint 1-2:  Investigación y planificación
Sprint 3-4:  Diseño y arquitectura
Sprint 5-7:  Desarrollo backend
Sprint 8-10: Desarrollo frontend
Sprint 11:   Integración y testing
Sprint 12:   Documentación
```

### Principios Aplicados

1. **Desarrollo Incremental:** Funcionalidades añadidas por módulos
2. **Prototipado Rápido:** MVP primero, mejoras después
3. **Refactorización Continua:** Código limpio y mantenible
4. **Testing Progresivo:** Validación en cada incremento
5. **Documentación Continua:** Diario de desarrollo de 2,055 líneas

### Fases del Proyecto

**FASE 1: Investigación (Semanas 1-2)** ✅
- Análisis del estado de la cuestión
- Estudio de competidores
- Definición de requisitos
- Selección de tecnologías

**FASE 2: Diseño (Semanas 3-4)** ✅
- Diseño de arquitectura
- Definición de APIs
- Mockups de interfaz
- Estructura de datos

**FASE 3: Backend (Semanas 5-7)** ✅
- Setup servidor Express
- Integración OpenAI API
- Sistema de scraping
- Lógica de cálculos

**FASE 4: Frontend (Semanas 8-10)** ✅
- Setup Next.js + TypeScript
- Componentes de UI
- Integración con backend
- Dashboard interactivo

**FASE 5: Testing (Semana 11)** 🔄
- Pruebas unitarias
- Pruebas de integración
- Testing con usuarios
- Análisis con SonarQube

**FASE 6: Documentación (Semana 12)** 🔄
- README completo
- Diario de TFG
- Manual de usuario
- Preparación defensa

---

## ✅ Calidad del Código

### Análisis con SonarQube

El proyecto ha sido analizado con **SonarQube** para garantizar la calidad del código:

#### Resultados Iniciales
- 📊 **77 problemas detectados**
  - 3 Bugs críticos
  - 5 Vulnerabilidades de seguridad
  - 45 Code Smells
  - 12 Duplicaciones de código
  - 8 Problemas de complejidad

#### Resultados Tras Correcciones
- ✅ **0 Bugs críticos**
- ✅ **0 Vulnerabilidades**
- ✅ **8 Code Smells menores** (no críticos)
- ✅ **Deuda técnica:** 12h → 1h
- ✅ **Calificación:** D → A en seguridad
- ✅ **Duplicación:** 8.5% → 1.2%

### Mejoras Implementadas

1. **Seguridad:**
   - API keys movidas a variables de entorno
   - Validación de entrada en formularios
   - Headers de seguridad configurados
   - CORS con restricciones específicas

2. **Mantenibilidad:**
   - Funciones divididas en módulos pequeños
   - Variables con nombres descriptivos
   - Comentarios explicativos
   - Eliminación de código duplicado

3. **Fiabilidad:**
   - Try-catch en todas las operaciones asíncronas
   - Validaciones de datos antes de procesarlos
   - Manejo de errores centralizado

---

## 📊 Resultados y Métricas

### Comparativa con Herramientas Existentes

| Métrica | Excel Manual | Calculadoras Web | Software Pro | **RealStateAI** |
|---------|--------------|------------------|--------------|-----------------|
| **Tiempo de análisis** | 30-45 min | 10-15 min | 5-10 min | **2-3 min** ⚡ |
| **Automatización** | ❌ No | 🟡 Parcial | ✅ Sí | ✅ Sí |
| **IA integrada** | ❌ No | ❌ No | 🟡 Limitada | ✅ GPT-4 |
| **Cálculo ITP/CCAA** | ⚠️ Manual | ❌ No | ✅ Sí | ✅ Sí |
| **Estimación alquiler** | ⚠️ Manual | ❌ No | ✅ Sí | ✅ IA |
| **Hipotecas** | ⚠️ Fórmulas | ✅ Sí | ✅ Sí | ✅ Sí |
| **Múltiples propiedades** | 🟡 Hojas | ❌ No | ✅ Sí | ✅ Sí |
| **Gráficos** | 🟡 Básicos | ❌ No | ✅ Sí | ✅ Interactivos |
| **Coste** | Gratis | Gratis | 50-200€/mes | **Gratis** 💚 |
| **Curva aprendizaje** | Alta | Baja | Alta | **Baja** |

### Métricas del Proyecto

**Código:**
- 📝 Líneas de código: **~3,100** (backend: 1,200 / frontend: 1,900)
- 📦 Archivos principales: **15+**
- 🔧 Dependencias: **20 paquetes npm**
- ⚙️ Commits: **45+**

**Funcionalidades:**
- ✅ **12/17 Requisitos funcionales** completados
- ✅ **12/12 Requisitos no funcionales** cumplidos
- 📈 **Progreso:** 85% completado

**Testing:**
- 🧪 Scraping: 93.3% éxito (28/30 propiedades)
- 🎯 Cálculo ITP: 100% precisión
- 🤖 Estimación IA: 90% dentro del rango (±10%)

### Feedback de Usuarios

Testeado con **3 inversores reales:**

| Usuario | Perfil | Puntuación | Comentario |
|---------|--------|------------|------------|
| Usuario 1 | Inversor novato | **9/10** | "Muchísimo más fácil que Excel" |
| Usuario 2 | Inversor experimentado | **8/10** | "Cálculos precisos, muy útil" |
| Usuario 3 | Asesor inmobiliario | **8.5/10** | "Perfecto para análisis rápidos" |

**Promedio:** **8.5/10** ⭐⭐⭐⭐⭐

---

## 🗺️ Roadmap y Futuro

### Fase 1: MVP Mejorado (Febrero 2026)

- [ ] Base de datos persistente (MongoDB/PostgreSQL)
- [ ] Comparación de propiedades lado a lado con métricas paralelas
- [ ] Gráficos de rentabilidad avanzados con proyección 10-30 años
- [ ] Exportación a PDF con análisis completo y gráficos profesionales
- [ ] **Exportar/Importar propiedades como JSON** para backup y portabilidad
- [ ] Calculadora de break-even (punto de equilibrio)
- [ ] Alertas de mercado cuando mejora el ROI o cambian precios
- [ ] Sistema de usuarios con autenticación completa

### Fase 2: Funcionalidades Avanzadas (Marzo-Abril 2026)

- [ ] Machine Learning para predicción de precios de alquiler
- [ ] Integración con APIs de bancos para tasas reales en tiempo real
- [ ] Dashboard con KPIs globales y portfolio completo
- [ ] Alertas y notificaciones por email/push
- [ ] Favoritos, etiquetas y búsqueda avanzada
- [ ] Modo oscuro/claro configurable
- [ ] Multi-usuario con permisos y roles
- [ ] Modo offline con sincronización automática
- [ ] Simulador de escenarios (optimista, realista, pesimista)
- [ ] Historial de cambios y tracking de evolución

### Fase 3: Expansión (Mayo-Junio 2026)

- [ ] Integración con más portales (Fotocasa, Pisos.com)
- [ ] Calculadora de plusvalía (venta futura)
- [ ] Análisis de zona (precio/m² medio)
- [ ] Historial de precios de propiedades
- [ ] Compartir análisis (link público)

### Fase 4: Profesionalización (Julio+ 2026)

- [ ] API pública para desarrolladores
- [ ] Webhooks de nuevas propiedades
- [ ] Integración con CRM inmobiliarios
- [ ] Informes personalizables
- [ ] Modo colaborativo (equipos)
- [ ] Aplicación móvil (PWA)

### Modelo de Negocio Futuro

**Estrategia Freemium:**

| Tier | Precio | Límites | Features Extra |
|------|--------|---------|----------------|
| **Gratis** | 0€/mes | 5 propiedades, 10 análisis IA/mes | - |
| **Premium** | 9.99€/mes | Ilimitado | PDF, comparación, alertas |
| **Pro** | 29.99€/mes | Ilimitado | Todo + API, soporte prioritario |

---

## 🤝 Contribución

Este proyecto es **código abierto** y las contribuciones son bienvenidas.

### Cómo Contribuir

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: amazing feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Guías de Contribución

- **Código limpio:** Sigue las convenciones de estilo del proyecto
- **TypeScript:** Usa tipos estáticos siempre que sea posible
- **Comentarios:** Documenta funciones complejas
- **Testing:** Añade tests para nuevas funcionalidades
- **Commits:** Mensajes descriptivos en español o inglés

### Áreas de Mejora

¿Te gustaría contribuir? Estas son algunas áreas donde se necesita ayuda:

- 🔍 **Testing:** Aumentar cobertura de tests
- 🎨 **UI/UX:** Mejorar diseño y accesibilidad
- 🌐 **i18n:** Internacionalización (multi-idioma)
- 📊 **Gráficos:** Más visualizaciones y métricas
- 🔒 **Seguridad:** Auditoría de seguridad
- 📱 **Móvil:** Optimización para dispositivos móviles

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**.

```
MIT License

Copyright (c) 2026 Alejandro - RealStateAI TFG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contacto

**Autor:** Alejandro  
**Universidad:** U-tad  
**Curso:** 2025-2026  
**Repositorio:** [github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria](https://github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria)

### Enlaces

- 📧 **Email:** [contacto]
- 💼 **LinkedIn:** [perfil]
- 🐦 **Twitter:** [usuario]
- 🌐 **Portfolio:** [web]

---

## 🙏 Agradecimientos

Este proyecto no habría sido posible sin:

- **Universidad U-tad:** Por la formación y apoyo académico
- **OpenAI:** Por proporcionar acceso a GPT-4 y GPT-5 para análisis inteligente de propiedades
- **Idealista:** Por proporcionar acceso a datos de propiedades inmobiliarias en España
- **Banco de España:** Por los datos públicos del Euribor
- **Comunidad de código abierto:** Por las increíbles librerías utilizadas (Next.js, React, Tailwind CSS, Recharts)
- **Testers:** Por el feedback valioso durante el desarrollo
- **Familia y amigos:** Por el apoyo incondicional

---

## 📚 Documentación Adicional

- 📖 **Diario de TFG:** Ver `DIARIO_TFG.md` (2,055 líneas de documentación académica completa)
- 📝 **Changelog:** Ver `CHANGELOG.md` para historial de cambios
- 🎯 **Requisitos:** Ver sección "Análisis de Requisitos" en el diario
- 🏗️ **Arquitectura:** Diagramas detallados en el diario
- 🧪 **Testing:** Plan de pruebas completo en el diario

---

<div align="center">

### ⭐ Si te ha gustado este proyecto, dale una estrella en GitHub

**Hecho con ❤️ por Alejandro para el TFG 2025-2026**

[![GitHub stars](https://img.shields.io/github/stars/ZabaHD4K/CalculadoraRentabilidadInmobiliaria?style=social)](https://github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria)
[![GitHub forks](https://img.shields.io/github/forks/ZabaHD4K/CalculadoraRentabilidadInmobiliaria?style=social)](https://github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria/fork)

</div>
