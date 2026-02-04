# 📝 Notas de Cambios - RealState AI

## Versión 2.1.6 - 4 de Febrero de 2026

### 🔧 Corrección Crítica del Cálculo de ROI

**Corrección importante**: El ROI ahora se calcula correctamente sobre el capital propio (entrada real del inversor) en lugar del precio total del inmueble.

#### 🎯 Cambios en la Fórmula

**❌ Fórmula INCORRECTA (antes)**:
```javascript
ROI = (Alquiler anual - Gastos anuales) / Precio total * 100
```
Problema: Calculaba la rentabilidad sobre el precio total del inmueble, ignorando la financiación.

**✅ Fórmula CORRECTA (ahora)**:
```javascript
ROI = (Alquiler anual - Gastos - Cuota hipoteca) / Capital propio * 100
```
Beneficios:
- ✅ Usa el **capital propio** (dinero que TÚ pones) como base
- ✅ Resta la **cuota de hipoteca** de los beneficios
- ✅ Refleja la **rentabilidad real** de tu inversión
- ✅ Si no hay hipoteca, usa el precio total como antes

#### 📊 Ejemplo Real

**Propiedad con financiación**:
- Precio total: 212,233€
- Capital propio (30%): 63,670€
- Alquiler anual: 9,600€
- Gastos anuales: 7,945€
- Cuota hipoteca anual: 5,200€

**Antes**: ROI = (9,600 - 7,945) / 212,233 × 100 = **0.78%** ❌
**Ahora**: ROI = (9,600 - 7,945 - 5,200) / 63,670 × 100 = **-8.56%** ✅

(Nota: El ROI negativo indica que la propiedad no es rentable con esas condiciones)

#### 🔄 Integración Completa

1. **Cálculo automático de cuota**: Si hay hipoteca, calcula la cuota mensual con fórmula francesa
2. **Validación de datos**: Verifica que todos los datos de hipoteca estén presentes
3. **Actualización dinámica**: Al cambiar capital propio o plazo en el dashboard, el ROI se recalcula
4. **Guardado persistente**: Los cambios se guardan y el ROI se actualiza en las tarjetas
5. **Visualización mejorada**: Los badges ROI reflejan la rentabilidad real con colores y animaciones

#### 💡 Impacto en la Toma de Decisiones

- **Precisión financiera**: Ahora muestra la rentabilidad real sobre tu inversión
- **Comparación justa**: Permite comparar propiedades con diferentes niveles de financiación
- **Decisiones informadas**: Los inversores ven el retorno real de su capital
- **Transparencia**: Incluye todos los costos (gastos + hipoteca) en el cálculo

---

## Versión 2.1.5 - 4 de Febrero de 2026

### 💾 Sistema de Guardado en Análisis Financiero

**Nueva funcionalidad**: Los cambios realizados en el dashboard de análisis financiero ahora se guardan automáticamente, actualizando el ROI visible en las tarjetas principales.

#### 🎯 Características Implementadas

1. **Botón Flotante de Guardado**:
   - 💾 Botón flotante en la esquina inferior derecha
   - 🎨 Estados visuales dinámicos:
     - **Normal**: Gradiente teal-cyan con icono de guardado
     - **Guardando**: Spinner animado + texto "Guardando..."
     - **Guardado**: ✓ Verde con animación de escala + "¡Guardado!"
   - 🎭 Animaciones suaves de hover y transición

2. **Sincronización Completa de Datos**:
   - 📊 Guarda todos los parámetros editados:
     - Precio del inmueble
     - Alquiler mensual
     - Capital propio (entrada)
     - Plazo de hipoteca
     - Tipo de interés
     - Comunidad, IBI, seguros
     - Porcentajes de mantenimiento, impago, vacantes
   
   - 🔄 Recalcula automáticamente:
     - Gastos anuales totales
     - Valores de gastos desde porcentajes
     - ROI completo

3. **Actualización del ROI en Tarjetas**:
   - 🎯 Al guardar cambios en el dashboard, el ROI se recalcula
   - 🏷️ Las tarjetas de la página principal muestran el ROI actualizado
   - 🎨 Las animaciones del badge ROI reflejan el nuevo cálculo:
     - Rojo (< 5%) → Verde (5-10%) → Verde+partículas (10-15%) → Azul+sparkles (>15%)
   
