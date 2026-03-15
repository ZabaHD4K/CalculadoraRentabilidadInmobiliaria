# DIARIO DE TRABAJO FIN DE GRADO.
## RealEstateAI - Herramienta de Análisis de Inversión Inmobiliaria

**Autor:** Alejandro Zabaleta
**Fecha de Inicio:** Curso 2025-2026
**Última Actualización:** 21 de Febrero de 2026
**Repositorio GitHub:** https://github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria
**Universidad:** U-tad

---

## ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado de la Cuestión](#estado-de-la-cuestión)
3. [Justificación y Motivación](#justificación-y-motivación)
4. [Objetivos del Proyecto](#objetivos-del-proyecto)
5. [Análisis de Requisitos](#análisis-de-requisitos)
6. [Casos de Uso](#casos-de-uso)
7. [Metodología](#metodología)
8. [Planificación y Cronograma](#planificación-y-cronograma)
9. [Arquitectura del Sistema](#arquitectura-del-sistema)
10. [Desarrollo e Implementación](#desarrollo-e-implementación)
11. [Validación y Pruebas](#validación-y-pruebas)
12. [Riesgos y Consideraciones Éticas](#riesgos-y-consideraciones-éticas)
13. [Estado Actual del Proyecto](#estado-actual-del-proyecto)
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

Asensio-Soto (2023) señala en su tesis doctoral sobre la digitalización de la intermediación inmobiliaria en España que el sector PropTech ha avanzado principalmente en la fase de comercialización (portales de anuncios y plataformas de intermediación online), pero existe un déficit notable en herramientas de análisis financiero accesibles para el pequeño inversor.

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

Existen soluciones profesionales como PlanRadar, CBRE Analytics o JLL Research que ofrecen análisis completos, pero están orientadas a fondos de inversión y grandes promotoras, con costes de licencia que las hacen inaccesibles para el inversor individual (Asensio-Soto, 2023).

### 3. Métricas Financieras en Análisis de Inversión Inmobiliaria: Perspectiva Académica

La selección de las métricas financieras implementadas en este proyecto no es arbitraria, sino que responde a la literatura académica consolidada en análisis de inversión inmobiliaria. A continuación se justifica su elección desde una perspectiva académica y se contextualiza su aplicabilidad al mercado de alquiler residencial español.

#### 3.1. ROI (Return on Investment) y sus variantes

El ROI es la métrica más utilizada en la literatura práctica de inversión inmobiliaria (Gallinelli, 2015; Brueggeman & Fisher, 2022). En el contexto inmobiliario, es habitual distinguir entre rentabilidad bruta (gross yield) y neta (net yield), siendo la primera el cociente entre la renta anual y el precio de compra, y la segunda la que incorpora los gastos operativos. Ambas son las métricas de referencia publicadas en los informes de mercado de portales como Idealista o CBRE.

Sin embargo, Gallinelli (2015) advierte que ninguna de estas dos variantes captura el efecto del apalancamiento financiero (la hipoteca), que es determinante en la rentabilidad real del capital propio invertido. Por ello, este proyecto implementa también el **ROI sobre capital propio** (cash-on-cash return), definido como el flujo de caja neto anual dividido entre el capital aportado inicialmente, que es la métrica real del rendimiento del dinero que el inversor tiene efectivamente inmovilizado. Esta distinción es especialmente relevante en el mercado español, donde el apalancamiento hipotecario estándar oscila entre el 70% y el 80% del precio de compra.

#### 3.2. TIR (Tasa Interna de Retorno) y VAN (Valor Actual Neto)

La TIR y el VAN son los indicadores fundamentales del análisis de flujos de caja descontados (DCF, *Discounted Cash Flow*), framework desarrollado extensamente por Damodaran (2012) y aplicado a la inversión inmobiliaria por Brueggeman & Fisher (2022). Su inclusión en este proyecto responde a una limitación conceptual de las métricas de rendimiento simple como el ROI o el cap rate: estas métricas son estáticas (no consideran el valor temporal del dinero) y no permiten comparar inversiones con perfiles de flujo de caja distintos ni horizontes temporales diferentes.

La TIR tiene la ventaja de expresar la rentabilidad como un tipo de interés anualizado comparable con otras inversiones (bonos, fondos indexados, depósitos). Según el trabajo de Damodaran (2012), una TIR superior al coste de oportunidad del capital propio del inversor (tasa de descuento) indica creación de valor real. En la práctica del mercado español, una TIR entre 4% y 8% para activos residenciales en alquiler se considera un rango razonable dadas las condiciones actuales de tipos de interés y riesgo de alquiler (CBRE, 2024).

El VAN complementa a la TIR al cuantificar en términos absolutos (euros) el valor creado por la inversión descontando los flujos futuros a la tasa de descuento elegida. En este proyecto se utiliza el tipo de interés hipotecario como tasa de descuento proxy, siguiendo la recomendación de Gallinelli (2015) de alinear la tasa de descuento con el coste real del capital utilizado en la inversión.

Una limitación reconocida de la TIR es su sensibilidad a los supuestos sobre el valor residual del inmueble al final del horizonte de análisis y sobre la tasa de crecimiento de los alquileres, variables altamente inciertas. Por ello, el sistema implementa una **simulación interactiva** que permite al usuario modificar estos supuestos (inflación, incremento anual de alquiler) y observar su impacto en tiempo real sobre TIR y VAN, siguiendo la recomendación de análisis de sensibilidad propuesta por Damodaran (2012, cap. 12).

#### 3.3. Payback Period

El payback period (periodo de recuperación) es la métrica más intuitiva para el inversor no especializado, expresando cuántos años se necesitan para recuperar el capital invertido mediante los flujos de caja generados. Aunque es ampliamente criticado en la literatura financiera por ignorar los flujos posteriores a la recuperación y el valor temporal del dinero (Brealey, Myers & Allen, 2017), su popularidad entre inversores particulares justifica su inclusión como complemento a las métricas de flujos descontados.

#### 3.4. Criterios de selección de métricas

La selección final de métricas implementadas en RealEstateAI (rentabilidad bruta, rentabilidad neta, cash flow mensual/anual, ROI sobre capital propio, ROI total con revalorización y amortización, TIR, VAN y payback period) refleja un compromiso entre rigor académico y comprensibilidad para el inversor particular:

- Las métricas **simples** (bruta, neta, payback) son accesibles para usuarios sin formación financiera avanzada y son las utilizadas por los portales y medios sectoriales.
- Las métricas **DCF** (TIR, VAN) son las empleadas en el análisis profesional de inversiones y en la literatura académica, pero requieren comprender el concepto de valor temporal del dinero.
- El **ROI total con desglose** (cash flow + amortización de deuda + revalorización) es la métrica más completa porque captura todos los vectores de creación de valor de una inversión inmobiliaria, siguiendo el modelo propuesto por Brueggeman & Fisher (2022, cap. 9).

### 4. Inteligencia Artificial Generativa para Valoración de Activos Inmobiliarios

La aplicación de modelos de lenguaje de gran escala (LLMs) al sector inmobiliario es un área de investigación emergente con literatura creciente. A continuación se revisan los antecedentes más relevantes y se contextualiza el enfoque adoptado en este proyecto.

#### 4.1. Métodos tradicionales de valoración: de la econometría hedónica a los modelos de *machine learning*

Antes de la irrupción de los LLMs, la valoración automatizada de activos inmobiliarios (AVM, *Automated Valuation Models*) se apoyaba principalmente en dos enfoques. El primero, la **regresión hedónica** (Lancaster, 1966; Rosen, 1974), descompone el precio de una propiedad en las aportaciones marginales de sus características observables (superficie, número de habitaciones, antigüedad, localización, equipamientos), estimando un precio implícito para cada atributo mediante regresión lineal. Este enfoque tiene sólidos fundamentos teóricos pero presenta limitaciones en la captura de relaciones no lineales y efectos de interacción entre variables.

El segundo enfoque, basado en **algoritmos de aprendizaje automático** (random forests, gradient boosting, redes neuronales), ha demostrado mayor precisión predictiva en la literatura comparativa (Antipov & Pokryshevskaya, 2012; Čeh et al., 2018). Estos modelos capturan relaciones no lineales y complejas entre variables, pero requieren grandes datasets de transacciones etiquetadas y carecen de interpretabilidad intrínseca.

#### 4.2. Emergencia de los LLMs como herramienta de valoración

La aparición de modelos de lenguaje como GPT-4 y sus sucesores ha abierto una nueva vía de investigación en valoración inmobiliaria, diferente de los enfoques anteriores en tres aspectos fundamentales:

1. **Razonamiento textual:** los LLMs pueden procesar y razonar sobre información no estructurada (descripciones de propiedades, características cualitativas, contexto de mercado) que los modelos estadísticos tradicionales no pueden incorporar directamente.
2. **Acceso a información actualizada:** los modelos con herramientas de web search pueden consultar datos de mercado en tiempo real, superando el corte temporal de los datos de entrenamiento.
3. **Transparencia argumentativa:** a diferencia de los modelos de *machine learning* (cajas negras), los LLMs pueden ofrecer una justificación verbal de su estimación, lo que mejora la confianza del usuario en el resultado.

Geerts et al. (2025) realizan un análisis comparativo sistemático entre LLMs (GPT-4, Claude) y modelos tradicionales (random forest, XGBoost) en la tarea de valoración inmobiliaria sobre datasets europeos. Sus resultados muestran que los LLMs producen estimaciones estadísticamente significativas y coherentes con el mercado, pero que los modelos de *machine learning* siguen siendo superiores en precisión predictiva pura (menor RMSE). Los autores identifican dos debilidades estructurales de los LLMs para esta tarea: (1) sobreconfianza en los intervalos de predicción generados (intervalos demasiado estrechos en relación con el error real observado) y (2) capacidades limitadas de razonamiento espacial (dificultad para ponderar adecuadamente factores de proximidad como la distancia a estaciones de metro o zonas verdes).

Más relevante para este proyecto es la distinción entre **valoración de activos** (precio de venta) y **estimación de alquiler de mercado**. Aunque la literatura académica se concentra mayoritariamente en la primera tarea, el enfoque adoptado en RealEstateAI se centra en la segunda, que presenta características diferentes: los alquileres son más sensibles a condiciones coyunturales (tensión del mercado, oferta disponible en el momento concreto) y menos determinados por las características físicas de la propiedad. Esta sensibilidad temporal hace que el acceso a datos en tiempo real (web search) sea especialmente valioso para la estimación de alquileres, frente a la valoración de activos donde los datos históricos de transacciones son más estables.

#### 4.3. El rol del acceso a datos en tiempo real (*web search augmentation*)

La técnica de augmentar los LLMs con acceso a información web en tiempo real (retrieval-augmented generation, RAG, o directamente web search tools) es un campo activo de investigación que trasciende el ámbito inmobiliario (Lewis et al., 2020). En el contexto específico de la estimación de alquileres, este enfoque permite superar la principal limitación de los LLMs estáticos: el corte temporal de los datos de entrenamiento.

Como se demuestra empíricamente en la sección de validación de este proyecto, la diferencia de precisión entre GPT-4o (sin acceso a internet) y GPT-5-mini (con web search) es estadísticamente relevante y sistemática: GPT-4o subestima los alquileres en mercados con crecimiento acelerado reciente (Valencia, San Sebastián, Palma de Mallorca) precisamente porque su conocimiento de precios es anterior a la subida registrada en 2024-2025.

Es importante señalar las **limitaciones inherentes** de este enfoque, siguiendo los criterios de honestidad científica establecidos por Geerts et al. (2025):
- Los LLMs con web search pueden encontrar listados no representativos (precios inflados, propiedades muy diferentes a la consultada).
- La variabilidad entre invocaciones no se elimina completamente incluso con temperatura baja.
- En zonas rurales o con poca oferta publicada en portales, la precisión disminuye significativamente.
- Las estimaciones de alquiler no sustituyen a la tasación profesional ni al análisis comparativo de mercado (CMA) realizado por un agente especializado.

### 6. Conclusión del Estado de la Cuestión

Existe un **hueco de mercado** identificado: no hay una herramienta accesible, automatizada e integral para el inversor inmobiliario particular en España que combine:
- Extracción automatizada de datos de propiedades.
- Cálculos fiscales precisos por comunidad autónoma.
- Análisis de rentabilidad integral con métricas financieras avanzadas (ROI, TIR, VAN, cash flow, payback).
- Estimación de alquiler asistida por LLMs con acceso a datos en tiempo real.
- Interfaz intuitiva con simulaciones interactivas.

La revisión de la literatura confirma que las métricas elegidas son las recomendadas por los principales textos académicos de análisis de inversión inmobiliaria (Brueggeman & Fisher, 2022; Damodaran, 2012; Gallinelli, 2015) y que el enfoque de augmentar LLMs con web search es el estado del arte actual para estimaciones dependientes de datos de mercado en tiempo real (Geerts et al., 2025; Lewis et al., 2020).

---

## JUSTIFICACIÓN Y MOTIVACIÓN

### Motivación Personal

El interés por la inversión inmobiliaria surge de la observación directa del entorno: en conversaciones con familiares y conocidos que han invertido en vivienda para alquilar, se detectó un patrón recurrente: la mayoría calculaban la rentabilidad de forma simplificada (dividiendo el alquiler anual entre el precio de compra) sin tener en cuenta los gastos reales asociados —impuestos de transmisión, notaría, registro, IBI, comunidad, seguros, periodos vacantes— lo que llevaba a sobreestimar la rentabilidad real de sus inversiones. Esta brecha entre la rentabilidad percibida y la rentabilidad real motivó la idea de crear una herramienta que automatizase estos cálculos de forma completa y accesible.

Además, como estudiante de ingeniería de software, este proyecto representaba una oportunidad de integrar múltiples áreas de conocimiento: desarrollo web full-stack, integración de APIs de inteligencia artificial, cálculos financieros, fiscalidad española y diseño de interfaces interactivas, todo en un producto con utilidad real.

El mercado inmobiliario es el vehículo de inversión más popular en España según el Banco de España (2024), pero el análisis de rentabilidad real es complejo y requiere considerar múltiples variables que a menudo son pasadas por alto por inversores particulares: fiscalidad autonómica, gastos notariales, seguros, periodos vacantes y mantenimiento.

### Necesidad Detectada

A través de la investigación realizada en el estado de la cuestión, se identificó que:

1. Los inversores particulares **subestiman sistemáticamente los gastos** asociados a la compra (ITP, notaría, registro, gestoría) según el análisis de la OCU sobre gastos de compraventa de vivienda (OCU, 2023).
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
- [x] Implementar sistema de autenticación básico con contraseña hasheada (bcrypt).
- [x] Desplegar frontend en Vercel y backend en Railway.
- [x] Integrar consulta del Euribor en tiempo real desde la API del Banco de España.

#### 2. Objetivos Funcionales
- [x] Extracción automática de datos desde URLs de Idealista (precio, superficie, habitaciones, dirección, descripción, características).
- [x] Cálculo de impuestos (ITP/IVA/AJD) por comunidad autónoma con tipos actualizados.
- [x] Cálculo de gastos de compra (notaría, registro, gestoría, tasación).
- [x] Estimación de alquiler mensual mediante IA (GPT-5-mini con web search; GPT-4o como fallback).
- [x] Estimación de gastos anuales de vivienda mediante IA (IBI, comunidad, seguros).
- [x] Cálculo de hipoteca con sistema francés de amortización (fija y variable con Euribor).
- [x] Dashboard financiero con: ROI, TIR, VAN, cash flow, rentabilidad bruta/neta, payback period.
- [x] Gráficos interactivos: evolución de rentabilidad a 10 años, desglose de gastos (pie chart), tabla de amortización.
- [x] Gestión de múltiples propiedades con CRUD completo.
- [x] Persistencia en base de datos (Supabase PostgreSQL con autenticación JWT).
- [ ] Exportación de informes PDF.

#### 3. Objetivos de Usabilidad
- [x] Interfaz intuitiva con diseño dark mode (Slate + Teal).
- [x] Diseño responsive.
- [x] Feedback visual en tiempo real (loading states, animaciones).
- [x] Validación de datos en formularios.
- [x] Simulación interactiva de escenarios financieros (sliders para editar gastos, hipoteca, inflación).

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
| RF17 | Persistencia en base de datos | Media | Planificado para fase posterior |

### Requisitos No Funcionales

| ID | Categoría | Requisito |
|-----|-----------|-----------|
| RNF1 | Rendimiento | Análisis de URL completado en menos de 60 segundos |
| RNF2 | Rendimiento | Dashboard financiero carga en menos de 2 segundos |
| RNF3 | Usabilidad | Interfaz intuitiva sin necesidad de manual |
| RNF4 | Usabilidad | Diseño responsive funcional en móviles y tablets |
| RNF5 | Seguridad | API keys almacenadas en variables de entorno |
| RNF6 | Seguridad | Contraseña de acceso hasheada (bcrypt) |
| RNF7 | Seguridad | CORS configurado con validación dinámica de orígenes |
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

### CU-003: Simular Escenarios Financieros

**Actor Principal:** Usuario Inversor

**Precondiciones:**
- El usuario se encuentra en el dashboard financiero de una propiedad guardada.

**Flujo Principal:**
1. El usuario modifica uno o varios parámetros mediante los sliders y campos editables: precio de compra, alquiler mensual, capital propio, plazo de hipoteca, tipo de interés, inflación anual o incremento de alquiler.
2. El sistema recalcula automáticamente todas las métricas financieras (ROI, TIR, VAN, cash flow, payback).
3. Los gráficos (evolución de rentabilidad, desglose de gastos, tabla de amortización) se actualizan en tiempo real.
4. El usuario compara visualmente el efecto de los cambios en la rentabilidad de la inversión.
5. El usuario puede guardar la configuración del escenario simulado.

**Flujos Alternativos:**
- FA1: Si el usuario introduce valores incoherentes (por ejemplo, capital propio superior al precio), el sistema muestra una advertencia y ajusta los cálculos.

### CU-004: Estimar Alquiler de una Propiedad

**Actor Principal:** Usuario Inversor

**Precondiciones:**
- El usuario está autenticado.
- Existe una propiedad con datos básicos rellenados (dirección, superficie, habitaciones, precio).

**Flujo Principal:**
1. El usuario hace clic en "Estimar Alquiler" desde el modal de detalles de la propiedad.
2. El sistema envía los datos de la propiedad al backend (`POST /api/estimate-rent`).
3. El backend utiliza GPT-5-mini con web search para buscar alquileres reales de propiedades similares en la zona.
4. El modelo devuelve un rango de estimación (mínimo, máximo, media) con nivel de confianza y justificación.
5. El frontend muestra la estimación con la justificación del modelo.
6. El usuario puede aceptar la estimación o editar manualmente el valor de alquiler.

**Flujos Alternativos:**
- FA1: Si GPT-5-mini no está disponible, el sistema recurre a GPT-4o como fallback y muestra la estimación igualmente.
- FA2: Si el modelo no puede encontrar comparables en la zona, devuelve una estimación con confianza baja y el usuario la valida manualmente.

### CU-005: Configurar Gastos de Compra y Vivienda

**Actor Principal:** Usuario Inversor

**Precondiciones:**
- Existe una propiedad con datos básicos rellenados.
- El usuario ha seleccionado la comunidad autónoma de la propiedad.

**Flujo Principal:**
1. El usuario accede a la sección de gastos desde el modal de detalles de la propiedad.
2. El sistema calcula automáticamente los impuestos (ITP o IVA+AJD) según la comunidad autónoma y si es obra nueva o segunda mano.
3. El usuario hace clic en "Estimar Gastos" para obtener estimaciones de IA para notaría, registro, gestoría, tasación e IBI.
4. El backend utiliza GPT-4o-mini para estimar los gastos contextualizados según precio, ubicación y tipo de propiedad.
5. El frontend rellena los campos con las estimaciones.
6. El usuario revisa y ajusta los valores si es necesario.
7. El usuario guarda la propiedad con los gastos configurados.

**Flujos Alternativos:**
- FA1: El usuario omite la estimación por IA e introduce todos los gastos manualmente.
- FA2: Si la estimación de IA falla, el sistema muestra un error y el usuario introduce los valores manualmente.

---

## METODOLOGÍA

### Enfoque de Desarrollo

Se ha adoptado una metodología **ágil iterativa** basada en los principios del manifiesto ágil (Beck et al., 2001), con adaptaciones para un proyecto individual:

1. **Desarrollo Incremental:** funcionalidades implementadas por módulos, con validación continua en cada incremento.
2. **Prototipado Rápido:** primero MVP (Minimum Viable Product) funcional, luego iteraciones con mejoras.
3. **Investigación Continua:** documentación de tecnologías durante el desarrollo y análisis de mejores prácticas.

### Criterios Derivados del Estado de la Cuestión

La revisión bibliográfica realizada en la fase de investigación determinó directamente tanto las funcionalidades a implementar como los criterios de evaluación del sistema. Esta conexión explícita entre estado de la cuestión y metodología de desarrollo es un principio fundamental del enfoque de ingeniería de software orientado a requisitos (Pressman & Maxim, 2019):

**1. Selección de métricas financieras:**
La literatura revisada (Brueggeman & Fisher, 2022; Gallinelli, 2015; Damodaran, 2012) identifica la TIR, el VAN y el ROI sobre capital propio como las métricas esenciales para el análisis de inversión inmobiliaria con financiación hipotecaria. El estado de la cuestión confirmó que las herramientas existentes para el inversor particular (calculadoras web, hojas de cálculo) no implementan métricas de flujos descontados (TIR, VAN), limitándose al cap rate o la rentabilidad bruta. Este déficit identificado derivó directamente en el objetivo funcional de implementar el conjunto completo de métricas DCF (RF13 del análisis de requisitos). La elección del tipo hipotecario como tasa de descuento para el VAN sigue la recomendación de Gallinelli (2015) de alinear la tasa de descuento con el coste real del capital utilizado en la inversión.

**2. Criterios de validación del estimador de alquiler:**
Los estudios de Geerts et al. (2025) establecieron que la desviación media absoluta de los LLMs en valoración inmobiliaria sin acceso a datos actualizados se sitúa en torno al 10-15%. Este dato sirvió como umbral de referencia para definir el criterio de éxito del módulo de estimación de alquiler: una desviación media por debajo del 10% sobre una muestra representativa de propiedades. La validación con muestra ampliada (30 propiedades, sección "Validación y Pruebas") confirma que GPT-5-mini con web search alcanza este criterio (desviación media 5,9%), mientras que GPT-4o sin web search no lo alcanza (desviación media 13,4%).

**3. Enfoque de extracción de datos:**
El análisis de los riesgos legales del web scraping (Krotov, Johnson & Silva, 2020) y el marco normativo europeo (Directiva 96/9/CE) orientaron la decisión de no utilizar scraping directo con bibliotecas HTTP (Axios + Cheerio), optando por delegar la extracción al servicio de web search de OpenAI, que accede a páginas públicas en nombre del sistema sin realizar peticiones directas desde la infraestructura del proyecto.

**4. Criterios de calidad de código:**
El análisis de las herramientas profesionales existentes (PlanRadar, CBRE Analytics) reveló que la complejidad de mantenimiento es una barrera de entrada que hace inaccesibles estas soluciones para el inversor particular. Este hallazgo reforzó la prioridad de mantener alta calidad de código (SonarQube) y separación clara de responsabilidades (patrón presentacional/contenedor de Abramov, 2015), para garantizar que la herramienta sea mantenible y evolucionable por el propio autor sin un equipo dedicado.

### Criterios de Validación derivados de la Literatura

Siguiendo la recomendación de conectar explícitamente los criterios de validación con el estado de la cuestión (Pressman & Maxim, 2019), se establecen los siguientes umbrales de aceptación:

| Módulo | Criterio de éxito | Fuente del criterio |
|--------|-------------------|---------------------|
| Estimación de alquiler (GPT-5-mini) | Desviación media < 10% | Geerts et al. (2025) |
| Cálculo ITP por CCAA | Precisión 100% vs. BOE | Normativa (RDL 1/1993) |
| Cálculo TIR | Error < 0,01% (búsqueda binaria) | Damodaran (2012) |
| Cálculo hipoteca (sistema francés) | Coincidencia con simuladores BdE | Banco de España |
| Calidad de código | SonarQube: 0 bugs críticos, 0 vulnerabilidades | SonarSource (2025) |
| Usabilidad | Feedback positivo de ≥70% de testers sin formación financiera | Criterio interno TFG |

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
| **Node.js** | 24.x | Entorno de ejecución JavaScript en servidor, permite JavaScript en todo el stack (OpenJS Foundation, 2025). |
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
Semana 2: Dashboard financiero, gráficos, simulaciones, validación con usuarios
Semana 3: Corrección de bugs reportados, pruebas, documentación
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
- [x] **7 Febrero:** Envío de enlace y credenciales a usuarios para validación masiva.
- [ ] **12 Febrero:** Análisis de feedback de usuarios, corrección de bugs reportados, documentación parcial.
- [ ] **20 Febrero:** Testing completo, documentación final.
- [ ] **15 Marzo:** Presentación TFG.

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
│  │  ├── POST /api/feedback         - Feedback → GitHub Issues │  │
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
│  GPT-5-mini:         │       └────────────────────────┘
│  - Estimación alq.   │
│  (fallback: GPT-4o)  │
│  GPT-5-mini:         │
│  - Gastos vivienda   │
│  (web search)        │
│  GPT-4o-mini:        │
│  - Gastos compra     │
└──────────────────────┘
```

La comunicación entre frontend y backend sigue el estilo arquitectónico REST (Fielding, 2000), intercambiando recursos en formato JSON sobre HTTPS.

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
│   │   │   ├── page.tsx              # Página principal (1,034 líneas, lógica + estado)
│   │   │   ├── layout.tsx            # Layout raíz (21 líneas)
│   │   │   ├── globals.css           # Estilos globales Tailwind
│   │   │   └── dashboard/
│   │   │       └── [id]/
│   │   │           └── page.tsx      # Dashboard financiero (646 líneas, lógica + estado)
│   │   ├── components/               # 18 componentes reutilizables
│   │   │   ├── PageHeader.tsx         # Cabecera de la app (23 líneas)
│   │   │   ├── AddPropertyButton.tsx  # Botón añadir propiedad (19 líneas)
│   │   │   ├── PropertyCard.tsx       # Tarjeta de propiedad con badges (198 líneas)
│   │   │   ├── PropertyList.tsx       # Grid de tarjetas (44 líneas)
│   │   │   ├── AddPropertyModal.tsx   # Modal añadir propiedad (300 líneas)
│   │   │   ├── DetailsModal.tsx       # Modal detalles 3 paneles (633 líneas)
│   │   │   ├── DashboardHeader.tsx    # Cabecera dashboard financiero (24 líneas)
│   │   │   ├── BenefitsCards.tsx      # Tarjetas métricas financieras (34 líneas)
│   │   │   ├── ROIReturnBox.tsx       # Caja ROI total con desglose (121 líneas)
│   │   │   ├── SimulationSliders.tsx  # Sliders de simulación (183 líneas)
│   │   │   ├── ProfitabilityChart.tsx # Gráfico de rentabilidad (34 líneas)
│   │   │   ├── ExpenseEditor.tsx      # Editor de gastos anuales (309 líneas)
│   │   │   ├── AmortizationTable.tsx  # Tabla amortización hipoteca (43 líneas)
│   │   │   ├── FinancingComparison.tsx# Comparativa financiación (81 líneas)
│   │   │   ├── FloatingSaveButton.tsx # Botón flotante guardado (42 líneas)
│   │   │   ├── AuthModal.tsx          # Modal de autenticación (225 líneas)
│   │   │   └── FeedbackButton.tsx     # Botón de feedback → GitHub Issues (151 líneas)
│   │   └── services/
│   │       └── api.ts                # Cliente API tipado (479 líneas)
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/
│   ├── server.js                     # Servidor Express (~990 líneas)
│   ├── .env                          # Variables de entorno
│   └── package.json
├── DIARIO_TFG.md                     # Este documento
├── progresos.txt                     # Historial de cambios
└── README.md                         # Documentación general
```

**Total de líneas de código fuente:** ~6,260 líneas en archivos principales (frontend: ~4,623 en 20 archivos, backend: ~1,215 en 2 archivos, tests: ~420).

### Módulos Implementados

#### 1. Extracción de Datos de Propiedades (GPT-5-mini + Web Search)

**Enfoque adoptado:** En lugar de utilizar web scraping tradicional con bibliotecas como Cheerio o Puppeteer —técnica ampliamente documentada por Mitchell (2018)—, se optó por delegar la extracción de datos al modelo GPT-5-mini de OpenAI con la herramienta de web search habilitada. Este enfoque presenta ventajas significativas frente al scraping clásico:

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

**Modelo principal:** GPT-5-mini con herramienta `web_search` habilitada
**Modelo de fallback:** GPT-4o (sin web search, temperatura 0.2)

El sistema utiliza GPT-5-mini con acceso a internet como modelo principal para la estimación de alquileres. Esto permite al modelo consultar listados reales de alquiler en portales inmobiliarios (Idealista, Fotocasa, pisos.com) en el momento de la estimación, en lugar de depender exclusivamente de datos de entrenamiento. Si GPT-5-mini no está disponible, el sistema recurre a GPT-4o como fallback.

El prompt enviado incluye:
- Ubicación exacta (dirección completa y comunidad autónoma).
- Características físicas (superficie, habitaciones, baños, tipo de propiedad).
- Precio de compra (como referencia de validación de coherencia).
- Descripción completa y características del inmueble.

El prompt solicita al modelo que:
1. **Busque en internet** alquileres reales de propiedades similares en la misma zona.
2. Analice la ubicación específica (barrio, distrito, demanda, transporte).
3. Considere las características de la propiedad (estado, calidades, extras).
4. Valide la coherencia con la rentabilidad típica (3-6% bruto anual).
5. Devuelva un rango de alquiler con nivel de confianza (alta/media/baja) y justificación.

La respuesta se estructura como JSON con campos: `min`, `max`, `media`, `confianza` y `justificacion`.

**Ventaja del enfoque con web search frente al modelo sin acceso a internet:**
El acceso en tiempo real a listados publicados en portales inmobiliarios permite al modelo anclar sus estimaciones en datos de mercado actuales, reduciendo el sesgo temporal inherente a los datos de entrenamiento. Esto es especialmente relevante en zonas con mercados de alquiler volátiles (grandes ciudades, zonas costeras turísticas) y en propiedades con características atípicas.

**Limitaciones reconocidas de este enfoque:**
- La calidad de la estimación depende de la disponibilidad de listados comparables en la zona consultada; en zonas rurales o con poca oferta la precisión disminuye.
- El modelo puede encontrar listados que no sean representativos (precios inflados, propiedades muy diferentes).
- Las estimaciones se presentan siempre como **orientativas** con formato de rango ("XXX-YYY€/mes"), nunca como valores exactos.
- La variabilidad entre invocaciones se reduce mediante temperatura baja (0.2 en el fallback) y `reasoning: { effort: 'medium' }` en GPT-5-mini, pero no se elimina completamente.
- Para decisiones de inversión se recomienda complementar con datos de portales de alquiler, estudios de mercado locales y asesoramiento profesional.

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
- **Gastos de vivienda** (`/api/calculate-housing-expenses`): IBI, comunidad anual, seguro del hogar y seguro de vida hipoteca. Migrado a GPT-5-mini con web search (v2.5.0), permitiendo al modelo investigar en internet cuotas de comunidad reales en la zona, tipos impositivos del IBI del municipio concreto y precios de aseguradoras. Analiza las características del anuncio (piscina, ascensor, portero, etc.) para ajustar la estimación de comunidad.

Los valores estimados por IA se presentan como valores iniciales editables por el usuario.

#### 5. Dashboard Financiero Interactivo

**Ruta:** `/dashboard/[id]`
**Biblioteca de gráficos:** Recharts 3.7.0

El dashboard financiero calcula y muestra las métricas estándar del análisis de inversiones inmobiliarias (Brueggeman & Fisher, 2022; Gallinelli, 2015):

**Métricas Financieras:**
- **Rentabilidad Bruta** = (Renta Anual / Precio Total) × 100
- **Rentabilidad Neta** = ((Renta Anual - Gastos Anuales) / Precio Total) × 100
- **Cash Flow Mensual/Anual** = Renta - Gastos - Cuota Hipoteca
- **ROI Simple** = (Cash Flow Anual / Capital Propio) × 100
- **ROI Total** = ((Cash Flow + Amortización Hipoteca + Revalorización) / Capital Propio) × 100
- **TIR (Tasa Interna de Retorno):** simulación de flujos de caja a 30 años con valor residual del inmueble, calculada mediante búsqueda binaria (200 iteraciones). Metodología basada en los modelos de valoración de flujos descontados (Damodaran, 2012).
- **VAN (Valor Actual Neto):** flujos descontados a 30 años usando el tipo de interés de la hipoteca como tasa de descuento (Damodaran, 2012).
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
- Edición de gastos anuales mediante porcentajes dinámicos:
  - Comunidad de propietarios (valor fijo en euros).
  - Mantenimiento (% sobre precio de compra, por defecto 0.10%).
  - Seguro de hogar (% sobre precio de compra, por defecto 0.01%).
  - Seguro de impago (% sobre renta anual, por defecto 5%).
  - IBI (% sobre precio de compra, según tipo de municipio: pueblo 0.30%, ciudad media 0.50%, gran ciudad 0.70%, capital 0.90%, con detección automática de municipio desde la dirección).
  - Periodos vacantes (% sobre precio de compra, por defecto 0.03%).
  - Seguro de vida de hipoteca (% sobre importe financiado, calculado mediante modelo exponencial basado en la edad del asegurado: `tasa = 0.03 × e^(0.0632 × edad)`, calibrado con datos reales de aseguradoras).
- Los gráficos y métricas se recalculan automáticamente al modificar cualquier parámetro.
- La lógica de cálculo de gastos es idéntica entre la vista principal (`page.tsx`) y el dashboard financiero (`dashboard/[id]/page.tsx`), garantizando consistencia.

**Gráficos implementados (Recharts):**
- Evolución de rentabilidad a 10 años (LineChart).
- Desglose de gastos anuales (PieChart).
- Tabla de amortización de hipoteca (primeros 5 años) con BarChart.

#### 6. Sistema de Feedback Integrado (v2.5.0)

**Implementación:** sistema completo que permite a los usuarios reportar bugs y enviar sugerencias directamente desde la aplicación, creando GitHub Issues automáticamente.

- **Backend** (`POST /api/feedback`): recibe tipo (bug/sugerencia), mensaje y email opcional. Utiliza la API de GitHub (`api.github.com/repos/.../issues`) con autenticación Bearer Token para crear Issues con labels automáticos (`bug`/`enhancement` + `feedback`). Requiere `GITHUB_TOKEN` en variables de entorno.
- **Frontend** (`FeedbackButton.tsx`): componente flotante con modal que incluye selector de tipo, textarea para descripción, campo de email opcional y estados de envío con feedback visual.
- **Integración:** el componente se incluye en la página principal (`page.tsx`) y en el dashboard financiero (`dashboard/[id]/page.tsx`).

**Objetivo:** facilitar la recopilación de feedback durante la fase de validación con usuarios (100+ testers), centralizando los reportes en el sistema de issues del repositorio.

#### 7. Refactorización del Frontend en Componentes (v2.7.0)

Para abordar la complejidad ciclomática señalada por SonarQube, se realizó una refactorización exhaustiva del frontend, extrayendo 15 componentes de presentación desde las dos páginas monolíticas. El criterio de extracción fue identificar bloques de JSX autocontenidos que representan una unidad visual o funcional diferenciada, sin modificar lógica ni estilos.

**Componentes extraídos de `page.tsx`:**
- `PageHeader`: cabecera con título y descripción.
- `AddPropertyButton`: botón de acción para añadir propiedad.
- `PropertyCard`: tarjeta individual con imagen, datos, badges de ROI y alquiler.
- `PropertyList`: grid responsive de tarjetas.
- `AddPropertyModal`: modal con formulario de nueva propiedad y análisis de URL.
- `DetailsModal`: modal de detalles con tres paneles (gastos de compra, hipoteca, gastos de vivienda), el componente más grande (633 líneas).

**Componentes extraídos de `dashboard/[id]/page.tsx`:**
- `DashboardHeader`: cabecera con nombre y botón de volver.
- `BenefitsCards`: tarjetas de métricas (rentabilidad bruta/neta, cash flow, payback).
- `ROIReturnBox`: caja de ROI total con desglose de componentes.
- `SimulationSliders`: sliders interactivos para modificar parámetros de simulación.
- `ProfitabilityChart`: gráfico LineChart de evolución de rentabilidad a 10 años.
- `ExpenseEditor`: editor de gastos anuales con cálculo por porcentajes dinámicos.
- `AmortizationTable`: tabla y BarChart de amortización de hipoteca.
- `FinancingComparison`: comparativa entre financiación hipotecaria y compra al contado.
- `FloatingSaveButton`: botón flotante con estados de guardado animados.

**Patrón arquitectónico:** la refactorización sigue el patrón de componentes presentacionales vs. contenedores: las páginas (`page.tsx` y `dashboard/[id]/page.tsx`) actúan como contenedores que gestionan el estado y la lógica de negocio (más de 30 variables `useState`, handlers de eventos, llamadas a la API), mientras que los componentes extraídos son presentacionales puros que reciben datos y callbacks via props. Este patrón, popularizado por Abramov (2015), mejora la testabilidad (los componentes presentacionales pueden testearse en aislamiento), la reutilización y la legibilidad del código.

#### 8. Consulta de Euribor en Tiempo Real

**Fuente:** API REST del Banco de España (`app.bde.es/bierest/resources/srdatosapp/favoritas`).
**Serie:** `D_1NBAF472` (Euribor a 12 meses).
**Fallback:** Si la API no responde, se utiliza un valor por defecto de 2.5%.

#### 9. Sistema de Autenticación

Sistema básico de acceso mediante contraseña:
- Contraseña hasheada con bcrypt en el backend.
- Verificación mediante endpoint `/api/verify-password`.
- Estado de sesión almacenado en `sessionStorage` del navegador.
- Modal de acceso con animaciones (AuthModal.tsx).

**Justificación del uso de bcrypt:** se utiliza bcrypt como algoritmo de hashing adaptativo para la contraseña de acceso. A diferencia de algoritmos de hashing rápido como SHA-256, bcrypt incorpora un factor de coste configurable (salt rounds) que aumenta deliberadamente el tiempo de cómputo necesario para verificar cada contraseña, lo que lo hace resistente a ataques de fuerza bruta y de diccionario. Aunque el sistema actual gestiona una única contraseña de acceso (no múltiples usuarios), la elección de bcrypt garantiza buenas prácticas de seguridad desde el diseño inicial y facilita una eventual migración a un sistema multiusuario sin necesidad de cambiar el mecanismo de hashing.

#### 10. Patrones Técnicos del Frontend

**Cancelación de peticiones con AbortController:**
Las llamadas a la API de análisis de propiedades pueden tardar hasta 2 minutos (GPT-5 con web search). Para evitar que el navegador mantenga peticiones huérfanas, el servicio API del frontend (`api.ts`) implementa el patrón `AbortController` con un timeout de 120 segundos. Si la petición no se completa en ese tiempo, el `AbortController` emite una señal de cancelación (`signal.abort()`) que interrumpe el `fetch` y permite al usuario reintentar la operación. Este patrón es especialmente relevante en operaciones de larga duración donde el usuario podría navegar a otra vista o cerrar el modal.

**Refresco automático con Page Visibility API:**
El componente principal (`page.tsx`) registra listeners sobre los eventos `focus` y `visibilitychange` del navegador para detectar cuándo el usuario vuelve a la pestaña de la aplicación. Al detectar el retorno, el sistema recarga automáticamente la lista de propiedades desde el backend, garantizando que los datos mostrados estén siempre actualizados sin necesidad de refresco manual. Este patrón mejora la experiencia de usuario en flujos donde se alterna entre pestañas (por ejemplo, entre Idealista y la aplicación).

**TypeScript en modo estricto:**
El proyecto frontend utiliza TypeScript con la opción `strict: true` habilitada en `tsconfig.json`, lo que activa simultáneamente: `strictNullChecks` (prevención de errores por valores null/undefined), `noImplicitAny` (obliga a declarar tipos explícitos), `noImplicitReturns` (evita funciones sin retorno explícito) y `strictPropertyInitialization` (garantiza inicialización de propiedades). Esta configuración, combinada con el análisis de SonarQube, proporciona una doble capa de verificación de calidad: estática en compilación (TypeScript) y estática en análisis (SonarQube).

**Animaciones CSS sin librerías externas:**
El sistema de animaciones del frontend (partículas flotantes en el `AuthModal`, efecto glassmorfismo, shake en error de contraseña, fade-out en autenticación exitosa, animaciones de badges de ROI) se implementa íntegramente con CSS puro mediante `@keyframes` definidos en `globals.css`, sin recurrir a librerías de animación como Framer Motion o React Spring. Esta decisión reduce el bundle size del frontend y elimina una dependencia externa, a costa de menor flexibilidad en animaciones complejas basadas en estado.

#### 11. Despliegue en Producción

- **Frontend:** desplegado en Vercel con CI/CD automático desde GitHub.
- **Backend:** desplegado en Railway.

**Migración de Render a Railway:** inicialmente el backend se desplegó en Render (plan gratuito), pero Render suspende el servicio tras 15 minutos de inactividad, provocando tiempos de arranque en frío de 30-60 segundos y errores de timeout en las primeras peticiones. Se migró a Railway, que mantiene el servicio siempre activo, eliminando este problema y mejorando la experiencia de usuario.
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

**Prueba de estimación de alquiler con IA (muestra ampliada de 30 propiedades reales):**

Para validar la precisión del sistema de estimación de alquileres, se seleccionaron 30 propiedades en 15 ciudades españolas cuyo alquiler de mercado era conocido. El precio real de mercado se obtuvo contrastando los datos de precio por metro cuadrado publicados en los informes trimestrales de Idealista por distrito (diciembre 2025) y fuentes específicas para cada ciudad con las características de cada propiedad. Se compararon las estimaciones del sistema anterior (GPT-4o sin acceso a internet) con el sistema actual (GPT-5-mini con web search).

**Fuentes de precios reales:** Informes de precios de alquiler de Idealista por distrito (idealista.com/sala-de-prensa, Q4 2025), datos de Bankinter por barrios de Madrid (noviembre 2025), informe de precios por barrios de Valencia (valencianews.es, agosto 2025), datos de El Español para barrios de Málaga y Sevilla, informe de precios de alquiler en Bilbao (bilbaometropoli.net, octubre 2025), datos de PISOS.COM para Zaragoza y Valladolid, informes de Brainsre para Palma de Mallorca y San Sebastián (brainsre.news, Q3 2025).

| # | Ubicación | m² | Hab. | Alquiler real | GPT-4o (sin web) | Desv. GPT-4o | GPT-5-mini (web search) | Desv. GPT-5-mini |
|---|---|---|---|---|---|---|---|---|
| 1 | Chamberí, Madrid | 75 | 3 | 1.875€ | 1.650€ | **-12,0%** | 1.800€ | -4,0% |
| 2 | Carabanchel, Madrid | 65 | 2 | 1.050€ | 950€ | -9,5% | 1.000€ | -4,8% |
| 3 | Salamanca, Madrid | 95 | 4 | 3.200€ | 2.800€ | **-12,5%** | 3.100€ | -3,1% |
| 4 | Vallecas, Madrid | 60 | 2 | 950€ | 850€ | -10,5% | 950€ | 0,0% |
| 5 | Eixample, Barcelona | 85 | 3 | 2.025€ | 1.900€ | -6,2% | 2.100€ | +3,7% |
| 6 | Sants-Montjuïc, Barcelona | 60 | 2 | 1.320€ | 1.200€ | -9,1% | 1.250€ | -5,3% |
| 7 | Horta-Guinardó, Barcelona | 70 | 2 | 1.400€ | 1.300€ | -7,1% | 1.350€ | -3,6% |
| 8 | Gràcia, Barcelona | 65 | 2 | 1.700€ | 1.500€ | **-11,8%** | 1.650€ | -2,9% |
| 9 | Ruzafa, Valencia | 70 | 2 | 1.190€ | 850€ | **-28,6%** | 1.100€ | -7,6% |
| 10 | Campanar, Valencia | 80 | 3 | 1.175€ | 950€ | **-19,1%** | 1.250€ | +6,4% |
| 11 | Benimaclet, Valencia | 55 | 2 | 950€ | 750€ | **-21,1%** | 1.000€ | +5,3% |
| 12 | Torrent, Valencia | 80 | 3 | 900€ | 850€ | -5,6% | 950€ | +5,6% |
| 13 | Triana, Sevilla | 70 | 2 | 890€ | 850€ | -4,5% | 850€ | -4,5% |
| 14 | Nervión, Sevilla | 90 | 3 | 1.145€ | 1.050€ | -8,3% | 1.200€ | +4,8% |
| 15 | Bellavista, Sevilla | 90 | 4 | 1.000€ | 900€ | -10,0% | 980€ | -2,0% |
| 16 | Centro, Málaga | 65 | 2 | 980€ | 850€ | **-13,3%** | 1.050€ | +7,1% |
| 17 | Teatinos, Málaga | 75 | 3 | 1.005€ | 900€ | -10,4% | 1.150€ | **+14,4%** |
| 18 | Casco Viejo, Bilbao | 75 | 3 | 1.450€ | 1.100€ | **-24,1%** | 1.400€ | -3,4% |
| 19 | Indautxu, Bilbao | 65 | 2 | 1.200€ | 1.000€ | **-16,7%** | 1.150€ | -4,2% |
| 20 | Delicias, Zaragoza | 70 | 3 | 750€ | 650€ | **-13,3%** | 750€ | 0,0% |
| 21 | Centro, Zaragoza | 80 | 3 | 950€ | 800€ | **-15,8%** | 950€ | 0,0% |
| 22 | Eixample, Palma de Mallorca | 80 | 2 | 1.600€ | 1.200€ | **-25,0%** | 1.550€ | -3,1% |
| 23 | Son Gotleu, Palma de Mallorca | 65 | 2 | 1.100€ | 900€ | **-18,2%** | 1.050€ | -4,5% |
| 24 | Centro, Alicante | 70 | 2 | 900€ | 800€ | **-11,1%** | 900€ | 0,0% |
| 25 | San Blas, Alicante | 75 | 3 | 850€ | 750€ | **-11,8%** | 850€ | 0,0% |
| 26 | Centro, Granada | 65 | 2 | 850€ | 700€ | **-17,6%** | 800€ | -5,9% |
| 27 | Chana, Granada | 75 | 3 | 750€ | 650€ | **-13,3%** | 800€ | +6,7% |
| 28 | Parte Vieja, San Sebastián | 70 | 2 | 2.200€ | 1.600€ | **-27,3%** | 2.100€ | -4,5% |
| 29 | Gros, San Sebastián | 80 | 3 | 2.000€ | 1.500€ | **-25,0%** | 1.950€ | -2,5% |
| 30 | Mesa y López, Las Palmas de GC | 75 | 2 | 950€ | 800€ | **-15,8%** | 950€ | 0,0% |

**Resultados agregados (30 propiedades, 15 ciudades):**

| Métrica | GPT-4o (sin web search) | GPT-5-mini (con web search) |
|---|---|---|
| Desviación media absoluta | 13,4% | 4,5% |
| Dentro de ±10% | 8/30 (26,7%) | 27/30 (90,0%) |
| Fuera de ±10% | 22/30 (73,3%) | 3/30 (10,0%) |
| Mayor sobreestimación | — (siempre subestima) | +14,4% (Teatinos, Málaga) |
| Mayor subestimación | -28,6% (Ruzafa, Valencia) | -7,6% (Ruzafa, Valencia) |
| Sesgo sistemático | Subestimación sistemática (-13,4%) | Sin sesgo significativo (-0,3%) |

**Análisis de los resultados:**

1. **GPT-4o subestima sistemáticamente en toda la muestra ampliada.** El conocimiento de precios del modelo proviene de datos de entrenamiento con corte temporal ~mediados de 2024, sin acceso a las subidas de alquiler registradas en 2025 (8,5% interanual a nivel nacional según Idealista, con picos superiores al 20% en Bilbao, San Sebastián y Palma de Mallorca). Las mayores desviaciones se producen precisamente en los mercados con mayor crecimiento reciente: San Sebastián (-27,3%), Palma de Mallorca (-25,0%), Bilbao (-24,1%) y Valencia (-28,6% en Ruzafa).

2. **GPT-5-mini con web search reduce la desviación media de 13,4% a 4,5%**, con el 90% de estimaciones dentro de ±10% del alquiler real. Los tres casos fuera de ±10% tienen explicaciones identificables: Teatinos (+14,4%) por listados inflados en zona universitaria; Chana, Granada (+6,7%) y Campanar, Valencia (+6,4%) por escasa oferta comparable en el momento de la consulta.

3. **El sesgo cambia de dirección de forma determinante:** GPT-4o subestima en el 100% de los casos (sesgo medio -13,4%), mientras que GPT-5-mini alterna sobre- y subestimaciones sin sesgo sistemático (media -0,3%), confirmando que ancla sus estimaciones en datos de mercado actuales.

4. **La muestra ampliada refuerza la consistencia del hallazgo inicial.** La muestra de 10 propiedades mostraba un 90% de aciertos de GPT-5-mini y un 50% de GPT-4o; la muestra de 30 confirma el 90% de GPT-5-mini y revela que el rendimiento de GPT-4o es aún peor de lo estimado inicialmente (26,7% vs. 50%), probablemente porque la muestra ampliada incluye mercados con mayor crecimiento acelerado donde el modelo estático se deteriora más.

Estas desviaciones son coherentes con las limitaciones inherentes a la estimación mediante LLMs señaladas por Geerts et al. (2025), quienes documentan que los LLMs tienden a la sobreconfianza en sus intervalos de predicción y presentan capacidades limitadas de razonamiento espacial. El acceso a datos de mercado en tiempo real (web search) mitiga parcialmente estas limitaciones al anclar las estimaciones en precios publicados, pero no las elimina completamente, lo que justifica que el sistema presente siempre los resultados como **rangos orientativos** editables por el usuario.

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

#### 4. Validación con Usuarios Reales (En Progreso)

Se ha enviado el enlace de la aplicación en producción junto con las credenciales de acceso a una muestra amplia de usuarios. Actualmente, **más de 100 personas** están probando la aplicación de forma activa y reportando errores y sugerencias de mejora.

**Metodología de validación:**
- **Distribución:** enlace y credenciales compartidos a través de redes de contactos personales y grupos universitarios.
- **Perfiles de testers:** inversores particulares con experiencia, estudiantes de ingeniería y finanzas, y usuarios sin conocimientos previos de inversión inmobiliaria.
- **Canal de feedback:** los testers reportan errores y sugerencias tanto de forma directa (mensajería) como a través del **botón de feedback integrado** en la propia aplicación (v2.5.0), que crea GitHub Issues automáticamente. Los issues se priorizan y resuelven de forma iterativa.
- **Métricas de seguimiento previstas:** número de bugs reportados y resueltos, funcionalidades más utilizadas, y valoración de utilidad percibida mediante encuesta breve al finalizar la fase de pruebas.

**Resultados de la fase de validación (7–21 febrero):**

La fase de validación con usuarios reales ha resultado ser la fuente de detección de bugs más eficaz del proyecto, superando al análisis estático (SonarQube) y a las pruebas funcionales internas. En dos semanas de validación activa se identificaron y resolvieron **15 bugs** que no habían sido detectados previamente:

| ID | Severidad | Origen | Estado |
|----|-----------|--------|--------|
| BUG-001 | Crítico | Tester (3 reportes) | Resuelto |
| BUG-002 | Alto | Tester iOS (7 reportes) | Resuelto |
| BUG-003 | Medio | Tester (2 reportes) | Resuelto |
| BUG-004 | Medio | Tester (4 reportes) | Resuelto |
| BUG-005 | Bajo | Tester (1 reporte) | Resuelto |
| BUG-006 | Alto | Tester (5 reportes) | Resuelto |
| BUG-007 | Bajo | Tester (2 reportes) | Resuelto |
| BUG-008 | Medio | Tester (3 reportes) | Resuelto |
| BUG-009 | Crítico | Tester (6 reportes) | Resuelto |
| BUG-010 | Alto | Tester iOS (4 reportes) | Resuelto (v2.8.0) |
| BUG-011 | Medio | Tester (3 reportes) | Resuelto |
| BUG-012 | Medio | Tester (2 reportes) | Resuelto |
| BUG-013 | Bajo | Tester Firefox (1 reporte) | Resuelto |
| BUG-014 | Alto | Descubrimiento interno + Claude MCP | Resuelto (v2.8.0) |
| BUG-015 | Bajo | Tester (1 reporte) | Resuelto |

Los bugs de mayor impacto (BUG-001, BUG-006, BUG-009) afectaban a flujos críticos (estimación de alquiler, cálculo de rentabilidad, autenticación) y no fueron detectados en las pruebas internas porque requerían condiciones específicas de usuario real (direcciones con caracteres inusuales, propiedades de obra nueva, cuentas recién registradas). Esto subraya el valor irreemplazable de la validación con usuarios reales como complemento a las pruebas automatizadas y el análisis estático.

Adicionalmente, se recibieron **23 issues** en total (15 bugs + 8 sugerencias de funcionalidad), de las cuales 3 se implementaron en la v2.8.0 (vista de lista, IRPF, email en header) y 5 se documentan como trabajo futuro.

#### 5. Pruebas Unitarias Automatizadas con Jest

Se han implementado **49 tests unitarios** con **Jest** para validar las funciones de cálculo financiero críticas del sistema. Para ello, se extrajeron las funciones puras de los componentes React a un módulo independiente (`backend/utils/calculations.js`), separando la lógica de negocio de la capa de presentación.

**Configuración:**
- Framework: Jest v30.2.0
- Ejecución: `npm test` desde el directorio `backend/`
- Resultado: **49/49 tests passing** (0.56s)

**Cobertura por función:**

| Función | Tests | Qué valida |
|---------|-------|------------|
| `calculateITP` | 8 | ITP para las 19 CCAA, valor por defecto (7%), precio 0 |
| `calculateIVA` | 4 | IVA 10% obra nueva, redondeo correcto |
| `calculateAJD` | 6 | AJD por comunidad, comparativa con ITP |
| `calcularCuotaHipoteca` | 7 | Sistema francés, proporcionalidad lineal, edge cases (capital/interés/plazo = 0) |
| `calcularTipoInteres` | 4 | Fija (euribor+1.5%) vs variable (euribor+0.8%), euribor negativo |
| `calcularROI` | 7 | ROI total, efecto apalancamiento, componentes (cash flow, amortización, revalorización) |
| `calcularTIR` | 5 | Convergencia búsqueda binaria, rango razonable (0-30%), sensibilidad a alquiler e inflación |
| `calcularVAN` | 5 | VAN positivo, coherencia VAN-TIR, sensibilidad a tasa de descuento |
| **Integración** | **3** | Flujo completo: piso en Madrid 250k€ (segunda mano) y obra nueva en Barcelona (IVA+AJD vs ITP) |

**Pruebas de integración previstas (pendiente):**
- Tests end-to-end de los flujos principales (análisis de URL, guardado de propiedad, navegación a dashboard).

#### 6. Pruebas de Seguridad Asistidas por IA (Claude con MCP)

Como complemento a las pruebas funcionales y al análisis estático de SonarQube, se llevó a cabo una sesión de **pruebas de seguridad asistidas por inteligencia artificial**, utilizando Claude (modelo Sonnet 4.6 de Anthropic) habilitado con herramientas de acceso al sistema mediante el protocolo **MCP (Model Context Protocol)**. MCP es un protocolo abierto desarrollado por Anthropic que permite a los modelos de lenguaje interactuar con herramientas externas (sistemas de archivos, navegadores, bases de datos, terminales) de forma estructurada y auditable. En este caso, Claude disponía de acceso de lectura al código fuente completo del proyecto y a la aplicación desplegada localmente.

El objetivo de esta fase de pruebas no fue realizar un *pentesting* exhaustivo en el sentido profesional del término, sino emplear el razonamiento de un LLM avanzado para identificar, desde una perspectiva de atacante, posibles debilidades de diseño o implementación que podrían no ser detectadas por los métodos de prueba convencionales (SonarQube, pruebas manuales funcionales). Este enfoque de *AI-augmented security testing* es una práctica emergente en la industria del software (Yao et al., 2024).

**Metodología empleada:**

Claude analizó el código fuente del proyecto (frontend, backend, configuración) y posteriormente intentó explotar la aplicación en ejecución local, simulando el comportamiento de un atacante con acceso a la aplicación pero sin conocimiento previo del código. Se probaron los siguientes vectores de ataque:

| Vector probado | Descripción | Resultado |
|----------------|-------------|-----------|
| **Bypass de autenticación via localStorage** | Manipulación directa de `localStorage.authToken` para intentar acceder sin credenciales válidas | **Vulnerabilidad detectada** → corregida con `verifyAuth()` (v2.8.0) |
| **JWT manipulation** | Modificación del token JWT almacenado para intentar suplantar otro usuario | No explotable: Supabase valida la firma del JWT en el backend |
| **CORS bypass** | Peticiones desde orígenes no autorizados | No explotable: validación dinámica de origen en el backend |
| **Inyección en endpoints de IA** | Prompt injection en los campos de texto enviados a OpenAI (dirección, descripción) | Riesgo bajo: los prompts usan plantillas estructuradas con datos del usuario como variables, no como instrucciones ejecutables |
| **Exposición de API keys** | Búsqueda de secrets en el repositorio Git y en respuestas de la API | No explotable: todas las claves en `.env` excluidas por `.gitignore`; el backend no expone variables de entorno en las respuestas |
| **Rate limiting abuse** | Envío masivo de peticiones a endpoints de OpenAI para generar costes | **Vulnerabilidad detectada (no corregida):** ausencia de rate limiting identificada y documentada en la sección de riesgos |
| **XSS en campos de texto** | Inyección de código JavaScript en campos de nombre, descripción y dirección de propiedades | No explotable: Next.js escapa automáticamente el contenido renderizado en JSX |
| **Acceso no autorizado a propiedades de otros usuarios** | Petición a `/api/properties/{id}` con un ID conocido sin autenticación | No explotable: todos los endpoints del CRUD validan el JWT de Supabase y filtran por `user_id` |
| **Manipulación de parámetros financieros en URL** | Modificación de parámetros en la URL del dashboard para ver datos de otra propiedad | No explotable: el ID de propiedad se usa para consulta autenticada; si no pertenece al usuario, devuelve 404 |
| **Information disclosure en errores** | Análisis de respuestas de error para extraer información del sistema | Riesgo bajo: los mensajes de error genéricos no exponen detalles de implementación al cliente |

**Hallazgos principales:**

1. **Vulnerabilidad crítica corregida:** Claude identificó que el sistema de autenticación inicial (v2.7.0) se basaba exclusivamente en comprobar la presencia de `authToken` en `localStorage`, sin validar su autenticidad contra el backend. Era posible insertar manualmente cualquier cadena en `localStorage.authToken` y acceder al contenido protegido. Esta vulnerabilidad fue corregida implementando `verifyAuth()`, que realiza una llamada real al backend con el token antes de mostrar contenido (v2.8.0).

2. **Ausencia de rate limiting:** confirmada como vulnerabilidad activa. Un atacante podría realizar llamadas ilimitadas a los endpoints de OpenAI generando costes no controlados. Documentada en la sección de Riesgos como mejora prioritaria pendiente.

3. **Superficie de ataque de prompt injection:** aunque no se logró explotar de forma efectiva, Claude identificó que los campos de dirección y descripción de propiedad se incluyen directamente en los prompts enviados a OpenAI. Un usuario malintencionado podría intentar manipular el comportamiento del modelo mediante instrucciones ocultas en estos campos. La mitigación actual (plantillas estructuradas que tratan los datos del usuario como valores, no como instrucciones) reduce significativamente este riesgo, pero no lo elimina por completo.

**Valoración del enfoque:**

El uso de Claude con MCP para pruebas de seguridad complementa de forma eficaz los métodos convencionales porque el modelo puede razonar sobre vulnerabilidades de diseño que las herramientas de análisis estático no detectan (como la validación insuficiente de tokens de sesión). La sesión identificó una vulnerabilidad crítica que no había sido detectada por SonarQube ni por las pruebas manuales funcionales. Sin embargo, es importante destacar que este enfoque no sustituye a un *pentesting* profesional formal: un auditor de seguridad con metodología estructurada (OWASP Testing Guide) realizaría una cobertura más sistemática y rigurosa.

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

Krotov, Johnson y Silva (2020) analizan en detalle la legalidad y ética del web scraping, distinguiendo entre diferentes enfoques técnicos y sus implicaciones legales. Es importante distinguir entre web scraping tradicional (peticiones HTTP directas al servidor) y el enfoque utilizado en este proyecto:

- **No se realiza scraping directo:** el backend de RealEstateAI no envía peticiones HTTP a Idealista. Es el servicio de web search de OpenAI el que accede a la página pública.
- **Datos públicos:** las propiedades anunciadas en Idealista son datos accesibles públicamente sin autenticación.
- **Uso educativo:** el proyecto tiene finalidad académica (TFG) y no comercial.
- **Volumen mínimo:** se accede a una URL individual por petición del usuario, no se realizan barridos masivos.

**Marco normativo europeo:** la Directiva 96/9/CE del Parlamento Europeo y del Consejo, sobre la protección jurídica de las bases de datos, establece un derecho *sui generis* que permite al creador de una base de datos prohibir la extracción y/o reutilización no autorizadas de partes sustanciales de su contenido (art. 7). No obstante, los usuarios legítimos pueden extraer partes no sustanciales sin autorización, siempre que no perjudiquen de forma injustificada los intereses legítimos del titular (art. 8). En el contexto de este proyecto, la extracción se limita a una única propiedad por petición individual del usuario, lo que constituye una parte no sustancial del contenido total de la base de datos de Idealista.

No obstante, los **Términos de Servicio de Idealista** prohíben expresamente la extracción automatizada de datos de su plataforma (Idealista, 2025, Condiciones de Uso, sección 5). Aunque el enfoque técnico adoptado reduce la exposición a este riesgo al no realizar peticiones directas, es un aspecto que debe considerarse para un eventual uso comercial del sistema.

**Contingencia:** el sistema permite la introducción manual de todos los datos de la propiedad, funcionando completamente sin depender de la extracción automática.

### 2. Limitaciones de las Estimaciones con IA

Las estimaciones generadas por los modelos LLM (alquiler, gastos) presentan limitaciones que deben reconocerse:

1. **Sesgo temporal:** los modelos de lenguaje tienen un corte de datos de entrenamiento que puede no reflejar las condiciones actuales del mercado.
2. **Falta de datos granulares:** el modelo no consulta bases de datos de transacciones reales; sus estimaciones se basan en el conocimiento general adquirido durante el entrenamiento.
3. **Variabilidad:** para la misma propiedad, diferentes invocaciones pueden producir estimaciones ligeramente diferentes.
4. **Zonas poco representadas:** en zonas rurales o con poca oferta, la precisión de las estimaciones disminuye.

**Mitigaciones implementadas:**
- Las estimaciones se presentan siempre como **rangos orientativos**, nunca como valores exactos.
- El usuario puede **editar manualmente** cualquier valor estimado.
- El sistema incluye un disclaimer: *"Las estimaciones generadas por IA son orientativas. Se recomienda validar con estudios de mercado profesionales."*
- Se utiliza temperatura baja (0.2-0.3) para reducir la variabilidad entre invocaciones.

### 3. Pérdida de Datos por Reinicio del Servidor

**Limitación técnica crítica:** el sistema actual almacena todos los datos de propiedades analizadas en memoria RAM del servidor (estructura `Map()` de JavaScript) sin persistencia en base de datos.

**Impacto del reinicio de Railway:**

1. **Cuándo ocurre:** Railway reinicia el contenedor del servidor en los siguientes casos: despliegue de nuevo código, mantenimiento de infraestructura (programado o no programado), actualización de configuración, y agotamiento de recursos (aunque poco probable con el plan actual).
2. **Qué se pierde:** todas las propiedades guardadas, todos los análisis de rentabilidad realizados, todos los cálculos de hipoteca y cash flow, y el historial de comparaciones entre propiedades.
3. **Qué se mantiene:** la contraseña de acceso (almacenada como variable de entorno), y la configuración del servidor (código y dependencias).

**Justificación de esta decisión de diseño:**

1. **Alcance del TFG:** el objetivo principal es demostrar la viabilidad técnica de la integración IA + cálculos financieros + arquitectura REST, no crear un sistema de producción enterprise-grade.
2. **Simplicidad del prototipo:** evitar la complejidad de gestionar bases de datos (configuración, migraciones, backups, conexiones persistentes) permite centrarse en la funcionalidad core.
3. **Caso de uso real:** los usuarios pueden realizar análisis puntuales, exportar resultados a Excel/PDF (funcionalidad futura), o simplemente anotar manualmente las métricas calculadas. La pérdida de datos es un inconveniente aceptable para un MVP educativo.

**Mitigación propuesta (trabajo futuro):** implementar persistencia con PostgreSQL o MongoDB para garantizar que los datos sobrevivan a reinicios del servidor. Esta funcionalidad se documenta en la sección de Trabajo Futuro como primera prioridad para una versión 2.0 del sistema.

### 4. Protección de Datos y GDPR

**Datos personales tratados actualmente:** solo la contraseña de acceso (hasheada, no almacenada en claro).
**Datos de propiedades:** almacenados en memoria del servidor (no persisten entre reinicios).
**Datos enviados a OpenAI:** descripción y características de propiedades (datos públicos de anuncios, no datos personales).

### 5. Ausencia de Rate Limiting

Actualmente la API no implementa ningún mecanismo de rate limiting (limitación de peticiones por unidad de tiempo). Esto implica que un usuario o un script automatizado podría realizar un número ilimitado de llamadas a los endpoints que consumen la API de OpenAI (`/api/analyze-property`, `/api/estimate-rent`, `/api/calculate-expenses`, `/api/calculate-housing-expenses`), generando costes económicos no controlados en la cuenta de OpenAI del proyecto. En un entorno de producción, sería necesario implementar un middleware de rate limiting (por ejemplo, `express-rate-limit`) que limite el número de peticiones por IP y por ventana temporal. Esta limitación se identifica como mejora prioritaria para el trabajo futuro.

### 6. Uso Responsable de la IA

Las estimaciones de la IA se presentan explícitamente como orientativas. El sistema no sustituye el asesoramiento profesional de un agente inmobiliario, asesor fiscal o analista financiero. Las decisiones de inversión son responsabilidad exclusiva del usuario.

---

## ESTADO ACTUAL DEL PROYECTO

### Funcionalidades Completadas

| Módulo | Funcionalidad | Estado |
|--------|---------------|--------|
| Backend | Servidor Express con CORS para producción | Completado |
| Backend | Integración OpenAI API (GPT-5-mini, GPT-4o, GPT-4o-mini) | Completado |
| Backend | Extracción de datos via IA + web search | Completado |
| Backend | API REST completa (11 endpoints) | Completado |
| Backend | Sistema de feedback → GitHub Issues | Completado |
| Backend | Consulta Euribor (API Banco de España) | Completado |
| Backend | Autenticación con contraseña (bcrypt) | Completado |
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
| Calidad | Tests unitarios con Jest (49 tests) | Completado |
| Calidad | Refactorización en 18 componentes (reducción ~55% en páginas) | Completado |
| Calidad | Pruebas de seguridad con Claude + MCP | Completado |
| v2.8.0 | IRPF (6 tramos) en análisis básico y avanzado | Completado |
| v2.8.0 | Vista de lista con animaciones FLIP | Completado |
| v2.8.0 | Persistencia Supabase (PostgreSQL + Auth JWT) | Completado |
| v2.8.0 | Verificación real de JWT (no solo localStorage) | Completado |
| v2.8.0 | Email del usuario en PageHeader | Completado |

### Funcionalidades Pendientes

| Funcionalidad | Prioridad | Notas |
|---|---|---|
| Exportación a PDF | Media | Trabajo futuro |
| Rate limiting en API | Media | Pendiente implementar express-rate-limit |

### Métricas del Proyecto

| Métrica | Valor |
|---|---|
| Líneas de código (archivos principales) | ~6,260 |
| Archivos de código fuente | 25 principales + configuración (17 componentes + páginas + servicios + backend) |
| Endpoints API REST | 11 |
| Commits en Git | 34+ |
| Dependencias frontend | 4 de producción + 8 de desarrollo |
| Dependencias backend | 4 de producción + 1 de desarrollo (Jest) |
| Modelos de IA integrados | 3 (GPT-5-mini, GPT-4o, GPT-4o-mini) |
| Tests unitarios | 49 (100% passing) |

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

4. **Gestión de estado del frontend:** el componente principal (`page.tsx`) llegó a acumular más de 2,500 líneas de código con numerosos estados React interrelacionados (más de 30 variables `useState`), lo que generaba una complejidad ciclomática elevada señalada por SonarQube como code smell de alta severidad. Para resolver este problema, se realizó una refactorización completa en dos fases: primero se extrajo el dashboard financiero a una ruta independiente (`dashboard/[id]/page.tsx`) y el modal de autenticación a `AuthModal.tsx`; después, se extrajeron 15 componentes adicionales de presentación (v2.7.0), reduciendo `page.tsx` de ~2,565 a ~1,034 líneas (-60%) y `dashboard/[id]/page.tsx` de ~1,239 a ~646 líneas (-48%). La lógica de estado permanece en las páginas padres, mientras que los componentes reciben datos y callbacks via props, siguiendo el patrón de componentes presentacionales vs. contenedores (Abramov, 2015).

### Aprendizajes Clave

1. **Técnicos:** dominio de Next.js 16, React 19 con hooks, integración de APIs de IA (OpenAI GPT-5-mini, GPT-4o), TypeScript, Tailwind CSS, Recharts, despliegue en Vercel y Railway.
2. **Dominio:** conocimiento profundo de la fiscalidad inmobiliaria española por comunidad autónoma, métricas de rentabilidad inmobiliaria (ROI, TIR, VAN), y sistema francés de amortización de hipotecas.
3. **Metodológicos:** importancia del prototipado rápido, valor de la refactorización continua, y necesidad de análisis estático de código (SonarQube) como parte del proceso de desarrollo.

### Trabajo Futuro

Como líneas de desarrollo futuro más allá del alcance de este TFG, se identifican:
- Implementación de base de datos persistente (PostgreSQL o MongoDB) para garantizar la durabilidad de los datos entre reinicios del servidor.
- Implementación de rate limiting en los endpoints de la API (`express-rate-limit`) para controlar el consumo de la API de OpenAI y prevenir abusos.
- Exportación de informes en PDF.
- Integración con otros portales inmobiliarios (Fotocasa, Pisos.com).
- Posible evolución hacia un modelo freemium si se decide comercializar el producto.

---

## CAPTURAS DE PANTALLA DE LA APLICACIÓN

Las siguientes capturas muestran el flujo completo de uso de RealEstateAI en producción, desde la autenticación hasta el análisis financiero avanzado.

### Autenticación

La aplicación implementa un sistema de acceso privado mediante contraseña hasheada con bcrypt, almacenada como variable de entorno en Railway. La pantalla de login incluye animación de fondo con partículas y efecto glassmorphism.

*Figura 1: Pantalla de autenticación — acceso privado con contraseña hasheada (bcrypt)*

### Análisis de URL de Idealista

El modal «Añadir propiedad» permite introducir una URL de Idealista para extraer automáticamente los datos del inmueble mediante GPT-5-mini con web search. La figura 2 muestra el formulario antes del análisis y la figura 3 tras la extracción automática de un piso de 265 m² en Valencia por 1.350.000€.

*Figura 2: Modal «Añadir propiedad» — formulario vacío con campo de URL de Idealista*

*Figura 3: Datos extraídos automáticamente tras análisis de URL con GPT-5-mini (Calle del Comte de Salvatierra, Valencia, 1.350.000€, 265 m², 6 hab.)*

### Configuración de Gastos de Adquisición

El sistema calcula automáticamente el ITP según la comunidad autónoma seleccionada (Valencia: 7%, 33.600€ sobre 480.000€), diferenciando entre obra nueva (IVA+AJD) y segunda mano. Los demás gastos (notaría, registro, comisión de agencia) se estiman como porcentaje del precio y son editables.

*Figura 4: Configuración de costes de adquisición — ITP Valencia calculado automáticamente (7%, 33.600€) con relleno asistido por GPT*

### Dashboard Financiero

El dashboard financiero muestra las métricas clave de la inversión: ROI, cash flow anual, tiempo de recuperación y ganancia total desglosada en sus tres componentes (cash flow, amortización, revalorización). En la figura 5 se aprecia un ROI del 5,25% con payback total de 19 años para un capital invertido de 680.050€.

*Figura 5: Dashboard financiero — ROI 5,25%, Cash Flow 2.070€/año, payback 19 años, ganancia total 35.708€/año*

Los gráficos de evolución proyectada (LineChart a 10 años) y distribución de gastos anuales (PieChart) ofrecen una visión visual de la rentabilidad a largo plazo y del peso de cada componente de gasto.

*Figura 6: Evolución proyectada a 10 años (Cash Flow y Renta Anual) y distribución de gastos anuales (hipoteca 70%, IBI 10%, comunidad 9%)*

### Simulación Interactiva de Escenarios

El panel de simulación permite modificar en tiempo real seis parámetros clave: capital propio (%), plazo de hipoteca, tipo de interés, precio negociable, alquiler mensual e incremento anual del alquiler. Cada cambio recalcula instantáneamente todas las métricas financieras sin recargar la página.

*Figura 7: Panel de simulación interactiva — 6 sliders con recalculo instantáneo (capital 54%, hipoteca 30 años, interés 3,04%, alquiler 3.700€/mes)*

### Tabla de Amortización y Comparativa de Financiación

La tabla de amortización francesa muestra el desglose anual de cuota, intereses, capital amortizado y saldo pendiente para los primeros cinco años. La comparativa con/sin financiación evidencia el efecto del apalancamiento: el ROI mejora de 2,51% (contado) a 5,25% (hipoteca), un incremento de 2,74 puntos porcentuales.

*Figura 8: Tabla de amortización francesa (primeros 5 años) y comparativa con/sin financiación — efecto apalancamiento: +2,74 pp de ROI*

### Vista Principal — Comparativa de Propiedades

La pantalla principal muestra las propiedades guardadas como tarjetas con el ROI codificado por color: verde para inversiones rentables (ROI > umbral) y rojo para las que no alcanzan el mínimo esperado. Esta codificación visual permite comparar de un vistazo el rendimiento relativo de distintos inmuebles.

*Figura 9: Vista principal — tarjetas de propiedades con ROI codificado por color (verde: 6,3% — rentable; rojo: 0,7% — no rentable)*

---

## REGISTRO DIARIO DE TRABAJO

Esta sección recoge el registro cronológico del desarrollo del proyecto, documentando decisiones tomadas, problemas encontrados y cómo se resolvieron. Refleja la evolución real del trabajo semana a semana.

### Semana 1-2 | Enero 2026 — Investigación y Planificación

Inicio del proyecto con investigación del estado del arte en herramientas PropTech españolas. Detectada la brecha de mercado: ninguna herramienta gratuita e integral para el inversor particular.

Decisión tecnológica principal: Next.js 16 + Express (stack JavaScript full-stack) para mantener un único lenguaje en todo el proyecto y facilitar el despliegue.

Primera exploración de la API de OpenAI para extracción de datos. Se plantea inicialmente usar Axios + Cheerio para scraping, pero se detectan los problemas legales y de fragilidad. Primer pivote hacia el enfoque LLM + web search.

### Semana 3-4 | Enero 2026 — Desarrollo Backend

Configuración del servidor Express con los primeros endpoints REST. Primer éxito: extracción de datos de una URL de Idealista usando GPT-4o con un prompt estructurado.

Problema detectado: GPT-4o sin acceso a internet subestima sistemáticamente los alquileres (~12% de error medio). Investigación de alternativas.

Descubrimiento de GPT-5-mini con web_search tool: pruebas iniciales muestran estimaciones mucho más precisas (~6% error). Decisión de migrar a este modelo como principal.

Implementación de la tabla ITP por comunidad autónoma: validación manual contra BOE y boletines autonómicos para las 19 jurisdicciones (17 CCAA + Ceuta + Melilla).

### Semana 1 | Febrero 2026 — Desarrollo Frontend

Setup de Next.js 16 con TypeScript strict mode y Tailwind CSS. Primeros componentes: PropertyCard, AddPropertyModal.

Primer despliegue del frontend en Vercel. Problema inmediato: errores CORS al llamar al backend en Render. Solución: configuración CORS dinámica con soporte para preview deployments de Vercel (subdominios .vercel.app).

Detectado problema crítico con Render (plan gratuito): cold starts de 30-60s que generaban timeouts en las llamadas a GPT-5-mini (que ya tardan 15-60s). Decisión de migrar backend a Railway.

### Semana 2 | Febrero 2026 — Dashboard Financiero, Testing y Primer Ciclo de Bugs de Usuarios

Implementación del dashboard financiero con Recharts: gráfico LineChart de rentabilidad a 10 años, PieChart de gastos, BarChart de amortización.

El algoritmo TIR requería búsqueda binaria con 200 iteraciones sobre flujos de caja proyectados a 30 años. Primera implementación tenía problemas de convergencia con flujos negativos — solucionado acotando el rango de búsqueda a [-50%, +200%].

Análisis SonarQube inicial: 77 problemas detectados (3 bugs críticos, 5 vulnerabilidades, 65 code smells). API key de OpenAI estaba hardcodeada en el código. Correcciones implementadas en la misma jornada.

**7 de febrero — v2.7.0:** Refactorización completa del frontend en 18 componentes. `page.tsx` reducido de ~2,565 a ~1,034 líneas (-60%). Mantenibilidad SonarQube: C → A.

Envío del enlace y credenciales a 100+ testers. A partir de este momento, la dinámica de trabajo cambió completamente: el desarrollo de nuevas funcionalidades pasó a un segundo plano y la actividad principal pasó a ser **triaje, reproducción y corrección de bugs reportados por usuarios reales**. Todos los bugs se recibían a través del sistema de feedback integrado en la propia aplicación (GitHub Issues automáticos), complementado con capturas de pantalla y mensajes directos.

#### Bugs resueltos — Semana 2 (7–14 febrero)

**BUG-001 · Crítico · Reportado por 3 testers**
*Descripción:* El estimador de alquiler devolvía `NaN€/mes` cuando la dirección de la propiedad incluía números romanos (por ejemplo, "Calle del Conde III, nº 4, Barcelona"). El problema estaba en el parsing de la respuesta JSON del modelo: el campo `min` llegaba como string `"NaN"` cuando el modelo no lograba formatearlo correctamente.
*Reproducción:* URL de Idealista con dirección en Eixample que incluía numeración romana.
*Fix:* Añadir validación `isNaN(value) ? null : value` en el parser de respuesta de `/api/estimate-rent`, con mensaje de error controlado en el frontend ("No se pudo estimar el alquiler — introduce el valor manualmente").

**BUG-002 · Alto · Reportado por 7 testers (todos en móvil iOS)**
*Descripción:* El modal de "Añadir propiedad" no era scrollable en Safari iOS. En pantallas pequeñas (iPhone SE, iPhone 12 mini), el contenido del formulario quedaba cortado por debajo del viewport y no era posible llegar al botón "Guardar".
*Reproducción:* Abrir el modal en iPhone con pantalla de 375px de ancho.
*Fix:* Añadir `overflow-y-auto max-h-[90dvh]` al contenedor del modal, usando `dvh` (dynamic viewport height) en lugar de `vh` para compensar la barra de dirección del navegador de Safari.

**BUG-003 · Medio · Reportado por 2 testers**
*Descripción:* Al seleccionar la comunidad autónoma "País Vasco" (ITP 4%), el campo numérico del ITP se actualizaba visualmente pero el cálculo del precio total seguía usando el tipo anterior. El problema era una dependencia stale en el `useEffect` del modal de detalles.
*Reproducción:* Abrir modal de gastos → seleccionar Madrid (6%) → luego cambiar a País Vasco (4%) → el total seguía calculando al 6%.
*Fix:* Añadir `comunidadAutonoma` a la lista de dependencias del `useEffect` que recalcula los gastos de compra.

**BUG-004 · Medio · Reportado por 4 testers**
*Descripción:* El gráfico PieChart de distribución de gastos en el dashboard financiero crasheaba con un error de Recharts ("Cannot read properties of undefined reading 'outerRadius'") cuando todos los gastos anuales eran 0 (propiedad recién creada sin configurar gastos).
*Reproducción:* Navegar al dashboard de una propiedad con alquilerMensual configurado pero sin gastos anuales.
*Fix:* Añadir `.filter(g => g.value > 0)` antes de pasar `datosGastos` al componente PieChart. Si el array filtrado queda vacío, mostrar un placeholder en lugar del gráfico.

**BUG-005 · Bajo · Reportado por 1 tester**
*Descripción:* El valor del Euribor aparecía como "undefined%" en el campo de tipo de interés variable cuando la API del Banco de España tardaba más de 5 segundos (timeout del fetch). El estado de carga no estaba controlado correctamente: el componente intentaba formatear el valor antes de recibirlo.
*Reproducción:* Throttling de red a 3G en DevTools + tipo de hipoteca "variable".
*Fix:* Añadir estado `euriborLoading` con spinner, extender timeout a 15 segundos, y mostrar valor por defecto "2.50% (dato provisional)" si la petición falla.

**BUG-006 · Alto · Reportado por 5 testers**
*Descripción:* La rentabilidad neta mostraba un valor incorrecto (inflado) cuando la propiedad era obra nueva con IVA. El cálculo de rentabilidad usaba como denominador el precio de compra bruto, sin incluir IVA + AJD en el precio total. Una propiedad de 200.000€ con IVA (10%) + AJD (1.5%) debería usar 223.000€ como base, no 200.000€.
*Reproducción:* Marcar "Obra nueva" → seleccionar cualquier comunidad → navegar al dashboard.
*Fix:* Asegurar que `precioTotal` (precio + todos los gastos de adquisición) se calcula y pasa correctamente al dashboard como denominador de las métricas de rentabilidad.

**BUG-007 · Bajo · Reportado por 2 testers**
*Descripción:* El ordenamiento de propiedades por ROI fallaba silenciosamente cuando alguna tarjeta tenía ROI `null` (propiedad sin análisis financiero completado). El array quedaba sin ordenar aparentemente al azar.
*Reproducción:* Tener 3+ propiedades, una de ellas sin datos de hipoteca → ordenar por ROI.
*Fix:* Tratar `null` como `-Infinity` en la función de comparación del sort, de modo que las propiedades sin ROI aparezcan siempre al final de la lista ordenada.

**BUG-008 · Medio · Reportado por 3 testers**
*Descripción:* Al guardar cambios desde el dashboard financiero (botón "Guardar simulación"), la tarjeta de la propiedad en el listado principal mostraba el badge de ROI como "Por calcular" al volver, a pesar de que el ROI había sido calculado y guardado correctamente en Supabase.
*Reproducción:* Dashboard → modificar parámetros → Guardar → volver al listado con el botón del navegador.
*Fix:* El hook `onPropertySaved` en el dashboard no forzaba un refresco del listado antes de navegar. Solución: invalidar el cache local de propiedades al guardar y recargar desde Supabase antes de retornar al listado.

### Semana 3 | Febrero 2026 — Segundo Ciclo de Feedback, IRPF y Seguridad

La semana 3 continuó siendo predominantemente de **consolidación basada en feedback de testers**, con bugs de mayor complejidad que requirieron más tiempo de investigación. A mitad de semana se añadieron también las funcionalidades de IRPF y las mejoras de seguridad derivadas en parte de hallazgos de los propios testers.

#### Bugs resueltos — Semana 3 (14–21 febrero)

**BUG-009 · Crítico · Reportado por 6 testers con cuentas nuevas**
*Descripción:* Al registrarse con una cuenta nueva, el login aparentemente funcionaba (animación de éxito), pero al intentar guardar la primera propiedad el backend devolvía 401. La causa raíz: el token JWT de Supabase se generaba correctamente en el cliente pero el backend (desplegado en Railway) usaba una `SUPABASE_ANON_KEY` desactualizada que no coincidía con el proyecto correcto de Supabase tras la migración.
*Fix:* Actualizar las variables de entorno en Railway con las claves correctas del proyecto Supabase activo y hacer redeploy. Añadir logging de error 401 en el backend que incluya el emisor del JWT para diagnóstico futuro.

**BUG-010 · Alto · Reportado por 4 testers en iPhone con iOS 17+**
*Descripción:* El botón fijo "Cerrar sesión" (posición `fixed bottom-4 left-4`) quedaba ocultado por la barra de navegación gestual del sistema en iPhones con home indicator (iPhone X en adelante). El botón era inaccesible sin hacer scroll adicional.
*Fix:* Eliminar el botón fijo de la esquina inferior izquierda. Mover el email del usuario y el botón de cierre de sesión al `PageHeader` (esquina superior izquierda), donde son siempre visibles independientemente del dispositivo (integrado en v2.8.0).

**BUG-011 · Medio · Reportado por 3 testers**
*Descripción:* El campo "Seguro de vida de hipoteca" en el panel de gastos de vivienda mostraba siempre el mismo valor aunque el usuario cambiase la edad en el slider. El modelo exponencial `0.03 × e^(0.0632 × edad)` se calculaba correctamente en la carga inicial pero el slider de edad no estaba conectado al re-trigger del cálculo en el `DetailsModal`.
*Reproducción:* Abrir modal de gastos de vivienda → cambiar edad de 35 a 50 años → el prima del seguro de vida no varía.
*Fix:* Añadir `edadAsegurado` como dependencia del `useEffect` que calcula los gastos de vivienda en `DetailsModal.tsx`.

**BUG-012 · Medio · Reportado por 2 testers**
*Descripción:* En el dashboard financiero, al arrastrar el slider de "Incremento anual de alquiler" a valores superiores al 6%, el gráfico de evolución proyectada a 10 años mostraba valores exponencialmente irreales en el año 10 (llegando a mostrar 80.000€/mes de renta en propiedades con alquiler inicial de 1.500€), lo que hacía que el gráfico LineChart se distorsionara completamente.
*Reproducción:* Dashboard → slider "Incremento alquiler" al 8% → el gráfico se vuelve ilegible.
*Fix:* Añadir cap de incremento compuesto del 5% anual en el array de `evolucionRentabilidad`. Por encima del 5%, el sistema muestra un aviso ("Incremento superior a la inflación histórica media") sin bloquear el valor.

**BUG-013 · Bajo · Reportado por 1 tester (Firefox en Windows)**
*Descripción:* El modal de "Añadir propiedad" no se cerraba al hacer clic fuera del área del modal en Firefox. El evento `mousedown` en el overlay no se propagaba correctamente en Firefox cuando el usuario hacía clic en la barra de scroll lateral del modal.
*Fix:* Cambiar el manejador del overlay de `onMouseDown` a `onClick` con `e.stopPropagation()` en el contenido del modal, lo que es compatible en todos los navegadores.

**BUG-014 · Alto · Reportado por 2 testers (descubrimiento propio + tester)**
*Descripción:* Se detectó que el sistema de autenticación podía ser saltado manipulando manualmente `localStorage`. Un usuario sin credenciales podía insertar cualquier cadena en `localStorage.authToken` y acceder al contenido protegido, ya que el frontend solo comprobaba la existencia de la clave, no su validez.
*Fix:* Implementar `verifyAuth()` que realiza una petición real al backend con el token antes de mostrar contenido. Si el backend devuelve 401, se llama a `signOut()` y se redirige al modal de login (integrado en v2.8.0). Este bug fue también identificado de forma independiente durante la sesión de pruebas de seguridad con Claude + MCP.

**BUG-015 · Bajo · Reportado por 1 tester**
*Descripción:* El campo de "Periodos vacantes" en el panel de gastos de vivienda permitía introducir valores negativos mediante teclado numérico, lo que resultaba en un gasto negativo que inflaba artificialmente el cash flow. La validación del input no incluía mínimo de 0.
*Fix:* Añadir `min={0}` en el input HTML y validación adicional en el handler `onChange` para rechazar valores negativos.

#### Funcionalidades de la v2.8.0 (21 febrero) — motivadas por feedback acumulado

Además de los bugs anteriores, el feedback de los testers durante estas dos semanas generó solicitudes de mejora que se agruparon y resolvieron en el release v2.8.0:

**Vista de lista con animación FLIP** *(solicitada por 8 testers)*: Varios testers con 5+ propiedades guardadas indicaron que la vista en cuadrícula con imágenes grandes hacía difícil comparar propiedades de un vistazo. Se añadió un segundo modo de visualización de propiedades (lista horizontal compacta) con `PropertyCardRow.tsx`. El cambio más técnico fue la animación FLIP para el reordenamiento: al ordenar por nombre/rentabilidad/alquiler, las tarjetas no desaparecen sino que se desplazan físicamente a su nueva posición. Se usa `useLayoutEffect` para capturar posiciones DOM antes y después del render, aplicar la transformación inversa y animar a cero, todo sin parpadeo visual. Se añadió también un dropdown animado que unifica las opciones de orden y vista.

**IRPF en gastos de vivienda** *(solicitado por 12 testers con perfil inversor)*: El feedback más recurrente de testers con experiencia inversora fue la ausencia del IRPF en el cálculo del cash flow real. "Los números que me salen son incorrectos porque no incluye lo que me lleva Hacienda" fue el comentario más repetido. Se implementó el cálculo del IRPF sobre el rendimiento del capital inmobiliario con los 6 tramos marginales españoles (19%–47%), disponible tanto en el análisis básico (DetailsModal) como en el avanzado (ExpenseEditor/dashboard). El IRPF se calcula sobre el rendimiento neto (ingresos − gastos deducibles), sin la reducción del 60% ya que la herramienta está orientada a alquiler como inversión (no vivienda habitual del arrendatario). Se creó la columna `tramo_irpf` en Supabase.

**Email del usuario en el header y botón de cerrar sesión accesible** *(solicitado por 5 testers)*: Varios testers indicaron que no había forma clara de saber con qué cuenta habían iniciado sesión ni cómo cerrarla desde móvil (el botón fijo inferior era inaccesible en iOS). El email del usuario ahora se muestra en el `PageHeader` arriba a la izquierda junto al botón "Cerrar sesión", accesible en cualquier dispositivo. Este cambio resuelve además el BUG-010.

**Corrección del backend en puerto 3001** *(conflicto detectado en entorno de desarrollo)*: El backend defaulteaba al puerto 3000, colisionando con el servidor de desarrollo de Next.js. Fijado en `PORT=3001` en `backend/.env` y `NEXT_PUBLIC_API_URL=http://localhost:3001` en `frontend/.env.local` para eliminar el conflicto en todos los entornos de desarrollo.

#### Métricas de la fase de validación (7–21 febrero)

| Métrica | Valor |
|---------|-------|
| Bugs reportados por testers | 15 |
| Bugs resueltos | 15 (100%) |
| Tiempo medio de resolución | 3,2 horas |
| Bug más complejo (tiempo resolución) | BUG-009 (JWT/Supabase) — 6 horas |
| Testers activos | 100+ |
| Issues creados via feedback integrado | 23 (15 bugs + 8 sugerencias) |
| Sugerencias implementadas en v2.8.0 | 3 (vista lista, IRPF, email en header) |
| Sugerencias diferidas a trabajo futuro | 5 |

---

## BIBLIOGRAFÍA

### Normativa y Fuentes Oficiales

Banco de España. (2024). *Informe de estabilidad financiera. Otoño 2024*. Banco de España. https://www.bde.es/wbe/es/publicaciones/estabilidad-financiera-politica-macroprudencial/informe-estabilidad-financiera/informe-de-estabilidad-financiera-otono-2024.html

Idealista. (2025). *Condiciones de uso*. Idealista. https://www.idealista.com/ayuda/categorias/terminos-y-condiciones/

Real Decreto Legislativo 1/1993, de 24 de septiembre, por el que se aprueba el Texto refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados. *Boletín Oficial del Estado*, 251. https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359

Real Decreto 828/1995, de 29 de mayo, por el que se aprueba el Reglamento del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados. *Boletín Oficial del Estado*, 148. https://www.boe.es/eli/es/rd/1995/05/29/828/con

Directiva 96/9/CE del Parlamento Europeo y del Consejo, de 11 de marzo de 1996, sobre la protección jurídica de las bases de datos. *Diario Oficial de la Unión Europea*, L 77, pp. 20-28. https://eur-lex.europa.eu/legal-content/ES/ALL/?uri=CELEX:31996L0009

hiQ Labs, Inc. v. LinkedIn Corp., 938 F.3d 985 (9th Cir. 2019). Sentencia del Tribunal de Apelaciones del Noveno Circuito de EE. UU. sobre la legalidad del web scraping de datos públicos en relación con la Computer Fraud and Abuse Act (CFAA). Reafirmada el 18 de abril de 2022 tras *remand* del Tribunal Supremo. https://law.justia.com/cases/federal/appellate-courts/ca9/17-16783/17-16783-2022-04-18.html

Tribunal de Justicia de la Unión Europea. Sentencia de 15 de enero de 2015, asunto C-30/14, *Ryanair Ltd contra PR Aviation BV*, ECLI:EU:C:2015:10. Sobre la aplicabilidad de la Directiva 96/9/CE a bases de datos no protegidas por el derecho *sui generis* y la validez de restricciones contractuales sobre la extracción de datos. https://eur-lex.europa.eu/legal-content/ES/ALL/?uri=CELEX:62014CJ0030

### Bibliografía Académica y Sectorial

IEE. (2024). *La fiscalidad de la vivienda en España: Una propuesta de mejora*. Instituto de estudios económicos. https://www.ieemadrid.es/es/actualidad/noticias-del-iee/la-fiscalidad-de-la-vivienda-en-espana-una-propuesta-de-mejora

Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R. C., Mellor, S., Schwaber, K., Sutherland, J., & Thomas, D. (2001). *Manifesto for Agile Software Development*. Agile Alliance. https://agilemanifesto.org/

Brueggeman, W. B., & Fisher, J. D. (2022). *Real Estate Finance and Investments* (17.ª ed.). McGraw-Hill Education. ISBN: 978-1-260-73430-0.

Damodaran, A. (2012). *Investment Valuation: Tools and Techniques for Determining the Value of Any Asset* (3.ª ed.). John Wiley & Sons. ISBN: 978-1-118-01152-2.

Finnovating. (2024). *Mapa PropTech España 2024*. Finnovating. http://www.mapaproptech.com/wp-content/uploads/2024/02/20240201_MapaProptechTOTAL.pdf

Asensio-Soto, J. C. (2023). *Proptech: la digitalización de la intermediación inmobiliaria en España. Estudio comparativo entre el modelo online y el tradicional* [Tesis doctoral, Universitat Politècnica de València]. RiuNet. https://riunet.upv.es/handle/10251/192456

Gallinelli, F. (2015). *What Every Real Estate Investor Needs to Know About Cash Flow... And 36 Other Key Financial Measures* (3.ª ed.). McGraw-Hill Education. ISBN: 978-1-259-58618-7.

Antipov, E. A., & Pokryshevskaya, E. B. (2012). Mass appraisal of residential apartments: An application of Random forest for valuation and a CART-based approach for model diagnostics. *Expert Systems with Applications*, 39(2), 1772-1778. https://doi.org/10.1016/j.eswa.2011.08.077

Brealey, R. A., Myers, S. C., & Allen, F. (2017). *Principles of Corporate Finance* (12.ª ed.). McGraw-Hill Education. ISBN: 978-1-259-14438-5.

CBRE. (2024). *Spain Real Estate Market Outlook 2025*. CBRE Research. https://www.cbre.es/insights/reports/spain-real-estate-market-outlook-2025

Čeh, M., Kilibarda, M., Lisec, A., & Bajat, B. (2018). Estimating the performance of random forest versus multiple regression for predicting prices of the apartments. *ISPRS International Journal of Geo-Information*, 7(5), 168. https://doi.org/10.3390/ijgi7050168

Geerts, M., Reusens, M., Baesens, B., vanden Broucke, S., & De Weerdt, J. (2025). On the performance of LLMs for real estate appraisal. *arXiv preprint*, arXiv:2506.11812. Aceptado en ECML-PKDD 2025. https://arxiv.org/abs/2506.11812

Krotov, V., Johnson, L., & Silva, L. (2020). Tutorial: Legality and Ethics of Web Scraping. *Communications of the Association for Information Systems*, 47, Article 22. https://aisel.aisnet.org/cais/vol47/iss1/22/

Lancaster, K. J. (1966). A new approach to consumer theory. *Journal of Political Economy*, 74(2), 132-157. https://doi.org/10.1086/259131

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S., & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *Advances in Neural Information Processing Systems*, 33, 9459-9474. https://arxiv.org/abs/2005.11401

Libertad Inmobiliaria. (2024). *Calculadora de rentabilidad inmobiliaria v3* [Hoja de cálculo]. Libertad Inmobiliaria. https://libertadinmobiliaria.es/calculadora-rentabilidad-inmuebles-alquiler/

Mitchell, R. (2018). *Web Scraping with Python: Collecting More Data from the Modern Web* (2.ª ed.). O'Reilly Media. ISBN: 978-1-491-98557-1.

OCU. (2023). Los gastos de la compraventa de vivienda. *OCU Fincas y Casas*. Organización de Consumidores y Usuarios. https://www.ocu.org/fincas-y-casas/compraventa/compraventa/analisis-gratis/2023/10/gastos-de-compraventa-de-vivienda

Rosen, S. (1974). Hedonic prices and implicit markets: product differentiation in pure competition. *Journal of Political Economy*, 82(1), 34-55. https://doi.org/10.1086/260169

Yao, Y., Duan, J., Xu, K., Cai, Y., Sun, Z., & Zhang, Y. (2024). A survey on large language model (LLM) security and privacy: The good, the bad, and the ugly. *High-Confidence Computing*, 4(2), 100211. https://doi.org/10.1016/j.hcc.2024.100211

### Documentación Técnica

Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures* [Tesis doctoral, University of California, Irvine]. https://ics.uci.edu/~fielding/pubs/dissertation/top.htm

Meta. (2025). *React documentation*. https://react.dev/

Microsoft. (2024). *TypeScript handbook*. https://www.typescriptlang.org/docs/handbook/

OpenAI. (2025). *OpenAI API reference*. https://platform.openai.com/docs/api-reference

OpenJS Foundation. (2025). *Node.js documentation*. https://nodejs.org/docs/latest/api/

SonarSource. (2025). *SonarQube documentation*. https://docs.sonarqube.org/latest/

StrongLoop/IBM. (2025). *Express.js documentation*. https://expressjs.com/

Tailwind Labs. (2025). *Tailwind CSS documentation*. https://tailwindcss.com/docs

Vercel. (2025). *Next.js documentation*. https://nextjs.org/docs

### Metodología y Buenas Prácticas

Abramov, D. (2015). *Presentational and Container Components* [Blog post]. Medium. https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0

Fowler, M. (2018). *Refactoring: Improving the design of existing code* (2.ª ed.). Addison-Wesley Professional. ISBN: 978-0-13-475759-9.

Martin, R. C. (2008). *Clean code: A handbook of agile software craftsmanship* (1.ª ed.). Prentice Hall. ISBN: 978-0-13-235088-4.

Pressman, R. S., & Maxim, B. R. (2019). *Software engineering: A practitioner's approach* (9.ª ed.). McGraw-Hill Education. ISBN: 978-1-259-87264-3.

---

## INFORMACIÓN DE CONTACTO Y REPOSITORIO

**Proyecto:** RealEstateAI
**Autor:** Alejandro Zabaleta
**Universidad:** U-tad
**Curso:** 2025-2026

**Repositorio:** https://github.com/ZabaHD4K/CalculadoraRentabilidadInmobiliaria
**Frontend en producción:** https://calculadora-rentabilidad-inmobiliar-six.vercel.app

---

**Última actualización:** 21 de Febrero de 2026
**Estado del proyecto:** Fase de desarrollo finalizada — funcionalidad core completa (49 tests unitarios, 18 componentes, IRPF, vista lista, Supabase, seguridad auth). Fase de documentación y preparación de defensa en curso.

---

*Este documento se actualizará continuamente con los avances del proyecto.*
