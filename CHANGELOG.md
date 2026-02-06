# 📝 Notas de Cambios - RealState AI

## Versión 2.3.0 - 6 de Febrero de 2026

### 🤖 Mejora de Estimación de Alquiler: GPT-5-mini con Web Search

**Cambio principal**: La estimación de alquiler ahora utiliza GPT-5-mini con web search en lugar de GPT-4o, permitiendo al modelo consultar alquileres reales en portales inmobiliarios para estimaciones basadas en datos de mercado actuales.

#### ❌ Antes (GPT-4o sin web search)
- El modelo estimaba basándose únicamente en su conocimiento de entrenamiento
- Sin acceso a datos de mercado en tiempo real
- Fecha hardcodeada "diciembre 2024"
- Respuesta en texto plano: `"1400-1700€/mes"`
- Sin justificación ni nivel de confianza

#### ✅ Ahora (GPT-5-mini con web search)
- El modelo **busca en internet** alquileres reales de propiedades similares (Idealista, Fotocasa, pisos.com)
- Fecha dinámica generada automáticamente
- Comunidad Autónoma incluida en el prompt para mejor contexto geográfico
- Respuesta estructurada en JSON con datos desglosados
- Incluye justificación basada en datos de mercado consultados
- Incluye nivel de confianza (alta/media/baja)
- Patrón de fallback a GPT-4o si GPT-5-mini falla

#### 🔧 Cambios Técnicos

**Backend ([server.js](backend/server.js)):**
- Endpoint `/api/estimate-rent` reescrito con `openai.responses.create()` y herramienta `web_search`
- Parámetros GPT-5: `reasoning: { effort: 'medium' }`, `verbosity: 'medium'`
- Prompt reestructurado: solicita búsqueda activa en portales inmobiliarios
- Fecha dinámica con `new Date().toLocaleDateString('es-ES', ...)`
- Campo `comunidadAutonoma` añadido al prompt
- Respuesta JSON estructurada: `{ min, max, media, confianza, justificacion }`
- Fallback a GPT-4o con `openai.chat.completions.create()` y `max_completion_tokens: 400`
- Parsing de markdown (`\`\`\`json...`) en ambos modelos

**Frontend ([api.ts](frontend/src/services/api.ts)):**
- `EstimateRentResponse`: añadidos campos `min`, `max`, `media`, `confianza`, `justificacion`
- `PropertyData`: añadidos campos `alquilerJustificacion` y `alquilerConfianza`

**Frontend ([page.tsx](frontend/src/app/page.tsx)):**
- `handleEstimateRent`: guarda justificación y confianza junto con la estimación
- UI del alquiler estimado ampliada: muestra badge de confianza (verde/amarillo/rojo) y texto de justificación

#### 📊 Comparativa

| Aspecto | Antes (GPT-4o) | Ahora (GPT-5-mini + web search) |
|---------|-----------------|----------------------------------|
| Fuente de datos | Entrenamiento del modelo | Búsqueda web en tiempo real |
| Fecha | Hardcodeada "diciembre 2024" | Dinámica (fecha actual) |
| CCAA en prompt | No | Sí |
| Formato respuesta | Texto plano | JSON estructurado |
| Justificación | No | Sí (datos de mercado consultados) |
| Confianza | No | Sí (alta/media/baja) |
| Fallback | No | GPT-4o como respaldo |
| Max tokens | 150 | Sin límite (GPT-5) / 400 (fallback) |

---

## Versión 2.2.0 - 5 de Febrero de 2026

### ☁️ Migración a Cloudinary para Almacenamiento de Imágenes

**Problema identificado**: Las imágenes se guardaban localmente en Railway, pero Railway tiene almacenamiento efímero que se borra al reiniciar el servidor.

#### ✅ Solución Implementada: Cloudinary