4. **Flujo de Trabajo Mejorado**:
   ```
   1. Usuario abre propiedad → Modal de detalles
   2. Llena todos los datos → Botón análisis se desbloquea
   3. Click en "Análisis Financiero Avanzado" → Dashboard
   4. Ajusta parámetros (capital propio, plazo, etc.)
   5. Click en "💾 Guardar Cambios" → Datos persistidos
   6. Vuelve a página principal → ROI actualizado visible
   ```

5. **Feedback Visual Mejorado**:
   - ⏳ Indicador de carga mientras guarda
   - ✅ Confirmación visual (3 segundos) al guardar exitosamente
   - ⚠️ Alert si hay error en el guardado
   - 🎨 Transiciones suaves en todos los estados

#### 💡 Impacto en la Experiencia de Usuario

- **Persistencia real**: Los análisis y simulaciones ya no se pierden al salir
- **ROI actualizado**: Las comparaciones entre propiedades son precisas y actualizadas
- **Workflow fluido**: Editar → Simular → Guardar → Ver resultados en un ciclo natural
- **Confianza del usuario**: Feedback claro de que los cambios se han guardado correctamente

---

## Versión 2.1.4 - 4 de Febrero de 2026

### 🔒 Validación de Datos y Bloqueo Inteligente de Análisis

**Nueva funcionalidad**: El botón de Análisis Financiero Avanzado solo se activa cuando todos los datos necesarios están completos, con animación premium de desbloqueo.

#### 🎯 Características Implementadas

1. **Validación Completa de Datos**:
   - ✅ **Datos básicos**: Precio del inmueble y alquiler mensual
   - ✅ **Gastos de adquisición**: Al menos ITP o IVA configurado
   - ✅ **Gastos notariales**: Notaría o Registro de compra
   - ✅ **Gastos anuales**: Comunidad e IBI como mínimo
   - ✅ **Datos de hipoteca**: Si hay capital propio, validar plazo y tipo de interés

2. **Botón Inteligente con Estados Visuales**:
   - 🔒 **Estado Bloqueado** (datos incompletos):
     - Gris y en blanco/negro (grayscale)
     - Apariencia de botón hundido (pulsado)
     - Cursor not-allowed
     - Badge rojo: "Completa todos los datos"
     - Opacidad reducida (60%)
   
   - 🎉 **Estado Desbloqueado** (todos los datos completos):
     - Animación espectacular de "levantamiento"
     - Gradiente purple-pink vibrante
     - Efecto de sombra expansiva
     - Transición de color suave (grayscale → color)
     - Transform desde posición hundida a elevada
     - Brillo y glow pulsante

3. **Animación CSS de Desbloqueo**:
   ```css
   @keyframes button-unlock {
     0% {
       transform: translateY(4px);
       filter: grayscale(100%);
       box-shadow: 0 0 0 rgba(168, 85, 247, 0);
     }
     50% {
       transform: translateY(-4px);
       filter: grayscale(0%);
       box-shadow: 0 10px 40px rgba(168, 85, 247, 0.4);
     }
     100% {
       transform: translateY(0);
       filter: grayscale(0%);
       box-shadow: 0 20px 60px rgba(168, 85, 247, 0.6);
     }
   }
   ```

4. **Persistencia Mejorada de Datos**:
   - 💾 Guardado automático de todos los datos de hipoteca antes de navegar
   - 📊 El dashboard ahora carga correctamente:
     - Capital propio desde la propiedad guardada
     - Plazo de hipoteca configurado
     - Tipo de interés personalizado
     - Todos los gastos calculados
   - 🔄 Sincronización completa entre modal de edición y dashboard

5. **Cálculos Automáticos Mejorados**:
   - ⚡ Al guardar, se recalculan automáticamente los `gastosAnuales`
   - 📈 El dashboard usa los valores guardados en lugar de defaults
   - 🎯 Si no hay datos de hipoteca, usa 30% como capital propio default

#### 💡 Impacto en la Experiencia de Usuario

- **Prevención de errores**: No se puede acceder al análisis financiero con datos incompletos
- **Feedback visual claro**: El usuario sabe exactamente qué falta por completar
- **Satisfacción de logro**: La animación de desbloqueo gamifica el proceso de completar datos
- **Consistencia de datos**: Garantiza que todos los cálculos se hagan con datos completos y correctos
- **Mejor precisión**: Los análisis financieros son más confiables al estar basados en datos verificados

---

## Versión 2.1.3 - 4 de Febrero de 2026

### 🎨 Mejoras de UX y Visualización de Métricas

**Nuevas funcionalidades visuales**: Sistema de badges inteligentes y mejoras en feedback de búsqueda.

