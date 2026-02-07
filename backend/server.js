require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para producción
const allowedOrigins = [
  'https://calculadora-rentabilidad-inmobiliar-six.vercel.app',
  process.env.FRONTEND_URL, // URL desde variable de entorno
].filter(Boolean); // Eliminar valores undefined

console.log('🌐 CORS: Orígenes permitidos:', allowedOrigins);

// CORS config robusta para producción
const corsOptions = {
  origin: (origin, callback) => {
    console.log('📨 Request desde origen:', origin);

    // Permite requests sin origin (Postman, server-to-server, mismo dominio)
    if (!origin) {
      console.log('✅ Sin origin - permitido');
      return callback(null, true);
    }

    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin en lista permitida');
      return callback(null, true);
    }

    // Permitir todos los subdominios de Vercel (para preview deployments)
    if (origin.endsWith('.vercel.app')) {
      console.log('✅ Dominio Vercel detectado - permitido');
      return callback(null, true);
    }

    // En desarrollo, permitir localhost (siempre, no solo en development)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('✅ Localhost detectado - permitido');
      return callback(null, true);
    }

    console.log('❌ CORS Error: Origin no permitido:', origin);
    return callback(new Error(`CORS Error: ${origin} no permitido`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Para navegadores legacy
};

app.use(cors(corsOptions));

// Log adicional para debugging en producción
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'sin origin'}`);
  next();
});

// Middleware para parsear JSON
app.use(express.json());

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Contraseña de acceso (hash SHA-256 almacenado en variable de entorno)
const crypto = require('crypto');
const ACCESS_PASSWORD_HASH = process.env.ACCESS_PASSWORD_HASH;
if (!ACCESS_PASSWORD_HASH) {
  console.error('⚠️ ACCESS_PASSWORD_HASH no configurado en .env');
}
console.log('🔐 Sistema de autenticación habilitado');


// ==================== AUTHENTICATION ====================

// Endpoint para verificar contraseña
app.post('/api/verify-password', (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña requerida'
      });
    }

    // Hash de la contraseña proporcionada
    const inputHash = crypto.createHash('sha256').update(password).digest('hex');

    // Comparar con el hash almacenado
    if (inputHash === ACCESS_PASSWORD_HASH) {
      console.log('✅ Acceso concedido');
      return res.json({
        success: true,
        message: 'Contraseña correcta'
      });
    } else {
      console.log('❌ Intento de acceso fallido');
      return res.status(401).json({
        success: false,
        error: 'Contraseña incorrecta'
      });
    }
  } catch (error) {
    console.error('Error en verificación:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al verificar contraseña'
    });
  }
});

// ==================== GPT ENDPOINTS ====================

// Endpoint para analizar propiedad de Idealista
app.post('/api/analyze-property', async (req, res) => {
  // Aumentar timeout para esta ruta específica
  req.setTimeout(120000); // 2 minutos

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'El campo "url" es requerido'
      });
    }

    console.log('\n=== Analizando propiedad ===');
    console.log('URL:', url);

    // PASO 1: Dejar que GPT extraiga todo (sistema simple que funcionaba ayer)
    console.log('🖼️ GPT extraerá los datos y las URLs de las imágenes...');
    const idealistaImage = null; // Simplificado: GPT hace todo

    // PASO 2: Usar GPT-5 para extraer toda la información
    console.log('🔄 Extrayendo datos con GPT-5 (puede tardar 30-60 segundos)...');

    let propertyData;

    // Usar GPT-5 para extraer información de la propiedad
    const prompt = `Analiza este enlace de propiedad inmobiliaria de Idealista y extrae la información disponible en formato JSON estricto.

**IMPORTANTE: Debes acceder a la página web usando web search para obtener el contenido real.**

URL: ${url}

Debes extraer:
- nombre: nombre/título de la propiedad
- direccion: dirección completa
- precio: precio de compra/venta (solo el número, sin símbolos)
- superficie: metros cuadrados (solo el número)
- habitaciones: número de habitaciones
- banos: número de baños
- alquilerMensual: si aparece precio de alquiler estimado
- gastosAnuales: gastos anuales estimados (IBI, comunidad, etc.)
- descripcion: descripción completa de la propiedad
- caracteristicas: array con todas las características (ascensor, terraza, etc.)
- estado: si está disponible, reservado, vendido, alquilado
- tipoPropiedad: piso, casa, local, etc.