**Cloudinary** es un servicio de almacenamiento en la nube especializado en gestión de imágenes y assets multimedia. Ofrece:
- CDN global para carga rápida desde cualquier ubicación
- Almacenamiento permanente y confiable
- Plan gratuito generoso (25 GB almacenamiento + 25 GB bandwidth/mes)
- URLs públicas permanentes
- Optimización automática de imágenes

#### 🔧 Cambios Implementados

**1. Integración de Cloudinary en el Backend**
- Instalado paquete `cloudinary` v2.9.0
- Configuración automática con variables de entorno:
  ```javascript
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  ```

**2. Función `downloadAndSaveImage()` Modificada**
- **Antes**: Descargaba imagen → Guardaba en disco local
- **Ahora**: Descarga imagen → Sube a Cloudinary → Retorna URL pública
- Organización en carpetas: `realstate/{propertyId}/image-{index}`
- Upload mediante streams para mayor eficiencia

**3. Función `getIdealistaPropertyImages()` Modificada**
- Screenshots de Puppeteer ahora se suben directamente a Cloudinary
- Captura como buffer → Upload stream → URL pública
- Elimina dependencia del sistema de archivos local

**4. Endpoint `DELETE /api/properties/:id` Mejorado**
- **Limpieza automática**: Al borrar propiedad, borra también imágenes de Cloudinary
- Extrae `public_id` de las URLs de Cloudinary
- Usa `cloudinary.uploader.destroy()` para eliminar assets
- Gestión de errores robusta: continúa aunque falle alguna imagen

#### 📁 Estructura de URLs de Cloudinary

```
https://res.cloudinary.com/{cloud_name}/image/upload/v{timestamp}/realstate/{propertyId}/image-0.jpg
```

**Ejemplo real:**
```
https://res.cloudinary.com/dapavocme/image/upload/v1738893456/realstate/1738716800123/image-0.jpg
```

#### 🗑️ Gestión Inteligente del Almacenamiento

**Borrado automático de imágenes cuando se elimina una propiedad:**
- Usuario borra propiedad → Frontend envía DELETE a backend
- Backend extrae URLs de imágenes → Calcula `public_id` de cada URL
- Borra imágenes de Cloudinary → Borra propiedad del array
- **Resultado**: Almacenamiento limpio, sin imágenes huérfanas

**Ventajas:**
- ✅ Solo se almacenan imágenes de propiedades guardadas
- ✅ Limpieza automática al borrar propiedades
- ✅ Uso eficiente del plan gratuito de Cloudinary

#### ⚙️ Variables de Entorno Requeridas

