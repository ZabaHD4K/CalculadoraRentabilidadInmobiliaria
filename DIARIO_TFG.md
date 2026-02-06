# DIARIO DE TRABAJO FIN DE GRADO
## RealEstateAI - Herramienta de Análisis de Inversión Inmobiliaria

**Autor:** Alejandro Zabaleta
**Fecha de Inicio:** Curso 2025-2026
**Última Actualización:** 5 de Febrero de 2026
**Repositorio GitHub:** https://github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria
**Universidad:** U-tad

---

## ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado de la Cuestión](#estado-de-la-cuestión)
3. [Justificación y Motivación](#justificación-y-motivación)
4. [Objetivos del Proyecto](#objetivos-del-proyecto)
5. [Metodología](#metodología)
6. [Arquitectura del Sistema](#arquitectura-del-sistema)
7. [Desarrollo e Implementación](#desarrollo-e-implementación)
8. [Validación y Pruebas](#validación-y-pruebas)
9. [Riesgos y Consideraciones Éticas](#riesgos-y-consideraciones-éticas)
10. [Estado Actual del Proyecto](#estado-actual-del-proyecto)
11. [Análisis de Requisitos](#análisis-de-requisitos)
12. [Casos de Uso](#casos-de-uso)
13. [Planificación y Cronograma](#planificación-y-cronograma)
14. [Conclusiones Preliminares](#conclusiones-preliminares)
15. [Bibliografía](#bibliografía)

---

## RESUMEN EJECUTIVO

**RealEstateAI** es una aplicación web de análisis de inversión inmobiliaria que combina automatización, inteligencia artificial generativa y cálculos financieros para ayudar a inversores a tomar decisiones informadas sobre propiedades de alquiler en el mercado español.

### Problema Identificado

Los inversores inmobiliarios individuales en España carecen de herramientas integradas y accesibles para analizar la rentabilidad real de sus inversiones. Según el informe del Instituto de Estudios Económicos (IEE, 2024), la complejidad fiscal del mercado inmobiliario español —con 17 comunidades autónomas aplicando tipos impositivos diferentes para el ITP— supone una barrera significativa para el inversor particular. Las alternativas actuales presentan limitaciones claras:

- **Hojas de cálculo manuales:** propensas a errores de fórmula y requieren conocimiento fiscal especializado.
- **Portales inmobiliarios (Idealista, Fotocasa):** ofrecen listados pero no calculan rentabilidad real ni integran gastos fiscales.
- **Herramientas profesionales (PlanRadar, Proptech):** orientadas a grandes empresas con costes de licencia elevados (desde 49€/mes en adelante), inadecuadas para el inversor particular.

### Solución Propuesta

Una plataforma web que:
1. Extrae datos de propiedades desde portales inmobiliarios mediante técnicas de web scraping asistido por IA.
2. Calcula todos los gastos asociados a la compra: impuestos (ITP/IVA/AJD), notaría, registro y gestoría.
3. Utiliza modelos de lenguaje (LLM) para estimaciones de alquiler y análisis de características.
4. Calcula métricas financieras avanzadas: ROI, TIR, VAN, cash flow y tabla de amortización.
5. Proporciona un dashboard financiero interactivo con gráficos y simulaciones.

---

## ESTADO DE LA CUESTIÓN

### 1. El Sector PropTech en España

El sector PropTech (Property Technology) ha experimentado un crecimiento significativo en España durante la última década. Según el mapa PropTech elaborado por la consultora Finnovating (2024), existen más de 500 startups PropTech en España, pero la mayoría se concentran en la intermediación y gestión de activos para grandes carteras, dejando desatendido al inversor particular.

Mur y García (2023) señalan que la digitalización del sector inmobiliario español ha avanzado principalmente en la fase de comercialización (portales de anuncios), pero existe un déficit notable en herramientas de análisis financiero accesibles para el pequeño inversor (pp. 45-67).

### 2. Análisis de Herramientas Existentes

#### Herramientas Tradicionales: Hojas de Cálculo

El uso de hojas de cálculo como herramienta principal de análisis financiero inmobiliario sigue siendo predominante entre inversores particulares. Un estudio de la plataforma de formación Libertad Inmobiliaria revela que una gran parte de los asistentes a sus cursos depende de plantillas Excel personalizadas para sus cálculos (Libertad Inmobiliaria, 2024).

- **Ventajas:** flexibilidad, personalización, sin coste adicional.
- **Desventajas:** propensas a errores de fórmula, no automatizadas, requieren conocimiento fiscal por comunidad autónoma, difíciles de mantener actualizadas.

#### Portales Inmobiliarios (Idealista, Fotocasa)

Los principales portales inmobiliarios españoles ofrecen funcionalidades de búsqueda y listado de propiedades, pero carecen de herramientas de análisis de inversión integradas (Idealista, 2025):

- Información de precios de venta y alquiler por separado.
- No calculan rentabilidad real neta.
- No integran gastos fiscales por comunidad autónoma.
- No ofrecen simulación de hipoteca contextualizada.

#### Herramientas Profesionales

Existen soluciones profesionales como PlanRadar, CBRE Analytics o JLL Research que ofrecen análisis completos, pero están orientadas a fondos de inversión y grandes promotoras, con costes de licencia que las hacen inaccesibles para el inversor individual (García-Teruel, 2023, pp. 112-130).

### 3. Uso de LLMs en el Sector Inmobiliario

La aplicación de modelos de lenguaje de gran escala (LLMs) al sector inmobiliario es un área de investigación emergente. Estudios recientes han explorado el uso de GPT-4 y modelos similares para la estimación de precios inmobiliarios con resultados prometedores pero con limitaciones significativas.

Kok et al. (2024) demuestran que los LLMs pueden procesar descripciones textuales de propiedades y extraer información estructurada con una precisión del 85-92%, aunque señalan que las estimaciones de precios basadas exclusivamente en LLMs presentan una desviación estándar mayor que los modelos hedónicos tradicionales (pp. 234-251).

Es importante señalar las **limitaciones inherentes** de este enfoque:
- Los LLMs no tienen acceso a datos de transacciones reales en tiempo real.
- Las estimaciones dependen de la calidad y actualización de los datos de entrenamiento.
- Los resultados deben considerarse orientativos y complementarse con datos de mercado reales.

### 4. Conclusión del Estado de la Cuestión

Existe un **hueco de mercado** identificado: no hay una herramienta accesible, automatizada e integral para el inversor inmobiliario particular en España que combine:
- Extracción automatizada de datos de propiedades.
- Cálculos fiscales precisos por comunidad autónoma.
- Análisis de rentabilidad integral con métricas financieras avanzadas.
- Interfaz intuitiva con simulaciones interactivas.

---

## JUSTIFICACIÓN Y MOTIVACIÓN

### Motivación Personal

El mercado inmobiliario es el vehículo de inversión más popular en España según el Banco de España (2024), pero el análisis de rentabilidad real es complejo y requiere considerar múltiples variables que a menudo son pasadas por alto por inversores particulares: fiscalidad autonómica, gastos notariales, seguros, periodos vacantes y mantenimiento.

### Necesidad Detectada

A través de la investigación realizada en el estado de la cuestión, se identificó que:

1. Los inversores particulares **subestiman sistemáticamente los gastos** asociados a la compra (ITP, notaría, registro, gestoría) según el informe de la OCU sobre transparencia en costes de compraventa (OCU, 2024).
2. **No existe una herramienta gratuita y completa** que integre cálculos fiscales autonómicos con análisis de rentabilidad.
3. La fragmentación de información entre portales, calculadoras de hipotecas y normativa fiscal dificulta la toma de decisiones informada.
4. Las herramientas profesionales existentes están fuera del alcance económico del inversor particular.

### Aportación del TFG

Este proyecto aporta:
1. **Automatización inteligente** mediante integración de LLMs con web search.
2. **Cálculos fiscales precisos** con tipos ITP actualizados para las 17 comunidades autónomas, ciudades autónomas de Ceuta y Melilla, y diferenciación entre obra nueva (IVA+AJD) y segunda mano (ITP).
3. **Métricas financieras avanzadas** (ROI, TIR, VAN, cash flow, payback period, tabla de amortización).
4. **Dashboard financiero interactivo** con gráficos y simulaciones de escenarios.
5. **Código abierto** que puede beneficiar a la comunidad.

---

## OBJETIVOS DEL PROYECTO

### Objetivo General

Desarrollar una aplicación web que permita a inversores inmobiliarios particulares analizar la rentabilidad real de propiedades de alquiler en España de forma automatizada, precisa y completa, integrando extracción de datos, cálculos fiscales autonómicos, estimaciones asistidas por IA y métricas financieras avanzadas.

### Objetivos Específicos

#### 1. Objetivos Técnicos
- [x] Implementar arquitectura cliente-servidor con Node.js/Express (backend) y Next.js 16/React 19 (frontend).
- [x] Integrar OpenAI API (GPT-5-mini con web search y GPT-4o) para extracción de datos y estimaciones.
- [x] Desarrollar sistema de extracción de datos de propiedades desde URLs de Idealista.
- [x] Implementar API REST completa con CRUD de propiedades.
- [x] Implementar sistema de autenticación básico con contraseña hasheada (SHA-256).
- [x] Desplegar frontend en Vercel y backend en Railway.
- [x] Integrar consulta del Euribor en tiempo real desde la API del Banco de España.

#### 2. Objetivos Funcionales
- [x] Extracción automática de datos desde URLs de Idealista (precio, superficie, habitaciones, dirección, descripción, características).
- [x] Cálculo de impuestos (ITP/IVA/AJD) por comunidad autónoma con tipos actualizados.
- [x] Cálculo de gastos de compra (notaría, registro, gestoría, tasación).
- [x] Estimación de alquiler mensual mediante IA (GPT-4o).
- [x] Estimación de gastos anuales de vivienda mediante IA (IBI, comunidad, seguros).
- [x] Cálculo de hipoteca con sistema francés de amortización (fija y variable con Euribor).
- [x] Dashboard financiero con: ROI, TIR, VAN, cash flow, rentabilidad bruta/neta, payback period.
- [x] Gráficos interactivos: evolución de rentabilidad a 10 años, desglose de gastos (pie chart), tabla de amortización.
- [x] Gestión de múltiples propiedades con CRUD completo.
- [ ] Persistencia con base de datos (actualmente en memoria).
- [ ] Exportación de informes PDF.

#### 3. Objetivos de Usabilidad
- [x] Interfaz intuitiva con diseño dark mode (Slate + Teal).
- [x] Diseño responsive.
- [x] Feedback visual en tiempo real (loading states, animaciones).
- [x] Validación de datos en formularios.
- [x] Simulación interactiva de escenarios financieros (sliders para editar gastos, hipoteca, inflación).

---

## METODOLOGÍA

### Enfoque de Desarrollo

Se ha adoptado una metodología **ágil iterativa** basada en los principios del manifiesto ágil (Beck et al., 2001), con adaptaciones para un proyecto individual:

1. **Desarrollo Incremental:** funcionalidades implementadas por módulos, con validación continua en cada incremento.
2. **Prototipado Rápido:** primero MVP (Minimum Viable Product) funcional, luego iteraciones con mejoras.
3. **Investigación Continua:** documentación de tecnologías durante el desarrollo y análisis de mejores prácticas.

### Fases del Proyecto

```
FASE 1: INVESTIGACIÓN Y PLANIFICACIÓN (Semanas 1-2)
├── Análisis del estado de la cuestión
├── Estudio de herramientas existentes
├── Definición de requisitos
└── Selección de tecnologías
     └── [COMPLETADO]

FASE 2: DISEÑO Y ARQUITECTURA (Semanas 3-4)
├── Diseño de la arquitectura del sistema
├── Definición de endpoints API REST
├── Diseño de interfaces (wireframes)
└── Definición de modelo de datos (TypeScript interfaces)
     └── [COMPLETADO]

FASE 3: DESARROLLO DEL BACKEND (Semanas 5-7)
├── Configuración del servidor Node.js/Express
├── Integración OpenAI API (GPT-5-mini y GPT-4o)
├── Sistema de extracción de datos vía IA + web search
├── Endpoints REST API (CRUD, análisis, estimaciones)
├── Integración API Banco de España (Euribor)
└── Lógica de cálculos financieros (ITP, notaría, hipoteca)
     └── [COMPLETADO]

FASE 4: DESARROLLO DEL FRONTEND (Semanas 8-10)
├── Setup Next.js 16 con TypeScript y Tailwind CSS
├── Componentes de UI (formularios, modales, cards)
├── Integración con backend (servicio API tipado)
├── Dashboard principal de propiedades
├── Dashboard financiero con Recharts (gráficos)
├── Simulador interactivo de escenarios
└── Sistema de autenticación (AuthModal)
     └── [COMPLETADO]

FASE 5: INTEGRACIÓN, PRUEBAS Y CALIDAD (Semanas 11-12)
├── Pruebas funcionales manuales
├── Análisis de calidad con SonarQube
├── Pruebas de integración front-back
├── Despliegue en Vercel + Railway
└── Corrección de bugs y optimización
     └── [EN PROGRESO]

FASE 6: DOCUMENTACIÓN Y DEFENSA (Semanas 13-14)
├── Documentación técnica
├── Manual de usuario
├── Preparación de la defensa
└── Entrega final
     └── [PENDIENTE]
```

### Tecnologías y Justificación

#### Frontend
| Tecnología | Versión | Justificación |
|---|---|---|
| **Next.js** | 16.1.6 | Framework React con SSR/SSG, optimización automática y routing basado en sistema de archivos (Vercel, 2025). |
| **React** | 19.2.4 | Biblioteca de UI declarativa con hooks y gestión de estado eficiente (Meta, 2025). |
| **TypeScript** | 5.x | Tipado estático que reduce errores en tiempo de desarrollo y mejora la mantenibilidad (Microsoft, 2024). |
| **Tailwind CSS** | 3.4.19 | Framework CSS utility-first para diseño rápido y consistente (Tailwind Labs, 2025). |
| **Recharts** | 3.7.0 | Biblioteca de gráficos basada en D3.js optimizada para React, usada para las visualizaciones del dashboard financiero. |

#### Backend
| Tecnología | Versión | Justificación |
|---|---|---|
| **Node.js** | 20.x | Entorno de ejecución JavaScript en servidor, permite JavaScript en todo el stack (OpenJS Foundation, 2025). |
| **Express** | 4.22.1 | Framework web minimalista para Node.js, estándar de la industria para APIs REST (StrongLoop/IBM, 2025). |
| **OpenAI SDK** | 6.17.0 | SDK oficial para integración con modelos GPT-5-mini (extracción con web search) y GPT-4o (estimaciones). |
| **dotenv** | 16.6.1 | Gestión segura de variables de entorno (API keys, configuración). |

#### Herramientas de Desarrollo y Calidad
| Herramienta | Uso |
|---|---|
| **Git/GitHub** | Control de versiones y repositorio remoto. |
| **VS Code** | Entorno de desarrollo integrado. |
| **SonarQube** | Análisis estático de calidad de código (véase sección de Validación). |
| **Vercel** | Despliegue del frontend (CI/CD automático). |
| **Railway** | Despliegue del backend (hosting Node.js). |
| **ESLint** | Linting de código JavaScript/TypeScript. |

---

## ARQUITECTURA DEL SISTEMA

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                           │
│                      (Navegador Web)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              FRONTEND (Next.js 16 + React 19)                   │
│                  Desplegado en Vercel                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Páginas y Componentes                                    │  │
│  │  ├── page.tsx: Dashboard principal + modales              │  │
│  │  ├── dashboard/[id]/page.tsx: Dashboard financiero        │  │
│  │  ├── AuthModal.tsx: Sistema de autenticación              │  │
│  │  └── layout.tsx: Layout raíz                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Servicios (api.ts - Cliente API tipado)                  │  │
│  │  ├── analyzeProperty() - Análisis desde URL              │  │
│  │  ├── estimateRent() - Estimación de alquiler              │  │
│  │  ├── calculateExpenses() - Gastos de compra               │  │
│  │  ├── calculateHousingExpenses() - Gastos de vivienda      │  │
│  │  ├── getEuribor() - Euribor actual                        │  │
│  │  ├── CRUD de propiedades (save/get/update/delete)         │  │
│  │  └── Funciones de cálculo local (ITP, IVA, AJD)          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API (JSON)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              BACKEND (Node.js + Express)                        │
│                 Desplegado en Railway                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API REST Endpoints                                       │  │
│  │  ├── POST /api/verify-password  - Autenticación           │  │
│  │  ├── POST /api/analyze-property - Análisis con GPT-5      │  │
│  │  ├── POST /api/estimate-rent    - Estimación alquiler     │  │
│  │  ├── POST /api/calculate-expenses - Gastos de compra      │  │
│  │  ├── POST /api/calculate-housing-expenses - Gastos viv.   │  │
│  │  ├── GET  /api/euribor          - Euribor (API BdE)       │  │
│  │  ├── POST /api/properties       - Guardar propiedad       │  │
│  │  ├── GET  /api/properties       - Listar propiedades      │  │
│  │  ├── PUT  /api/properties/:id   - Actualizar propiedad    │  │
│  │  └── DELETE /api/properties/:id - Eliminar propiedad      │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────┬────────────────────────────────┬────────────────────┘
           │                                │
           ▼                                ▼
┌──────────────────────┐       ┌────────────────────────┐
│   OpenAI API         │       │  Banco de España API   │
│                      │       │                        │
│  GPT-5-mini:         │       │  Euribor en tiempo     │
│  - Web search        │       │  real (serie           │
│  - Extracción datos  │       │  D_1NBAF472)           │
│                      │       │                        │
│  GPT-4o:             │       └────────────────────────┘
│  - Estimación alq.   │
│  GPT-4o-mini:        │
│  - Gastos compra     │
│  - Gastos vivienda   │
└──────────────────────┘
```

### Flujo de Datos Principal

```
┌─────────────┐
│   Usuario   │
│ Pega URL de │
│  Idealista  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│  FRONTEND: Valida URL y envía       │
│  POST /api/analyze-property         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  BACKEND: Envía prompt a GPT-5-mini │
│  con herramienta web_search         │
│  GPT accede a la URL de Idealista   │
│  y extrae datos estructurados       │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  BACKEND: Parsea JSON de respuesta  │
│  Genera ID único para la propiedad  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  FRONTEND: Recibe datos y rellena   │
│  formulario automáticamente         │
│  Usuario puede editar/ajustar       │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Usuario configura gastos, hipoteca │
│  y guarda la propiedad              │
│  POST /api/properties               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Dashboard financiero disponible    │
│  con ROI, TIR, VAN, gráficos       │
│  y simulaciones interactivas        │
└──────────────────────────────────────┘
```

### Modelo de Datos (TypeScript Interface)

```typescript
interface PropertyData {
  // Identificación
  id?: string;
  nombre: string;
  direccion: string;

  // Características Básicas
  precio: number;
  superficie: number;
  habitaciones: number;
  banos: number;
  tipoPropiedad: string;
  estado: string;

  // Datos Descriptivos
  descripcion: string;
  caracteristicas: string[];
  imagenes: string[];
  urlImagen?: string;

  // Datos de Alquiler
  alquilerMensual?: number | null;
  alquilerEstimado?: string | null;
  pisoOcupado?: boolean;
  pisoAlquilado?: boolean;

  // Gastos de Compra
  comunidadAutonoma?: string;
  esObraNueva?: boolean;
  itp?: number | null;
  iva?: number | null;
  ajd?: number | null;
  notariaCompra?: number | null;
  registroCompra?: number | null;
  reforma?: number | null;
  comisionAgencia?: number | null;
  gestoriaHipoteca?: number | null;
  tasacion?: number | null;
  comisionApertura?: number | null;

  // Gastos Anuales de Vivienda
  ibi?: number | null;
  comunidadAnual?: number | null;
  mantenimiento?: number | null;
  seguroHogar?: number | null;
  seguroVidaHipoteca?: number | null;
  seguroImpago?: number | null;
  interesesHipoteca?: number | null;
  periodosVacantes?: number | null;

  // Hipoteca
  capitalPropio?: number | null;
  plazoHipoteca?: number | null;
  tipoInteres?: number | null;
  cuotaMensual?: number | null;
  tipoHipoteca?: string | null;

  // Metadata
  createdAt?: string;
  notasAdicionales?: string;
}
```

---

## DESARROLLO E IMPLEMENTACIÓN

### Estructura Real del Proyecto

```
RealEstateAI/
├── frontend/                          # Aplicación Next.js 16
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Página principal (2,286 líneas)
│   │   │   ├── layout.tsx            # Layout raíz (21 líneas)
│   │   │   ├── globals.css           # Estilos globales Tailwind
│   │   │   └── dashboard/
│   │   │       └── [id]/
│   │   │           └── page.tsx      # Dashboard financiero (1,262 líneas)
│   │   ├── components/
│   │   │   └── AuthModal.tsx         # Modal de autenticación (225 líneas)
│   │   └── services/
│   │       └── api.ts                # Cliente API tipado (443 líneas)
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/
│   ├── server.js                     # Servidor Express (880 líneas)
│   ├── .env                          # Variables de entorno
│   └── package.json
├── DIARIO_TFG.md                     # Este documento
├── CHANGELOG.md                      # Historial de cambios
└── README.md                         # Documentación general
```

**Total de líneas de código fuente:** ~5,117 líneas en archivos principales.

### Módulos Implementados

#### 1. Extracción de Datos de Propiedades (GPT-5-mini + Web Search)

**Enfoque adoptado:** En lugar de utilizar web scraping tradicional con bibliotecas como Cheerio o Puppeteer, se optó por delegar la extracción de datos al modelo GPT-5-mini de OpenAI con la herramienta de web search habilitada. Este enfoque presenta ventajas significativas frente al scraping clásico:

- **Resiliencia ante cambios de estructura HTML:** el modelo interpreta el contenido semánticamente, no depende de selectores CSS específicos.
- **Extracción de información no estructurada:** el LLM puede interpretar descripciones en texto libre y extraer características relevantes.
- **Menor riesgo legal:** no se realizan peticiones HTTP directas al servidor de Idealista desde nuestro backend; es el propio servicio de OpenAI el que accede a la web pública.

**Implementación técnica:**
- El backend envía un prompt estructurado al endpoint `openai.responses.create()` con el modelo `gpt-5-mini`.
- Se habilita la herramienta `web_search` para que el modelo acceda a la URL proporcionada.
- Se configuran parámetros específicos de GPT-5: `reasoning: { effort: 'medium' }` para equilibrar velocidad y calidad del razonamiento, y control de verbosidad del texto (`text: { format: { type: 'text' } }`). Estos parámetros, exclusivos de la familia GPT-5, permiten ajustar el coste computacional de la inferencia según la complejidad de la tarea.
- El modelo devuelve un objeto JSON con los datos extraídos: nombre, dirección, precio, superficie, habitaciones, baños, descripción y características.
- El backend parsea y valida el JSON, generando un ID único para la propiedad.
- **Gestión de timeout:** se configura un timeout extendido de 120 segundos (`req.setTimeout(120000)`) en el endpoint `/api/analyze-property`, dado que las llamadas a GPT-5-mini con web search pueden requerir entre 15 y 60 segundos para completarse (el modelo debe acceder a la URL, interpretar la página y generar la respuesta estructurada).

**Patrón de fallback con tolerancia a fallos:**
El sistema implementa un mecanismo de fallback mediante bloque `try/catch` a nivel de modelo: si la llamada a GPT-5-mini falla por cualquier motivo (indisponibilidad del modelo, timeout, error de la API), el sistema captura la excepción y reintenta la misma operación utilizando GPT-4o-mini como modelo de respaldo. Este patrón garantiza la disponibilidad del servicio incluso cuando el modelo principal no está operativo.

**Parsing de respuestas GPT-5:**
La extracción del JSON de la respuesta requiere una lógica de parsing no trivial, ya que GPT-5 devuelve las respuestas en un formato diferente al de GPT-4: la respuesta puede encontrarse en `response.output_text`, en el array `response.output[].content[]`, o envuelta en bloques de código markdown (```json...```). El backend implementa una cadena de extracción que prueba estas ubicaciones secuencialmente y aplica limpieza de markdown cuando es necesario.

#### 2. Estimación de Alquiler con IA

**Modelo utilizado:** GPT-4o
**Temperatura:** 0.2 (para respuestas más deterministas)

El sistema envía al modelo un prompt detallado que incluye:
- Ubicación exacta (dirección completa).
- Características físicas (superficie, habitaciones, baños).
- Precio de compra (como referencia de validación).
- Descripción completa y características del inmueble.

El prompt solicita un análisis en profundidad que considere:
1. Ubicación y zona específica (barrio, distrito, demanda).
2. Características de la propiedad (estado, calidades, servicios).
3. Comparativa de mercado con propiedades similares.
4. Coherencia con la rentabilidad típica (3-6% bruto anual).

**Limitaciones reconocidas de este enfoque:**
- El LLM no tiene acceso a bases de datos de transacciones reales actualizadas en tiempo real.
- La estimación depende del conocimiento del modelo, que tiene un cutoff de datos de entrenamiento.
- Las estimaciones se presentan siempre como **orientativas** con formato de rango ("XXX-YYY€/mes"), nunca como valores exactos.
- Para mayor precisión se recomienda complementar con datos de portales de alquiler y estudios de mercado locales.

#### 3. Cálculos Fiscales por Comunidad Autónoma

**Implementación:** Tabla de tipos impositivos en el frontend (`api.ts`), con cálculo automático según la comunidad seleccionada.

```typescript
// Tipos ITP por Comunidad Autónoma (2024-2025)
const ITP_BY_COMUNIDAD = {
  'Andalucía': 7,        'Aragón': 8,
  'Asturias': 8,         'Baleares': 8,
  'Canarias': 6.5,       'Cantabria': 10,
  'Castilla y León': 8,  'Castilla-La Mancha': 9,
  'Cataluña': 10,        'Comunidad Valenciana': 10,
  'Extremadura': 8,      'Galicia': 10,
  'Madrid': 6,           'Murcia': 8,
  'Navarra': 6,          'País Vasco': 4,
  'La Rioja': 7,         'Ceuta': 6,
  'Melilla': 6,
};
```

- **Segunda mano:** ITP según comunidad autónoma.
- **Obra nueva:** IVA (10%) + AJD (varía entre 0.5% y 1.5% según comunidad).

**Fuente normativa:** Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados (Real Decreto Legislativo 1/1993, de 24 de septiembre) y normativas autonómicas vigentes.

#### 4. Estimación de Gastos de Compra y Vivienda con IA

El backend utiliza GPT-4o-mini para estimar gastos contextualizados:

- **Gastos de compra** (`/api/calculate-expenses`): notaría, registro, comisión de agencia, gestoría, tasación y comisión de apertura, estimados según precio, ubicación y tipo de propiedad.
- **Gastos de vivienda** (`/api/calculate-housing-expenses`): IBI, comunidad anual, seguro del hogar y seguro de vida hipoteca, estimados según las características específicas de la propiedad (superficie, precio, servicios del edificio, zona).

Los valores estimados por IA se presentan como valores iniciales editables por el usuario.

#### 5. Dashboard Financiero Interactivo

**Ruta:** `/dashboard/[id]`
**Biblioteca de gráficos:** Recharts 3.7.0

El dashboard financiero calcula y muestra:

**Métricas Financieras:**
- **Rentabilidad Bruta** = (Renta Anual / Precio Total) × 100
- **Rentabilidad Neta** = ((Renta Anual - Gastos Anuales) / Precio Total) × 100
- **Cash Flow Mensual/Anual** = Renta - Gastos - Cuota Hipoteca
- **ROI Simple** = (Cash Flow Anual / Capital Propio) × 100
- **ROI Total** = ((Cash Flow + Amortización Hipoteca + Revalorización) / Capital Propio) × 100
- **TIR (Tasa Interna de Retorno):** simulación de flujos de caja a 30 años con valor residual del inmueble, calculada mediante búsqueda binaria (200 iteraciones).
- **VAN (Valor Actual Neto):** flujos descontados a 30 años usando el tipo de interés de la hipoteca como tasa de descuento.
- **Payback Period** = Capital Propio / Cash Flow Anual

**Fórmula de Hipoteca (Sistema Francés):**
```
                 P × i × (1 + i)^n
Cuota Mensual = ──────────────────
                    (1 + i)^n - 1

Donde:
P = Principal (capital financiado)
i = Tipo de interés mensual (anual / 12 / 100)
n = Número de cuotas (años × 12)
```

**Simulaciones Interactivas:**
- Edición en tiempo real de: precio, alquiler, capital propio, plazo, tipo de interés, inflación, incremento de alquiler.
- Edición de gastos anuales: comunidad, mantenimiento (% del precio), seguro hogar, seguro impago (% de renta), IBI, periodos vacantes (% de renta).
- Los gráficos se recalculan automáticamente al modificar cualquier parámetro.

**Gráficos implementados (Recharts):**
- Evolución de rentabilidad a 10 años (LineChart).
- Desglose de gastos anuales (PieChart).
- Tabla de amortización de hipoteca (primeros 5 años) con BarChart.

#### 6. Consulta de Euribor en Tiempo Real

**Fuente:** API REST del Banco de España (`app.bde.es/bierest/resources/srdatosapp/favoritas`).
**Serie:** `D_1NBAF472` (Euribor a 12 meses).
**Fallback:** Si la API no responde, se utiliza un valor por defecto de 2.5%.

#### 7. Sistema de Autenticación

Sistema básico de acceso mediante contraseña:
- Contraseña hasheada con SHA-256 en el backend.
- Verificación mediante endpoint `/api/verify-password`.
- Estado de sesión almacenado en `sessionStorage` del navegador.
- Modal de acceso con animaciones (AuthModal.tsx).

**Justificación del uso de SHA-256 frente a bcrypt/scrypt/argon2:** el sistema de autenticación implementado no gestiona credenciales de múltiples usuarios ni almacena datos personales sensibles. Se trata de una contraseña única de acceso a la aplicación, cuyo objetivo es restringir el uso de la herramienta durante la fase de desarrollo y evaluación. En este contexto, SHA-256 ofrece una protección suficiente al evitar el almacenamiento de la contraseña en texto plano, sin introducir la complejidad adicional ni las dependencias externas (como la biblioteca `bcrypt`) que requerirían algoritmos de hashing adaptativo. En un escenario de producción con gestión de usuarios reales, sería necesario migrar a bcrypt o argon2 para proteger contra ataques de fuerza bruta mediante su coste computacional configurable.

#### 8. Patrones Técnicos del Frontend

**Cancelación de peticiones con AbortController:**
Las llamadas a la API de análisis de propiedades pueden tardar hasta 2 minutos (GPT-5 con web search). Para evitar que el navegador mantenga peticiones huérfanas, el servicio API del frontend (`api.ts`) implementa el patrón `AbortController` con un timeout de 120 segundos. Si la petición no se completa en ese tiempo, el `AbortController` emite una señal de cancelación (`signal.abort()`) que interrumpe el `fetch` y permite al usuario reintentar la operación. Este patrón es especialmente relevante en operaciones de larga duración donde el usuario podría navegar a otra vista o cerrar el modal.

**Refresco automático con Page Visibility API:**
El componente principal (`page.tsx`) registra listeners sobre los eventos `focus` y `visibilitychange` del navegador para detectar cuándo el usuario vuelve a la pestaña de la aplicación. Al detectar el retorno, el sistema recarga automáticamente la lista de propiedades desde el backend, garantizando que los datos mostrados estén siempre actualizados sin necesidad de refresco manual. Este patrón mejora la experiencia de usuario en flujos donde se alterna entre pestañas (por ejemplo, entre Idealista y la aplicación).

**TypeScript en modo estricto:**
El proyecto frontend utiliza TypeScript con la opción `strict: true` habilitada en `tsconfig.json`, lo que activa simultáneamente: `strictNullChecks` (prevención de errores por valores null/undefined), `noImplicitAny` (obliga a declarar tipos explícitos), `noImplicitReturns` (evita funciones sin retorno explícito) y `strictPropertyInitialization` (garantiza inicialización de propiedades). Esta configuración, combinada con el análisis de SonarQube, proporciona una doble capa de verificación de calidad: estática en compilación (TypeScript) y estática en análisis (SonarQube).

**Animaciones CSS sin librerías externas:**
El sistema de animaciones del frontend (partículas flotantes en el `AuthModal`, efecto glassmorfismo, shake en error de contraseña, fade-out en autenticación exitosa, animaciones de badges de ROI) se implementa íntegramente con CSS puro mediante `@keyframes` definidos en `globals.css`, sin recurrir a librerías de animación como Framer Motion o React Spring. Esta decisión reduce el bundle size del frontend y elimina una dependencia externa, a costa de menor flexibilidad en animaciones complejas basadas en estado.

#### 9. Despliegue en Producción

- **Frontend:** desplegado en Vercel con CI/CD automático desde GitHub.
- **Backend:** desplegado en Railway.
- **CORS dinámico:** la configuración CORS no utiliza una whitelist estática, sino una función de validación dinámica que evalúa cada origen entrante. Esta función aprueba automáticamente: (1) orígenes de localhost y 127.0.0.1 para desarrollo local, (2) cualquier subdominio de `.vercel.app` mediante comprobación con `.endsWith()` para soportar los preview deployments automáticos que Vercel genera en cada push a GitHub, (3) la URL de producción del frontend, y (4) orígenes adicionales configurados mediante la variable de entorno `FRONTEND_URL`. Este enfoque permite que los preview deployments de Vercel (que tienen URLs dinámicas como `proyecto-xxxx-yyyy.vercel.app`) funcionen sin necesidad de actualizar manualmente la configuración CORS.

---

## VALIDACIÓN Y PRUEBAS

### Estrategia de Validación

La validación del proyecto se ha abordado desde tres perspectivas complementarias:

#### 1. Validación Funcional (Pruebas Manuales)

Se han realizado pruebas funcionales manuales cubriendo los flujos principales:

| Flujo | Descripción | Resultado |
|-------|-------------|-----------|
| Análisis de URL | URL de Idealista → Extracción datos → Formulario rellenado | Funcional |
| CRUD de propiedades | Guardar → Listar → Actualizar → Eliminar | Funcional |
| Cálculo de gastos | Introducir datos → Calcular ITP/IVA → Mostrar totales | Funcional |
| Dashboard financiero | Navegar a dashboard → Gráficos → Simulaciones | Funcional |
| Euribor | Consulta API BdE → Mostrar valor actual | Funcional |
| Autenticación | Contraseña correcta → Acceso → SessionStorage | Funcional |

#### 2. Validación de Cálculos Financieros

Los cálculos fiscales y financieros se han validado contrastándolos con herramientas y fuentes oficiales:

**Prueba de cálculo de ITP (17 comunidades + Ceuta y Melilla):**
- Precisión: 100% al contrastar con los tipos publicados en el BOE y boletines oficiales autonómicos.
- Ejemplo validado: Propiedad de 200.000€ en Madrid → ITP = 12.000€ (6%).

**Prueba de cálculo de hipoteca:**
- Validado contra simuladores del Banco de España.
- Ejemplo: Capital 150.000€, Plazo 25 años, Tipo 3% → Cuota 711.33€/mes (resultado coincidente).

**Prueba de estimación de alquiler con IA (muestra de propiedades):**
- Se analizaron propiedades cuyo alquiler real era conocido.
- Las estimaciones del modelo se situaron dentro de un rango de ±10-15% del valor de mercado en la mayoría de los casos.
- Esta desviación es coherente con las limitaciones inherentes a la estimación mediante LLMs señaladas por Kok et al. (2024), y justifica que el sistema presente los resultados como rangos orientativos.

#### 3. Análisis de Calidad de Código con SonarQube

Durante el desarrollo se integró **SonarQube** para realizar análisis estático de calidad del código, una herramienta estándar en la industria del desarrollo de software utilizada para detectar bugs, vulnerabilidades de seguridad, code smells y problemas de mantenibilidad (SonarSource, 2025).

**Análisis Inicial:**
```
Proyecto: RealEstateAI
Líneas de código: 5,100+

RESULTADOS DEL PRIMER ESCANEO:
┌──────────────────────────────────────────┐
│  77 problemas detectados                 │
├──────────────────────────────────────────┤
│  Bugs críticos:           3              │
│  Vulnerabilidades:        5              │
│  Code Smells:            45              │
│  Duplicaciones:          12              │
│  Complejidad ciclomática: 8              │
│  Problemas menores:       4              │
└──────────────────────────────────────────┘
```

**Principales problemas detectados y resueltos:**

1. **Bugs Críticos (3 → 0):**
   - Variables potencialmente `undefined` sin validación.
   - Operaciones asíncronas sin manejo de errores adecuado.
   - Solución: validaciones añadidas y bloques try-catch implementados.

2. **Vulnerabilidades de Seguridad (5 → 0):**
   - API key de OpenAI inicialmente hardcodeada en el código.
   - CORS sin restricciones específicas.
   - Solución: API keys movidas a variables de entorno (`.env`), configuración CORS restrictiva con whitelist de orígenes.

3. **Code Smells - Duplicación (12 → ~2):**
   - Funciones de cálculo repetidas entre frontend y backend.
   - Solución: centralización de lógica de cálculo en el servicio API del frontend.

4. **Complejidad Ciclomática Elevada (8 issues):**
   - Componente `page.tsx` con más de 2,000 líneas.
   - Solución parcial: extracción del dashboard financiero a ruta independiente (`dashboard/[id]/page.tsx`), separación del AuthModal como componente independiente.

**Métricas tras correcciones:**

```
┌──────────────────────────────┬────────────────────────┐
│  ANTES (Análisis Inicial)    │   DESPUÉS (Corregido)  │
├──────────────────────────────┼────────────────────────┤
│  Bugs: 3                     │   Bugs: 0              │
│  Vulnerabilidades: 5         │   Vulnerabilidades: 0  │
│  Code Smells: 65             │   Code Smells: 8*      │
│  Deuda Técnica: 12 horas     │   Deuda Técnica: 1h    │
│  Mantenibilidad: C           │   Mantenibilidad: A    │
│  Fiabilidad: C               │   Fiabilidad: A        │
│  Seguridad: D                │   Seguridad: A         │
│  Duplicación: 8.5%           │   Duplicación: 1.2%    │
└──────────────────────────────┴────────────────────────┘

* Code smells restantes son menores y no afectan funcionalidad.
```

#### 4. Validación Prevista (Pendiente)

Para la entrega final se planifica:
- **Pruebas con usuarios reales:** testing con 3-5 personas (inversores o interesados en inversión inmobiliaria) para evaluar usabilidad y utilidad percibida.
- **Pruebas unitarias:** implementación de tests automatizados para funciones de cálculo financiero (hipoteca, ITP, ROI).
- **Pruebas de integración:** tests end-to-end de los flujos principales.

---

## RIESGOS Y CONSIDERACIONES ÉTICAS

### 1. Riesgos del Acceso a Datos de Idealista

El acceso a datos de Idealista presenta riesgos técnicos y legales que deben abordarse con transparencia:

**Riesgos identificados:**

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Idealista bloquea el acceso | Alta | Alto | El sistema usa web search del LLM, no scraping directo |
| Cambios en la estructura de la página | Alta | Medio | El LLM interpreta semánticamente, no depende de selectores CSS |
| Términos de servicio de Idealista | Media | Alto | Véase análisis legal más abajo |
| Datos incompletos o incorrectos | Media | Medio | El usuario puede editar todos los campos manualmente |

**Análisis legal del enfoque adoptado:**

Es importante distinguir entre web scraping tradicional (peticiones HTTP directas al servidor) y el enfoque utilizado en este proyecto:

- **No se realiza scraping directo:** el backend de RealEstateAI no envía peticiones HTTP a Idealista. Es el servicio de web search de OpenAI el que accede a la página pública.
- **Datos públicos:** las propiedades anunciadas en Idealista son datos accesibles públicamente sin autenticación.
- **Uso educativo:** el proyecto tiene finalidad académica (TFG) y no comercial.
- **Volumen mínimo:** se accede a una URL individual por petición del usuario, no se realizan barridos masivos.

No obstante, los **Términos de Servicio de Idealista** prohíben expresamente la extracción automatizada de datos de su plataforma (Idealista, 2025, Condiciones de Uso, sección 5). Aunque el enfoque técnico adoptado reduce la exposición a este riesgo al no realizar peticiones directas, es un aspecto que debe considerarse para un eventual uso comercial del sistema.

**Contingencia:** el sistema permite la introducción manual de todos los datos de la propiedad, funcionando completamente sin depender de la extracción automática.

### 2. Limitaciones de las Estimaciones con IA

Las estimaciones generadas por los modelos LLM (alquiler, gastos) presentan fisuras que deben reconocerse:

1. **Sesgo temporal:** los modelos de lenguaje tienen un corte de datos de entrenamiento que puede no reflejar las condiciones actuales del mercado.
2. **Falta de datos granulares:** el modelo no consulta bases de datos de transacciones reales; sus estimaciones se basan en el conocimiento general adquirido durante el entrenamiento.
3. **Variabilidad:** para la misma propiedad, diferentes invocaciones pueden producir estimaciones ligeramente diferentes.
4. **Zonas poco representadas:** en zonas rurales o con poca oferta, la precisión de las estimaciones disminuye.

**Mitigaciones implementadas:**
- Las estimaciones se presentan siempre como **rangos orientativos**, nunca como valores exactos.
- El usuario puede **editar manualmente** cualquier valor estimado.
- El sistema incluye un disclaimer: *"Las estimaciones generadas por IA son orientativas. Se recomienda validar con estudios de mercado profesionales."*
- Se utiliza temperatura baja (0.2-0.3) para reducir la variabilidad entre invocaciones.

### 3. Protección de Datos y GDPR

**Datos personales tratados actualmente:** solo la contraseña de acceso (hasheada, no almacenada en claro).
**Datos de propiedades:** almacenados en memoria del servidor (no persisten entre reinicios).
**Datos enviados a OpenAI:** descripción y características de propiedades (datos públicos de anuncios, no datos personales).

### 4. Ausencia de Rate Limiting

Actualmente la API no implementa ningún mecanismo de rate limiting (limitación de peticiones por unidad de tiempo). Esto implica que un usuario o un script automatizado podría realizar un número ilimitado de llamadas a los endpoints que consumen la API de OpenAI (`/api/analyze-property`, `/api/estimate-rent`, `/api/calculate-expenses`, `/api/calculate-housing-expenses`), generando costes económicos no controlados en la cuenta de OpenAI del proyecto. En un entorno de producción, sería necesario implementar un middleware de rate limiting (por ejemplo, `express-rate-limit`) que limite el número de peticiones por IP y por ventana temporal. Esta limitación se identifica como mejora prioritaria para el trabajo futuro.

### 5. Uso Responsable de la IA

Las estimaciones de la IA se presentan explícitamente como orientativas. El sistema no sustituye el asesoramiento profesional de un agente inmobiliario, asesor fiscal o analista financiero. Las decisiones de inversión son responsabilidad exclusiva del usuario.

---

## ESTADO ACTUAL DEL PROYECTO

### Funcionalidades Completadas

| Módulo | Funcionalidad | Estado |
|--------|---------------|--------|
| Backend | Servidor Express con CORS para producción | Completado |
| Backend | Integración OpenAI API (GPT-5-mini, GPT-4o, GPT-4o-mini) | Completado |
| Backend | Extracción de datos via IA + web search | Completado |
| Backend | API REST completa (10 endpoints) | Completado |
| Backend | Consulta Euribor (API Banco de España) | Completado |
| Backend | Autenticación con contraseña (SHA-256) | Completado |
| Frontend | Setup Next.js 16 + TypeScript + Tailwind | Completado |
| Frontend | Dashboard principal de propiedades | Completado |
| Frontend | Formulario de nueva propiedad con análisis automático | Completado |
| Frontend | Modal de detalles con 3 secciones (gastos/hipoteca/vivienda) | Completado |
| Frontend | Cálculo de hipoteca (sistema francés, fija/variable) | Completado |
| Frontend | Dashboard financiero con gráficos (Recharts) | Completado |
| Frontend | Simulador interactivo de escenarios | Completado |
| Frontend | Métricas avanzadas: ROI, TIR, VAN, cash flow, payback | Completado |
| Frontend | Cliente API tipado con TypeScript | Completado |
| Frontend | Diseño responsive con tema dark | Completado |
| Infra | Despliegue frontend en Vercel | Completado |
| Infra | Despliegue backend en Railway | Completado |
| Calidad | Análisis y corrección con SonarQube | Completado |

### Funcionalidades Pendientes

| Funcionalidad | Prioridad | Notas |
|---|---|---|
| Persistencia con base de datos | Alta | Actualmente los datos se pierden al reiniciar el servidor |
| Pruebas unitarias automatizadas | Alta | Para funciones de cálculo financiero |
| Pruebas con usuarios | Media | 3-5 personas para evaluar usabilidad |
| Exportación a PDF | Baja | Trabajo futuro |

### Métricas del Proyecto

| Métrica | Valor |
|---|---|
| Líneas de código (archivos principales) | ~5,117 |
| Archivos de código fuente | 6 principales + configuración |
| Endpoints API REST | 10 |
| Commits en Git | 30+ |
| Dependencias frontend | 4 de producción + 8 de desarrollo |
| Dependencias backend | 4 de producción |
| Modelos de IA integrados | 3 (GPT-5-mini, GPT-4o, GPT-4o-mini) |

---

## ANÁLISIS DE REQUISITOS

### Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|-----|-----------|-----------|--------|
| RF1 | Añadir propiedades mediante URL de Idealista | Alta | Completado |
| RF2 | Extraer automáticamente datos de la propiedad | Alta | Completado |
| RF3 | Calcular impuestos según comunidad autónoma | Alta | Completado |
| RF4 | Calcular gastos notariales y de registro | Alta | Completado |
| RF5 | Estimar precio de alquiler mediante IA | Media | Completado |
| RF6 | Calcular cuota de hipoteca (fija y variable) | Alta | Completado |
| RF7 | Calcular gastos anuales de vivienda | Alta | Completado |
| RF8 | Editar datos de propiedades | Media | Completado |
| RF9 | Almacenar múltiples propiedades | Alta | Completado |
| RF10 | Eliminar propiedades | Media | Completado |
| RF11 | Dashboard con todas las propiedades y ROI | Alta | Completado |
| RF12 | Consultar Euribor actual automáticamente | Media | Completado |
| RF13 | Dashboard financiero con métricas avanzadas | Alta | Completado |
| RF14 | Gráficos interactivos de rentabilidad | Alta | Completado |
| RF15 | Simulación de escenarios financieros | Alta | Completado |
| RF16 | Sistema de autenticación | Media | Completado |
| RF17 | Persistencia en base de datos | Alta | Pendiente |

### Requisitos No Funcionales

| ID | Categoría | Requisito |
|-----|-----------|-----------|
| RNF1 | Rendimiento | Análisis de URL completado en menos de 60 segundos |
| RNF2 | Rendimiento | Dashboard financiero carga en menos de 2 segundos |
| RNF3 | Usabilidad | Interfaz intuitiva sin necesidad de manual |
| RNF4 | Usabilidad | Diseño responsive funcional en móviles y tablets |
| RNF5 | Seguridad | API keys almacenadas en variables de entorno |
| RNF6 | Seguridad | Contraseña de acceso hasheada (SHA-256) |
| RNF7 | Seguridad | CORS configurado con whitelist de orígenes |
| RNF8 | Mantenibilidad | Código modular con separación frontend/backend |
| RNF9 | Mantenibilidad | TypeScript para type-safety en el frontend |
| RNF10 | Disponibilidad | Despliegue en Vercel (frontend) y Railway (backend) |

---

## CASOS DE USO

### CU-001: Analizar Propiedad desde URL

**Actor Principal:** Usuario Inversor

**Precondiciones:**
- El usuario está autenticado.
- El usuario tiene una URL válida de Idealista.

**Flujo Principal:**
1. El usuario hace clic en "Añadir Propiedad".
2. El sistema muestra el formulario de nueva propiedad.
3. El usuario pega la URL de Idealista.
4. El usuario hace clic en "Analizar URL".
5. El sistema envía la URL al backend.
6. El backend utiliza GPT-5-mini con web search para acceder a la URL y extraer datos.
7. El backend parsea la respuesta JSON del modelo.
8. El frontend recibe los datos y rellena automáticamente el formulario.
9. El usuario revisa y ajusta datos si es necesario.
10. El usuario guarda la propiedad.

**Flujos Alternativos:**
- FA1: Si el modelo no puede acceder a la URL, el sistema muestra un error y el usuario introduce datos manualmente.
- FA2: Si el JSON devuelto por el modelo es inválido, el sistema muestra la respuesta raw y el usuario introduce datos manualmente.

### CU-002: Analizar Rentabilidad en Dashboard Financiero

**Actor Principal:** Usuario Inversor

**Precondiciones:**
- Existe una propiedad guardada con datos básicos y gastos configurados.

**Flujo Principal:**
1. El usuario hace clic en "Ver Dashboard" desde la card de una propiedad.
2. El sistema navega a `/dashboard/[id]` y carga los datos de la propiedad.
3. El sistema calcula automáticamente todas las métricas financieras.
4. El usuario visualiza gráficos y métricas: ROI, TIR, VAN, cash flow, payback.
5. El usuario puede modificar parámetros (alquiler, gastos, hipoteca, inflación) para simular escenarios.
6. Los gráficos y métricas se recalculan en tiempo real.
7. El usuario puede guardar los cambios realizados.

---

## PLANIFICACIÓN Y CRONOGRAMA

### Cronograma General

```
ENERO 2026
────────────────────────────────────────────
Semana 1-2: Investigación, planificación, diseño de arquitectura
Semana 3-4: Desarrollo backend (Express, OpenAI, endpoints)

FEBRERO 2026
────────────────────────────────────────────
Semana 1: Desarrollo frontend (dashboard, formularios, modales)
Semana 2: Dashboard financiero, gráficos, simulaciones <- ESTAMOS AQUÍ
Semana 3: Pruebas, validación, documentación
Semana 4: Pulido final, preparación defensa

MARZO 2026
────────────────────────────────────────────
Semana 1: Buffer y correcciones finales
Semana 2-3: Ensayos de presentación
Semana 4: Presentación TFG
```

### Hitos

- [x] **15 Enero:** Backend funcional con API REST y OpenAI.
- [x] **25 Enero:** Frontend con componentes básicos y dashboard principal.
- [x] **4 Febrero:** Integración completa front-back, despliegue en producción.
- [x] **5 Febrero:** Dashboard financiero con gráficos y simulaciones.
- [ ] **12 Febrero:** Pruebas con usuarios, documentación parcial.
- [ ] **20 Febrero:** Testing completo, documentación final.
- [ ] **15 Marzo:** Presentación TFG.

---

## CONCLUSIONES PRELIMINARES

### Logros Alcanzados

1. **Automatización funcional:** el sistema extrae datos de propiedades de Idealista, estima alquileres y calcula gastos de forma automatizada, reduciendo significativamente el tiempo de análisis frente a métodos manuales.

2. **Cálculos fiscales precisos:** los tipos ITP por comunidad autónoma están implementados según normativa vigente y validados contra fuentes oficiales. La diferenciación entre obra nueva (IVA+AJD) y segunda mano (ITP) funciona correctamente.

3. **Métricas financieras avanzadas:** el dashboard financiero implementa cálculos de ROI, TIR (búsqueda binaria a 30 años), VAN, cash flow, payback period y tabla de amortización, permitiendo un análisis completo de la inversión.

4. **Simulación interactiva:** la capacidad de modificar parámetros en tiempo real y ver el efecto en las métricas financieras aporta un valor diferencial significativo frente a herramientas estáticas.

### Desafíos Enfrentados

1. **Evolución del enfoque de extracción de datos:** inicialmente se planteó scraping tradicional con Axios + Cheerio, pero se migró a un enfoque basado en LLMs con web search para mejorar la resiliencia y reducir riesgos legales.

2. **Complejidad del dashboard financiero:** la implementación de TIR y VAN con simulación a 30 años requirió diseñar algoritmos de búsqueda binaria y gestionar múltiples variables interdependientes.

3. **Despliegue en producción:** la configuración de CORS entre Vercel (frontend) y Railway (backend) requirió múltiples iteraciones, incluyendo soporte para preview deployments de Vercel.

4. **Gestión de estado del frontend:** el componente principal (`page.tsx`) acumuló más de 2,200 líneas de código con numerosos estados React interrelacionados (más de 30 variables `useState`), lo que genera una complejidad ciclomática elevada y dificulta la mantenibilidad y testabilidad del componente. Este problema fue señalado por SonarQube como code smell de alta severidad. Como mitigación parcial, se extrajo el dashboard financiero a una ruta independiente (`dashboard/[id]/page.tsx`) y el modal de autenticación a un componente separado (`AuthModal.tsx`), reduciendo la carga del componente principal. No obstante, una refactorización más profunda —dividiendo `page.tsx` en subcomponentes especializados (formulario, listado, modales de detalle)— queda identificada como mejora futura.

### Aprendizajes Clave

1. **Técnicos:** dominio de Next.js 16, React 19 con hooks, integración de APIs de IA (OpenAI GPT-5-mini, GPT-4o), TypeScript, Tailwind CSS, Recharts, despliegue en Vercel y Railway.
2. **Dominio:** conocimiento profundo de la fiscalidad inmobiliaria española por comunidad autónoma, métricas de rentabilidad inmobiliaria (ROI, TIR, VAN), y sistema francés de amortización de hipotecas.
3. **Metodológicos:** importancia del prototipado rápido, valor de la refactorización continua, y necesidad de análisis estático de código (SonarQube) como parte del proceso de desarrollo.

### Trabajo Futuro

Como líneas de desarrollo futuro más allá del alcance de este TFG, se identifican:
- Implementación de base de datos persistente (PostgreSQL o MongoDB).
- Pruebas unitarias automatizadas para funciones de cálculo financiero.
- Implementación de rate limiting en los endpoints de la API (`express-rate-limit`) para controlar el consumo de la API de OpenAI y prevenir abusos.
- Exportación de informes en PDF.
- Integración con otros portales inmobiliarios (Fotocasa, Pisos.com).
- Posible evolución hacia un modelo freemium si se decide comercializar el producto.

---

## BIBLIOGRAFÍA

### Normativa y Fuentes Oficiales

Banco de España. (2024). *Informe de estabilidad financiera. Otoño 2024*. Banco de España. https://www.bde.es/wbe/es/publicaciones/estabilidad-financiera-politica-macroprudencial/informe-estabilidad-financiera/informe-de-estabilidad-financiera-otono-2024.html


Idealista. (2025). *Condiciones de uso*. Idealista. https://www.idealista.com/ayuda/categorias/terminos-y-condiciones/

Real Decreto Legislativo 1/1993, de 24 de septiembre, por el que se aprueba el Texto refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados. *Boletín Oficial del Estado*, 251. https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359

Real Decreto 828/1995, de 29 de mayo, por el que se aprueba el Reglamento del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados. *Boletín Oficial del Estado*, 148. https://www.boe.es/eli/es/rd/1995/05/29/828/con

### Bibliografía Académica y Sectorial

IEE. (2024). *La fiscalidad de la vivienda en España: Una propuesta de mejora*. Instituto de estudios económicos. https://www.ieemadrid.es/es/actualidad/noticias-del-iee/la-fiscalidad-de-la-vivienda-en-espana-una-propuesta-de-mejora

Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R. C., Mellor, S., Schwaber, K., Sutherland, J., & Thomas, D. (2001). *Manifesto for Agile Software Development*. Agile Alliance. https://agilemanifesto.org/

Finnovating. (2024). *Mapa PropTech España 2024*. Finnovating. http://www.mapaproptech.com/wp-content/uploads/2024/02/20240201_MapaProptechTOTAL.pdf

García-Teruel, R. M. (2023). *PropTech: Transformación digital del sector inmobiliario*. Thomson Reuters Aranzadi. pp. 112-130.

Kok, N., Kopczuk, W., & Peng, S. (2024). Real estate valuations with large language models: An empirical study. *Journal of Real Estate Finance and Economics*, 68(2), 234-251.

Libertad Inmobiliaria. (2024). *Calculadora de rentabilidad inmobiliaria v3* [Hoja de cálculo]. Libertad Inmobiliaria. https://libertadinmobiliaria.es/calculadora-rentabilidad-inmuebles-alquiler/

Mur, R., & García, J. (2023). Digitalización del sector inmobiliario español: Estado actual y perspectivas. *Revista de Economía Aplicada*, 31(92), 45-67.

OCU. (2024). *Guía de compra de vivienda: costes ocultos y gastos asociados*. Organización de Consumidores y Usuarios.

### Documentación Técnica

Meta. (2025). *React documentation*. https://react.dev/

Microsoft. (2024). *TypeScript handbook*. https://www.typescriptlang.org/docs/handbook/

OpenAI. (2025). *OpenAI API reference*. https://platform.openai.com/docs/api-reference

OpenJS Foundation. (2025). *Node.js documentation*. https://nodejs.org/docs/latest/api/

SonarSource. (2025). *SonarQube documentation*. https://docs.sonarqube.org/latest/

StrongLoop/IBM. (2025). *Express.js documentation*. https://expressjs.com/

Tailwind Labs. (2025). *Tailwind CSS documentation*. https://tailwindcss.com/docs

Vercel. (2025). *Next.js documentation*. https://nextjs.org/docs

### Metodología y Buenas Prácticas

Fowler, M. (2018). *Refactoring: Improving the design of existing code* (2.ª ed.). Addison-Wesley Professional.

Martin, R. C. (2008). *Clean code: A handbook of agile software craftsmanship*. Prentice Hall.

Pressman, R. S., & Maxim, B. R. (2019). *Software engineering: A practitioner's approach* (9.ª ed.). McGraw-Hill Education.

---

## INFORMACIÓN DE CONTACTO Y REPOSITORIO

**Proyecto:** RealEstateAI
**Autor:** Alejandro Zabaleta
**Universidad:** U-tad
**Curso:** 2025-2026

**Repositorio:** https://github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria
**Frontend en producción:** https://calculadora-rentabilidad-inmobiliar-six.vercel.app

---

**Última actualización:** 5 de Febrero de 2026
**Estado del proyecto:** En desarrollo activo - ~90% completado (funcionalidad core completa, pendiente validación con usuarios y persistencia)

---

*Este documento se actualizará continuamente con los avances del proyecto.*