FORMATO DE RESPUESTA:
1. Responde SOLO con el objeto JSON, sin texto adicional antes ni después
2. Si no encuentras un dato, usa null
3. Los números deben ser números, no strings

Ejemplo de formato:
{
  "nombre": "Piso en Calle Mayor",
  "direccion": "Calle Mayor 123, Madrid",
  "precio": 250000,
  "superficie": 80,
  "habitaciones": 2,
  "banos": 1,
  "alquilerMensual": 800,
  "gastosAnuales": 1500,
  "descripcion": "Precioso piso...",
  "caracteristicas": ["ascensor", "terraza", "exterior"],
  "estado": "disponible",
  "tipoPropiedad": "piso"
}`;

    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      input: [
        {
          role: 'user',
          content: prompt
        }
      ],
      text: {
        format: {
          type: 'text'
        },
        verbosity: 'medium'
      },
      reasoning: {
        effort: 'medium'
      },
      tools: [
        {
          type: 'web_search'
        }
      ],
      store: true,
      include: [
        'reasoning.encrypted_content',
        'web_search_call.action.sources'
      ]
    });

    let gptResponse;
    if (response.output_text) {
      gptResponse = response.output_text;
    } else if (response.output && response.output.length > 0) {
      const messageOutput = response.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
        gptResponse = messageOutput.content[0].text;
      } else {
        gptResponse = 'Sin respuesta';
      }
    } else {
      gptResponse = 'Sin respuesta en formato desconocido';
    }

    console.log('Respuesta de GPT:', gptResponse);

    // Intentar parsear el JSON
    try {
      // Limpiar la respuesta por si tiene markdown
      let cleanResponse = gptResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      propertyData = JSON.parse(cleanResponse);
      console.log('✅ Datos parseados correctamente desde GPT');

      // Generar ID único para la propiedad
      const propertyId = Date.now().toString();
      propertyData.id = propertyId;
    } catch (parseError) {
      console.error('❌ Error al parsear JSON desde GPT:', parseError);
      return res.status(500).json({
        success: false,
        error: 'No se pudo parsear la respuesta como JSON',
        rawResponse: gptResponse
      });
    }

    // Enviar respuesta con los datos combinados (incluye ID generado)
    res.json({
      success: true,
      data: propertyData,
      source: idealistaImage ? 'GPT-5 + Idealista Image' : 'GPT-5 Only'
    });

  } catch (error) {
    console.error('Error en /api/analyze-property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al analizar la propiedad',
      details: error.message
    });
  }
});

// Almacenamiento temporal de propiedades (en memoria)
let properties = [];

// Endpoint para guardar una propiedad
app.post('/api/properties', async (req, res) => {
  try {
    const propertyData = req.body;

    // Usar el ID existente (si viene del análisis) o generar uno nuevo
    const property = {
      id: propertyData.id || Date.now().toString(),
      ...propertyData,
      createdAt: new Date().toISOString()
    };

    properties.push(property);

    console.log('\n=== Propiedad guardada ===');
    console.log('ID:', property.id);
    console.log('Nombre:', property.nombre);

    res.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('Error al guardar propiedad:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al guardar la propiedad',
      details: error.message
    });
  }
});

// Endpoint para obtener todas las propiedades
app.get('/api/properties', (req, res) => {
  res.json({
    success: true,
    properties
  });
});

// Endpoint para eliminar una propiedad
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = properties.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }

    // Borrar la propiedad del array
    properties.splice(index, 1);

    res.json({
      success: true,
      message: 'Propiedad eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar propiedad:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la propiedad',
      details: error.message
    });
  }
});

// Endpoint para actualizar una propiedad existente
app.put('/api/properties/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    const index = properties.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }
    
    // Actualizar la propiedad manteniendo el ID y createdAt original
    properties[index] = {
      ...properties[index],
      ...updatedData,
      id: properties[index].id,
      createdAt: properties[index].createdAt,
      updatedAt: new Date().toISOString()
    };
    
    console.log('\n=== Propiedad actualizada ===');
    console.log('ID:', id);
    console.log('Precio:', properties[index].precio);
    console.log('Alquiler mensual:', properties[index].alquilerMensual);
    console.log('Gastos anuales:', properties[index].gastosAnuales);
    console.log('Capital propio:', properties[index].capitalPropio);
    console.log('Plazo hipoteca:', properties[index].plazoHipoteca);
    console.log('Tipo interés:', properties[index].tipoInteres);
    
    res.json({
      success: true,
      property: properties[index]
    });
    
  } catch (error) {
    console.error('Error al actualizar propiedad:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la propiedad',
      details: error.message
    });
  }
});

// Endpoint para estimar alquiler con GPT-5-mini + web search
app.post('/api/estimate-rent', async (req, res) => {
  try {
    const propertyData = req.body;

    console.log('\n=== Estimando alquiler ===');
    console.log('Propiedad:', propertyData.nombre);

    const fechaActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const prompt = `Eres un experto en tasación de alquileres inmobiliarios en España. Busca en internet alquileres de propiedades similares en la misma zona y estima un rango de alquiler mensual realista basándote en datos reales del mercado actual.