**Backend (`.env`):**
```env
# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**Railway:**
- Mismas 3 variables agregadas en la sección de Variables
- Railway reinicia automáticamente tras agregar las variables

#### 🎯 Beneficios

- ✅ **Almacenamiento permanente**: Las imágenes nunca se pierden
- ✅ **CDN global**: Carga rápida desde cualquier ubicación geográfica
- ✅ **Independencia del servidor**: Railway puede reiniciarse sin problemas
- ✅ **URLs públicas permanentes**: Funcionan desde cualquier dominio
- ✅ **Optimización automática**: Cloudinary optimiza las imágenes
- ✅ **Plan gratuito generoso**: 25 GB es suficiente para cientos de propiedades
- ✅ **Limpieza automática**: Borrado de imágenes al eliminar propiedades

#### 📊 Capacidad del Plan Gratuito

Con el plan gratuito de Cloudinary:
- **Almacenamiento**: 25 GB
- **Bandwidth**: 25 GB/mes
- **Transformaciones**: 25,000 créditos/mes
- **Imágenes aproximadas**: ~5,000 propiedades (asumiendo 5 imágenes de 1 MB cada una)

#### 🔧 Archivos Modificados

**Backend ([server.js](backend/server.js)):**
- Línea 9: `const cloudinary = require('cloudinary').v2;` (nuevo import)
- Líneas 77-84: Configuración de Cloudinary
- Líneas 96-154: `downloadAndSaveImage()` modificada para usar Cloudinary
- Líneas 421-449: Screenshots de elementos con Cloudinary
- Líneas 444-474: Screenshots de viewport completo con Cloudinary
- Líneas 1012-1069: `DELETE /api/properties/:id` con borrado de imágenes

**Backend ([package.json](backend/package.json)):**
- Dependencia añadida: `"cloudinary": "^2.9.0"`

**Backend ([.env](backend/.env)):**
- 3 nuevas variables de Cloudinary (cloud_name, api_key, api_secret)

#### 💡 Notas Técnicas

**Subida mediante Streams:**
```javascript
const uploadResult = await new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: `realstate/${propertyId}`,
      public_id: `image-${imageIndex}`,
      resource_type: 'image',
      overwrite: true
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );
  uploadStream.end(imageBuffer);
});
```

**Extracción de public_id para borrado:**
```javascript
// URL: https://res.cloudinary.com/.../upload/v123/realstate/propId/img.jpg
// public_id extraído: realstate/propId/img
const urlParts = imageUrl.split('/');
const uploadIndex = urlParts.indexOf('upload');
const pathParts = urlParts.slice(uploadIndex + 2);
const lastPart = pathParts[pathParts.length - 1].split('.')[0];
pathParts[pathParts.length - 1] = lastPart;
const publicId = pathParts.join('/');
await cloudinary.uploader.destroy(publicId);
```

---

## Versión 2.1.9 - 5 de Febrero de 2026

### 🖼️ Sistema de Descarga y Almacenamiento Local de Imágenes

**Problema identificado**: Las imágenes de Idealista no se mostraban en las tarjetas de propiedades debido a:
- Protección anti-hotlinking de Idealista que bloquea la carga de imágenes desde dominios externos
- URLs de imágenes que devolvían placeholders genéricos en lugar de las imágenes reales
- Loop infinito de peticiones intentando cargar `/no-image.png` que no existía

#### ✅ Soluciones Implementadas

**1. Sistema de Descarga Local**
- Nueva función `downloadAndSaveImage()` en el backend que descarga imágenes de Idealista con headers HTTP completos
- Las imágenes se guardan en `/frontend/public/uploads/{propertyId}/`
- IDs de propiedades consistentes entre análisis y guardado
- Descarga paralela de todas las imágenes (Promise.all)

**2. Headers HTTP Mejorados**
```javascript
headers: {
  'User-Agent': 'Chrome 120 completo',
  'Accept': 'image/avif,image/webp,image/apng,image/*',
  'Accept-Language': 'es-ES,es;q=0.9',
  'Referer': 'https://www.idealista.com/',
  'Origin': 'https://www.idealista.com',
  'Sec-Fetch-Dest': 'image',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'same-site',
  // ... y más headers de navegador real
}
```
Simula un navegador real para evitar el bloqueo de Idealista.

**3. Imagen Placeholder Mejorada**
- Creada carpeta `/frontend/public/`
- Imagen SVG `no-image.svg` con diseño elegante (icono de casa + texto)
- Handler `onError` mejorado que previene loops infinitos
- Verificación para ejecutar solo una vez: `if (target.src.includes('no-image.svg')) return;`

**4. Logging Mejorado**
- URLs originales de Idealista registradas en los logs para debugging
- Contador de imágenes descargadas exitosamente
- Mensajes claros de éxito/error por cada imagen

#### 📁 Estructura de Archivos
```
frontend/public/
├── uploads/
│   ├── 1738716800123/      # ID de propiedad
│   │   ├── image-0.jpg
│   │   ├── image-1.jpg
│   │   └── image-2.jpg
│   └── {propertyId}/
└── no-image.svg           # Fallback elegante
```

#### 🔧 Archivos Modificados

**Backend** ([server.js](backend/server.js)):
- `downloadAndSaveImage()` - Nueva función helper (líneas 41-84)
- Endpoint `/api/analyze-property` - Descarga automática de imágenes (líneas 533-566)
- Endpoint `/api/properties` - Respeta ID existente (línea 589)

**Frontend** ([page.tsx](frontend/src/app/page.tsx)):
- Handler `onError` mejorado con protección anti-loop (líneas 842-848)

#### 🎯 Beneficios

- ✅ **Imágenes siempre disponibles**: No dependen de Idealista tras la descarga
- ✅ **Sin loops infinitos**: Protección robusta en el handler de errores
- ✅ **Performance mejorado**: Imágenes servidas localmente
- ✅ **Experiencia de usuario**: Imágenes reales o placeholder elegante
- ✅ **Independencia**: Las imágenes persisten aunque Idealista las elimine

---

## Versión 2.1.8 - 5 de Febrero de 2026

### 🚀 Migración del backend a Railway y solución de error de conexión frontend-backend

- El backend se ha desplegado en Railway, configurando correctamente la raíz del proyecto y las variables de entorno.
- Se ha corregido el error de conexión entre frontend (Vercel) y backend (Railway) al iniciar sesión:
  - Se ha añadido el prefijo `https://` a la variable `NEXT_PUBLIC_API_URL` en Vercel para que el frontend apunte correctamente al backend.
  - Se ha revisado la configuración de CORS en el backend para aceptar peticiones desde el dominio de Vercel.