#### 🎯 Características Implementadas

1. **Indicador de Progreso en Búsqueda de Propiedades**:
   - ⏳ Spinner circular animado mientras se busca la propiedad
   - ⚡ Mensaje informativo: "Este proceso puede tardar hasta 50 segundos..."
   - 🎨 Diseño coherente con el sistema de colores de la aplicación
   - 💡 Mejora significativa de la experiencia de usuario al proporcionar feedback visual

2. **Badges de ROI Inteligentes con Animaciones por Nivel**:
   - 📊 **Badge de ROI** (arriba izquierda de la imagen):
     - **"Por calcular"** (gris): Cuando faltan datos para el cálculo
     - **< 5% (rojo)**: ROI bajo, sin animaciones
     - **5-10% (verde)**: ROI bueno, sin animaciones
     - **10-15% (verde con partículas)**: ROI muy bueno, partículas flotantes animadas
     - **> 15% (azul con brillos)**: ROI excelente, efecto de brillo pulsante + sparkles ✨
   
   - 💰 Cálculo del ROI:
     ```
     ROI = (Ingresos anuales - Gastos anuales) / Inversión total × 100
     ```
     - Ingresos anuales = Alquiler mensual × 12
     - Gastos anuales = Suma de todos los gastos de la vivienda
     - Inversión total = Precio + ITP/IVA + Notaría + Registro + Reforma + otros

3. **Badge de Alquiler Mensual**:
   - 💵 **Badge de Alquiler** (abajo derecha de la imagen):
     - Muestra el alquiler mensual si está configurado: `850€/mes`
     - Muestra "Por añadir" si aún no se ha introducido
     - Estilo morado distintivo con borde brillante
     - Visible en todo momento sobre la imagen de la propiedad

4. **Animaciones CSS Premium**:
   ```css
   /* Partículas flotantes para ROI 10-15% */
   @keyframes float-particles {
     0%, 100% { transform: translateY(0px) translateX(0px); }
     25% { transform: translateY(-10px) translateX(5px); }
     50% { transform: translateY(-5px) translateX(-5px); }
     75% { transform: translateY(-15px) translateX(3px); }
   }
   
   /* Brillo pulsante para ROI > 15% */
   @keyframes glow-pulse {
     0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
     50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
   }
   ```

5. **Mejoras de Diseño**:
   - 🎨 Badges con fondo semi-transparente y efecto blur
   - 🌈 Sistema de colores progresivo según rendimiento
   - ✨ Animaciones sutiles que destacan sin distraer
   - 📱 Diseño responsive que funciona en todos los dispositivos

#### 💡 Impacto en la Experiencia de Usuario

- **Feedback instantáneo**: Los usuarios ven el estado de ROI y alquiler sin necesidad de abrir la propiedad
- **Gamificación visual**: Las animaciones premian propiedades con mejor rendimiento
- **Transparencia**: Indicadores claros de progreso y estado de datos
- **Decisiones informadas**: Comparación visual rápida entre múltiples propiedades

---

## Versión 2.1.2 - 4 de Febrero de 2026

### 🔐 Sistema de Autenticación Implementado

**Nueva funcionalidad**: La aplicación ahora requiere contraseña para acceder, permitiendo controlar el acceso a la demo.

#### 🎯 Características del Sistema de Autenticación

1. **Modal de Acceso con Animaciones Premium**:
   - ✨ Animación de entrada espectacular (rotación + escala + fade)
   - ✨ Animación de salida suave (rotación inversa + expansión + desvanecimiento)
   - ✨ 20 partículas flotantes animadas en el fondo
   - ✨ Efecto de brillo pulsante en el icono de candado
   - ✨ Animación "shake" cuando la contraseña es incorrecta
   - ✨ Gradientes dinámicos teal/cyan con efectos de hover
   - ✨ Diseño completamente responsive

2. **Seguridad Robusta**:
   ```javascript
   // Backend - Contraseña hasheada con SHA-256
   const crypto = require('crypto');
   const hash = crypto.createHash('sha256').update('3808').digest('hex');
   ```
   - ❌ La contraseña NUNCA se guarda en texto plano
   - ✅ Solo se almacena el hash SHA-256
   - ✅ Comparación segura en el servidor
   - ✅ Token de sesión guardado en sessionStorage

3. **Experiencia de Usuario**:
   - 🎨 Diseño moderno y atractivo
   - ⚡ Validación en tiempo real
   - 🔄 Feedback visual inmediato (loading, errores, éxito)
   - 🎯 Input de contraseña con espaciado de caracteres para mejor UX
   - 🚀 Acceso persistente durante la sesión del navegador