DATOS DE LA PROPIEDAD:
- Ubicación: ${propertyData.direccion}
${propertyData.comunidadAutonoma ? `- Comunidad Autónoma: ${propertyData.comunidadAutonoma}` : ''}
- Tipo: ${propertyData.tipoPropiedad}
- Superficie: ${propertyData.superficie}m²
- Habitaciones: ${propertyData.habitaciones}
- Baños: ${propertyData.banos}
- Precio de compra: ${propertyData.precio}€
${propertyData.descripcion ? `- Descripción completa: ${propertyData.descripcion}` : ''}
${propertyData.caracteristicas && propertyData.caracteristicas.length > 0 ? `- Características específicas: ${propertyData.caracteristicas.join(', ')}` : ''}

INSTRUCCIONES:

1. **Busca en internet** alquileres reales de propiedades similares en la misma zona (Idealista, Fotocasa, pisos.com u otros portales).
2. Analiza la ubicación específica: barrio, distrito, demanda, cercanía a transporte y servicios.
3. Considera las características: estado, calidades, extras (terraza, garaje, ascensor, etc.).
4. Usa el precio de compra de ${propertyData.precio}€ como referencia de coherencia (rentabilidad típica 3-6% bruto anual).
5. Proporciona un rango REALISTA de alquiler mensual actual (${fechaActual}).

Responde ÚNICAMENTE con un JSON válido en este formato exacto, sin texto adicional ni markdown:
{"min": 1400, "max": 1700, "media": 1550, "confianza": "alta", "justificacion": "Breve explicación de 1-2 frases con los datos de mercado consultados"}