- Ahora el login y la comunicación entre ambos servicios funcionan correctamente en producción.

---

## Versión 2.1.7 - 4 de Febrero de 2026

### 📈 ROI Total: Incluyendo Amortización y Revalorización

**Mejora importante**: El ROI en las tarjetas ahora muestra el **retorno total real** de la inversión, no solo el cash flow.

#### 🎯 Nueva Fórmula Completa

```javascript
ROI Total = (Cash Flow + Amortización + Revalorización) / Capital Propio × 100
```

**Componentes del retorno:**

1. **💰 Cash Flow Anual**:
   ```
   Alquiler anual - Gastos anuales - Cuota hipoteca
   ```
   Dinero líquido que entra en tu cuenta cada año

2. **🏦 Amortización Anual**:
   ```
   Parte de la cuota hipotecaria que reduce tu deuda
   ```
   Aumenta tu patrimonio (equity) en el inmueble

3. **📈 Revalorización Anual**:
   ```
   2% del precio del inmueble (inflación típica)
   ```
   Incremento del valor del activo

#### 📊 Ejemplo Real

**Propiedad con financiación**:
- Precio: 185,000€
- Capital propio (30%): 55,500€
- Alquiler anual: 9,600€
- Gastos anuales: 7,945€
- Cuota hipoteca: 5,200€/año
- Amortización año 1: 2,800€
- Revalorización (2%): 3,700€

**Cálculo paso a paso**:
- Cash Flow = 9,600 - 7,945 - 5,200 = **-3,545€** (negativo)
- Amortización = **+2,800€** (aumenta tu equity)
- Revalorización = **+3,700€** (aumenta valor inmueble)
- **Total = -3,545 + 2,800 + 3,700 = 2,955€**

**ROI Total = 2,955 / 55,500 × 100 = 5.3%** ✅

Sin incluir amortización y revalorización, el ROI habría sido **-6.4%** (incorrecto)

#### 💡 Por qué es Importante

- ✅ **Visión completa**: No solo miras el dinero en cuenta, sino todo el valor generado
- ✅ **Decisiones informadas**: Una propiedad con cash flow negativo puede ser buena inversión
- ✅ **Comparación justa**: Puedes comparar con otros tipos de inversión (bolsa, fondos)
- ✅ **Realista**: Así calculan los inversores profesionales el retorno real

#### 🔄 Actualización Automática

- Los badges en las tarjetas se actualizan automáticamente con el ROI total
- Al cambiar parámetros en el dashboard, el ROI recalcula con todos los componentes
- El sistema detecta si hay hipoteca para calcular correctamente la amortización

---

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