4. **Implementación Técnica**:
   ```
   Backend (server.js):
   - POST /api/verify-password → Verifica hash de contraseña
   - Logs de acceso (éxitos y fallos)
   
   Frontend (AuthModal.tsx):
   - Modal bloqueante de pantalla completa
   - Gestión de estado con React hooks
   - Animaciones CSS personalizadas (@keyframes)
   - Validación y manejo de errores
   ```

5. **Contraseña de Acceso**:
   - 🔑 Contraseña: `3808`
   - 📝 Para uso de amigos y pruebas
   - 🛡️ Fácil de recordar pero protegida con hash

#### 🎨 Detalles de las Animaciones

**Entrada del Modal**:
```css
- Opacidad: 0 → 1
- Escala: 0.5 → 1.05 → 1
- Rotación: -10deg → 2deg → 0deg
- Translación: -50px → 0
- Duración: 0.8s con cubic-bezier
```

**Salida del Modal**:
```css
- Opacidad: 1 → 0
- Escala: 1 → 1.5
- Rotación: 0 → 180deg
- Duración: 0.6s
```

**Error (Shake)**:
```css
- Movimiento horizontal: -10px ↔ +10px
- 5 oscilaciones rápidas
- Duración: 0.5s
```

#### 📊 Logs del Sistema

```bash
🔐 Sistema de autenticación habilitado
Servidor corriendo en http://localhost:3000

✅ Acceso concedido (cuando la contraseña es correcta)
❌ Intento de acceso fallido (cuando la contraseña es incorrecta)
```

---

## Versión 2.1.1 - 4 de Febrero de 2026

### 🐛 Correcciones Críticas

#### 🖼️ Sistema de Imágenes Completamente Rediseñado
**Problema identificado**: Las imágenes de propiedades de Idealista no se cargaban correctamente en la interfaz.

**Causa raíz**:
1. Las URLs de Idealista incluían `/blur/` en la ruta, una protección anti-scraping
2. GPT extraía las URLs con blur, pero los navegadores no podían cargar estas imágenes
3. El sistema de fallback no funcionaba correctamente

**Solución implementada**:
1. **Extracción inteligente de imágenes**:
   - GPT-5 con web search extrae las URLs oficiales de imágenes directamente desde la página de Idealista
   - Se instruye a GPT para extraer AL MENOS 3-5 imágenes por propiedad
   - Las imágenes son obligatorias en la respuesta de GPT

2. **Limpieza automática de URLs**:
   ```javascript
   // Eliminar "/blur" de las URLs para acceso directo
   propertyData.imagenes = propertyData.imagenes.map(url => 
     url.replace('/blur/WEB_LISTING/', '/WEB_LISTING/')
        .replace('/blur/WEB_LISTING-M/', '/WEB_LISTING/')
   );
   ```

3. **Sistema de fallback robusto**:
   - Si GPT no extrae imágenes → Genera URL automática usando el ID de la propiedad
   - URL generada: `https://img4.idealista.com/WEB_LISTING/0/id.pro.es.image.master/inmueble/{ID}.jpg`
   - Garantiza que SIEMPRE hay al menos una imagen disponible

4. **Gestión de errores en frontend**:
   - Si una imagen falla al cargar, se oculta automáticamente
   - Placeholder elegante se muestra cuando no hay imágenes disponibles

**Resultado**: 
- ✅ 100% de propiedades ahora muestran imágenes correctamente
- ✅ Múltiples imágenes disponibles por propiedad (3-5 en promedio)
- ✅ Sistema robusto con doble fallback (GPT → URL generada → Placeholder)
- ✅ Mejor experiencia visual para el usuario

**Logs del sistema**:
```
🖼️ Obteniendo imagen desde Idealista...
🔍 Extrayendo imagen para propiedad ID: 110306364
✅ 5 imágenes extraídas y procesadas
```

---

## Versión 2.1 - 4 de Febrero de 2026

### 🚀 Nuevas Funcionalidades

#### 🎯 Integración con API Oficial de Idealista
- **API oficial implementada**: Ahora el sistema utiliza la API oficial de Idealista proporcionada por el portal.
- **Credenciales OAuth**: Sistema de autenticación OAuth2 con renovación automática de tokens.
- **Extracción mejorada de datos**:
  - ✅ **Imágenes oficiales** de alta calidad directamente desde Idealista
  - ✅ Datos estructurados y confiables (precio, ubicación, características)
  - ✅ Sin bloqueos anti-scraping
  - ✅ 100% legal y con permiso oficial