El campo "confianza" debe ser "alta", "media" o "baja" según la cantidad de datos de mercado encontrados.`;

    let estimate;

    // Intentar con GPT-5-mini + web search (acceso a datos reales de mercado)
    try {
      console.log('🔍 Intentando estimación con GPT-5-mini + web search...');
      const response = await openai.responses.create({
        model: 'gpt-5-mini',
        input: [
          {
            role: 'user',
            content: prompt
          }
        ],
        text: {
          format: {
            type: 'text'
          },
          verbosity: 'medium'
        },
        reasoning: {
          effort: 'medium'
        },
        tools: [
          {
            type: 'web_search'
          }
        ],
        store: true
      });

      let gptResponse;
      if (response.output_text) {
        gptResponse = response.output_text;
      } else if (response.output && response.output.length > 0) {
        const messageOutput = response.output.find(item => item.type === 'message');
        if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
          gptResponse = messageOutput.content[0].text;
        }
      }

      if (gptResponse) {
        // Limpiar markdown si viene envuelto
        let cleanResponse = gptResponse.trim();
        if (cleanResponse.startsWith('```json')) {
          cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/```\n?/g, '');
        }

        estimate = JSON.parse(cleanResponse);
        console.log('✅ Estimación con GPT-5-mini + web search exitosa:', estimate);
      } else {
        throw new Error('Sin respuesta de GPT-5-mini');
      }

    } catch (gpt5Error) {
      // Fallback a GPT-4o sin web search
      console.log('⚠️ Fallback a GPT-4o:', gpt5Error.message);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto tasador de propiedades inmobiliarias en España con 20 años de experiencia. Responde SOLO con JSON válido, sin texto adicional ni markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_completion_tokens: 400
      });

      let fallbackResponse = completion.choices[0].message.content.trim();
      if (fallbackResponse.startsWith('```json')) {
        fallbackResponse = fallbackResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (fallbackResponse.startsWith('```')) {
        fallbackResponse = fallbackResponse.replace(/```\n?/g, '');
      }

      estimate = JSON.parse(fallbackResponse);
      console.log('✅ Estimación con GPT-4o (fallback) exitosa:', estimate);
    }

    // Construir string de rango para compatibilidad con el frontend
    const rangeStr = `${estimate.min}-${estimate.max}€/mes`;

    res.json({
      success: true,
      estimate: rangeStr,
      min: estimate.min,
      max: estimate.max,
      media: estimate.media,
      confianza: estimate.confianza,
      justificacion: estimate.justificacion
    });

  } catch (error) {
    console.error('Error en /api/estimate-rent:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al estimar el alquiler',
      details: error.message
    });
  }
});

// Endpoint para calcular gastos de compra con GPT
app.post('/api/calculate-expenses', async (req, res) => {
  try {
    const propertyData = req.body;

    console.log('\n=== Calculando gastos ===');
    console.log('Propiedad:', propertyData.nombre);
    console.log('Precio:', propertyData.precio);

    const prompt = `Eres un experto inmobiliario en España. Basándote en los siguientes datos, calcula los gastos de compra de esta propiedad.

DATOS DE LA PROPIEDAD:
- Precio: ${propertyData.precio}€
- Ubicación: ${propertyData.direccion}
- Tipo: ${propertyData.tipoPropiedad}
- Superficie: ${propertyData.superficie}m²

Calcula y devuelve SOLO un objeto JSON con estos campos (números sin símbolos):
{
  "comunidadAutonoma": "nombre de la comunidad autónoma donde está la propiedad",
  "esObraNueva": true/false (según si es obra nueva o segunda mano),
  "notariaCompra": "entre 600-900€ típicamente",
  "registroCompra": "entre 400-600€ típicamente",
  "comisionAgencia": "si hay comisión de agencia, típicamente 3-5% del precio, si no, 0",
  "gestoriaHipoteca": "entre 300-500€",
  "tasacion": "entre 250-400€",
  "comisionApertura": "típicamente 0-1% del precio de compra"
}

IMPORTANTE:
1. Responde SOLO con el objeto JSON, sin texto adicional
2. Todos los valores numéricos deben ser números, no strings
3. La comunidadAutonoma debe ser exacta: "Madrid", "Cataluña", "Andalucía", "País Vasco", etc.
4. esObraNueva: true si es construcción reciente (menos de 2 años), false si es segunda mano`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en gastos de compraventa inmobiliaria en España. Proporciona estimaciones precisas y realistas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_completion_tokens: 300
    });

    let gptResponse = completion.choices[0].message.content.trim();
    console.log('Respuesta GPT:', gptResponse);

    // Limpiar respuesta
    if (gptResponse.startsWith('```json')) {
      gptResponse = gptResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (gptResponse.startsWith('```')) {
      gptResponse = gptResponse.replace(/```\n?/g, '');
    }

    const expenses = JSON.parse(gptResponse);

    res.json({
      success: true,
      expenses
    });

  } catch (error) {
    console.error('Error en /api/calculate-expenses:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al calcular gastos',
      details: error.message
    });
  }
});

// Endpoint para calcular gastos de la vivienda con GPT (análisis inteligente)
app.post('/api/calculate-housing-expenses', async (req, res) => {
  try {
    const propertyData = req.body;

    console.log('\n=== Calculando gastos de vivienda con análisis inteligente ===');
    console.log('Propiedad:', propertyData.nombre);
    console.log('Ubicación:', propertyData.direccion);

    const prompt = `Eres un experto inmobiliario en España. Analiza en PROFUNDIDAD esta propiedad específica y calcula gastos realistas para la tercera pestaña (Gastos de la Vivienda).

DATOS DE LA PROPIEDAD:
- Nombre: ${propertyData.nombre}
- Ubicación: ${propertyData.direccion}
- Tipo: ${propertyData.tipoPropiedad}
- Superficie: ${propertyData.superficie}m²
- Precio: ${propertyData.precio}€
- Habitaciones: ${propertyData.habitaciones}
- Baños: ${propertyData.banos}
- Descripción: ${propertyData.descripcion || 'No disponible'}
- Características: ${propertyData.caracteristicas && propertyData.caracteristicas.length > 0 ? propertyData.caracteristicas.join(', ') : 'No disponible'}

IMPORTANTE - ANALIZA CUIDADOSAMENTE:
1. **Comunidad Anual (comunidadAnual)**:
   - Busca propiedades SIMILARES en la MISMA ZONA específica
   - Considera si tiene PISCINA, ASCENSOR, PORTERO, GIMNASIO, ZONAS COMUNES
   - Una piscina comunitaria puede añadir 200-500€ anuales
   - Ascensor y portero pueden añadir 300-600€ anuales
   - En edificios antiguos sin servicios: 400-800€/año
   - En edificios modernos con servicios: 800-1500€/año
   - Propiedades de lujo: 1500-3000€/año

2. **Seguro del Hogar (seguroHogar)**:
   - Depende del VALOR de la propiedad y CONTENIDOS
   - Propiedades hasta 150.000€: 80-120€/año
   - Propiedades 150.000-300.000€: 120-180€/año
   - Propiedades 300.000-500.000€: 180-250€/año
   - Propiedades >500.000€: 250-400€/año

3. **Seguro de Vida Hipoteca (seguroVidaHipoteca)**:
   - Depende del PRECIO de la propiedad y AÑOS de hipoteca
   - Propiedades hasta 200.000€: 100-150€/año
   - Propiedades 200.000-400.000€: 150-250€/año
   - Propiedades >400.000€: 250-400€/año

4. **IBI (ibi)**:
   - Investiga el IBI típico de la ZONA ESPECÍFICA
   - Depende del VALOR CATASTRAL (aproximadamente 40-60% del precio de mercado)
   - Madrid centro: 0.4-0.5% del valor catastral
   - Otras ciudades: 0.5-1.1% del valor catastral
   - Ejemplo: piso 250.000€ → valor catastral ~125.000€ → IBI ~500-1000€/año

Devuelve SOLO un objeto JSON con estos campos (números sin símbolos):
{
  "comunidadAnual": número entero,
  "seguroHogar": número entero,
  "seguroVidaHipoteca": número entero,
  "ibi": número entero
}

RESPONDE SOLO CON EL JSON, sin texto adicional ni markdown.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis inmobiliario en España. Analiza cada propiedad de forma específica y proporciona estimaciones realistas basadas en sus características únicas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_completion_tokens: 300
    });

    let gptResponse = completion.choices[0].message.content.trim();
    console.log('Respuesta GPT (gastos vivienda):', gptResponse);

    // Limpiar respuesta
    if (gptResponse.startsWith('```json')) {
      gptResponse = gptResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (gptResponse.startsWith('```')) {
      gptResponse = gptResponse.replace(/```\n?/g, '');
    }

    const housingExpenses = JSON.parse(gptResponse);

    res.json({
      success: true,
      expenses: housingExpenses
    });

  } catch (error) {
    console.error('Error en /api/calculate-housing-expenses:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al calcular gastos de vivienda',
      details: error.message
    });
  }
});

// Endpoint para obtener el Euribor actual
app.get('/api/euribor', async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('=== CONSULTANDO EURIBOR ACTUAL ===');
    console.log('========================================');

    // Obtener la fecha actual
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    console.log('Fecha de consulta:', fechaActual);
    console.log('API del Banco de España\n');

    // Hacer petición a la API del Banco de España
    const apiUrl = 'https://app.bde.es/bierest/resources/srdatosapp/favoritas?idioma=es&series=D_1NBAF472';
    
    console.log('Consultando API del BdE...');
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Error en la API del BdE: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Respuesta de la API:');
    console.log(JSON.stringify(data, null, 2));

    // Extraer el valor del Euribor
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('La API no devolvió datos válidos');
    }

    const euriborData = data[0];
    const euribor = euriborData.valor;
    const fechaValor = new Date(euriborData.fechaValor).toLocaleDateString('es-ES');

    console.log('\n✓ Euribor obtenido exitosamente:', euribor + '%');
    console.log('Fecha del dato:', fechaValor);
    console.log('====================\n');

    res.json({
      success: true,
      euribor: euribor,
      fecha: fechaValor
    });

  } catch (error) {
    console.error('\n!!! ERROR al obtener Euribor !!!');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('====================\n');
    
    res.status(500).json({
      success: false,
      error: error.message,
      // Valor de fallback
      euribor: 2.5
    });
  }
});

// Endpoint de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend de RealEstateAI funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