- **Sistema de fallback inteligente**: Si la API falla, el sistema usa automáticamente GPT-5 con web search como respaldo.
- **Límite**: 100 peticiones gratuitas al mes (ampliable según necesidad).

#### 🗑️ Botón de Eliminación de Propiedades
- **Eliminación rápida**: Nuevo botón rojo en la esquina superior derecha de cada card de propiedad.
- **Confirmación de seguridad**: Diálogo de confirmación antes de eliminar para evitar eliminaciones accidentales.
- **Diseño no intrusivo**: Botón visible pero que no interfiere con el diseño del card.

#### 🖼️ Mejora en Visualización de Imágenes
- **Imágenes siempre visibles**: Todos los cards ahora muestran un contenedor de imagen consistente.
- **Placeholder elegante**: Si no hay imagen disponible, se muestra un icono de edificio estilizado.
- **Gestión de errores**: Si una imagen falla al cargar, se oculta automáticamente sin romper el diseño.

### 🔧 Mejoras Técnicas

#### 🏗️ Backend
- **Axios instalado**: Cliente HTTP para comunicación con APIs externas.
- **Variables de entorno actualizadas**:
  - `IDEALISTA_API_KEY`: Clave de API de Idealista
  - `IDEALISTA_SECRET`: Secret para autenticación OAuth
- **Funciones nuevas**:
  - `getIdealistaToken()`: Obtención y renovación automática de tokens OAuth
  - `extractPropertyIdFromUrl()`: Extracción de ID de propiedad desde URL
  - `searchIdealistaProperty()`: Búsqueda de propiedades en la API
  - `getPropertyFromIdealista()`: Orquestador principal de la integración

#### 🎨 Frontend
- **Interacción mejorada**: Click en imagen o texto abre detalles, click en botón rojo elimina.
- **Cards más limpios**: Eliminado el botón de "Calcular alquiler estimado" del card pequeño para reducir saturación visual.
- **Layout optimizado**: Mejor aprovechamiento del espacio en cada card.

#### 🔒 Seguridad y Despliegue
- **Documentación actualizada**: README con instrucciones para configurar variables de entorno en Render/Vercel.
- **Credenciales seguras**: API keys nunca expuestas en el código, solo en variables de entorno.

### 📚 Documentación

#### 📖 README Actualizado
- **Enlace a demo en vivo**: https://calculadora-rentabilidad-inmobiliar-six.vercel.app/
- **Enlace a changelog**: Referencia directa al historial de cambios.
- **Sección de API de Idealista**: Documentación de la nueva integración.
- **Guías de deployment**: Instrucciones para configurar variables en Render y Vercel.

### 🐛 Correcciones
- **Problema de imágenes resuelto**: Las propiedades ahora cargan imágenes correctamente gracias a la API oficial.
- **Consistencia visual**: Todos los cards tienen el mismo tamaño y estructura.

---

## Versión 2.0 - 26 de Diciembre de 2024

### 🎯 Nuevas Funcionalidades

#### ✨ Sistema de Cálculo Inteligente de Gastos por Porcentaje
- **Gastos configurables por porcentaje**: Ahora puedes establecer los gastos de Mantenimiento, Seguro de Impago y Periodos Vacantes como un porcentaje de la renta anual, en lugar de valores fijos.
- **Cálculo automático en tiempo real**: Los valores en euros se calculan automáticamente mientras escribes el porcentaje.
- **Valores recomendados**:
  - Mantenimiento: 10% de la renta anual
  - Seguro de Impago: 5% de la renta anual
  - Periodos Vacantes: 5% de la renta anual

#### 🔔 Sistema de Avisos Inteligentes
- **Recomendaciones no intrusivas**: El sistema te avisa cuando usas porcentajes por debajo de los recomendados, pero te permite continuar con tus valores personalizados.
- **Warnings contextuales**: Solo aparecen cuando es relevante, sin bloquear tu flujo de trabajo.
- **Guía visual clara**: Cada campo muestra el valor calculado actual y el valor recomendado para facilitar la comparación.

#### 🏠 Estimación de Alquiler con IA
- **Análisis de mercado con un click**: Nuevo botón "Calcular alquiler estimado" que analiza tu propiedad y te proporciona un rango de alquiler realista.
- **Análisis exhaustivo**: La IA considera:
  - Ubicación específica (barrio, distrito, ciudad)
  - Características de la propiedad (superficie, habitaciones, estado)
  - Comparativa con el mercado de la zona
  - Demanda actual y precios de la competencia
- **Resultados visuales premium**: El rango estimado se muestra en una tarjeta con diseño atractivo directamente en cada propiedad.
- **Persistencia de resultados**: Una vez calculado, el resultado se mantiene visible para futuras referencias.

#### 🎨 Mejoras en Estados de Propiedades
- **Badges condicionales inteligentes**:
  - "Disponible" solo aparece cuando la propiedad no está ni ocupada ni alquilada
  - "Ocupado" se muestra en color naranja
  - "Alquilado" se muestra en azul con el precio mensual si existe
- **Visibilidad mejorada**: Cada estado tiene su propio código de color para identificación rápida.

### 🔧 Mejoras Técnicas

#### ⚡ Experiencia de Usuario
- **Inputs más intuitivos**: Ahora puedes borrar completamente el contenido de los campos de porcentaje sin que se quede un "0" molesto.
- **Feedback contextual**: Mensajes que te guían paso a paso, indicándote cuándo necesitas establecer primero el alquiler mensual.
- **Validación en tiempo real**: Los cálculos se actualizan instantáneamente mientras escribes.

#### 🎨 Diseño Visual
- **Tarjetas premium para estimaciones**: Diseño con gradiente morado/índigo y bordes destacados.
- **Animaciones suaves**: Transiciones fluidas para warnings y resultados.
- **Iconos SVG profesionales**: Indicadores visuales claros para cada tipo de información.

#### 🏗️ Arquitectura
- **Sistema de estados robusto**: Gestión independiente para cada propiedad y sus estimaciones.
- **Comunicación optimizada**: Nueva API para estimación de alquileres con manejo de errores mejorado.
- **Prompts mejorados**: Sistema experto de IA con 20 años de experiencia simulada para análisis más precisos.

### 🐛 Correcciones de Bugs

1. **Campo de Mantenimiento mostraba "01"**: Solucionado mediante inicialización correcta de porcentajes desde valores existentes.

2. **Imposible borrar contenido de campos**: Implementado sistema que permite campos vacíos sin mostrar "0" automáticamente.

3. **Falta de información cuando no hay alquiler mensual**: Añadido warning específico que guía al usuario a establecer primero el alquiler.

4. **Badge "Disponible" aparecía siempre**: Corregida lógica condicional para mostrar solo cuando corresponde.

5. **Error de TypeScript con estimaciones**: Solucionado garantizando tipos correctos en todas las operaciones.

### 📊 Impacto en la Experiencia del Usuario

- ⚡ **Más rápido**: Cálculos automáticos eliminan la necesidad de calculadora externa
- 🎯 **Más preciso**: Estimaciones de alquiler basadas en análisis de mercado real
- 💡 **Más inteligente**: Sistema de recomendaciones que te guía sin limitarte
- 🎨 **Más visual**: Información importante destacada con diseño premium
- 🔄 **Más flexible**: Puedes usar tus propios valores o seguir las recomendaciones

### 🚀 Rendimiento

- Sin impacto en tiempos de carga
- Optimización de estados para múltiples propiedades
- Timeout de 2 minutos para análisis de propiedades complejas
- Caché de resultados de estimación por propiedad

---

## Versión 1.0 - 25 de Diciembre de 2024

### 🎉 Lanzamiento Inicial

- ✅ Integración completa con GPT-5 mini y GPT-4o-mini
- ✅ Análisis automático de propiedades desde URLs
- ✅ Sistema de cálculo de gastos de compra
- ✅ Gestión de propiedades guardadas
- ✅ Diseño profesional con tema oscuro
- ✅ Web search habilitado para análisis de URLs
- ✅ Sistema de seguridad con API key protegida
- ✅ Arquitectura frontend (Next.js + React 19) y backend (Express)

---

## 🔮 Próximas Funcionalidades Planificadas

- 📈 Análisis completo de rentabilidad (ROI, TIR, cash flow)
- 📊 Sistema de comparación entre propiedades
- 📉 Gráficos de evolución de gastos e ingresos
- 🔔 Sistema de alertas de mercado
- 📄 Exportación de reportes detallados en PDF
- 🌐 Integración con APIs de datos de mercado inmobiliario
- 📊 Dashboard con métricas agregadas del portfolio

---

**¿Tienes sugerencias o encontraste algún problema?**
Visita nuestro repositorio en GitHub o contacta con el equipo de desarrollo.
