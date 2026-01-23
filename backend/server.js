require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint de prueba que recibe texto y lo envía a GPT
app.post('/api/test', async (req, res) => {
  try {
    const { text } = req.body;

    // Validar que se envió el texto
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'El campo "text" es requerido'
      });
    }

    // Intentar usar GPT-5 mini con la nueva API y web search habilitado
    let gptResponse;
    try {
      const response = await openai.responses.create({
        model: 'gpt-5-mini',
        input: [
          {
            role: 'user',
            content: text
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

      // Extraer correctamente la respuesta de GPT-5
      console.log('Respuesta completa de GPT-5:', JSON.stringify(response, null, 2));

      // GPT-5 devuelve la respuesta en el campo output_text
      if (response.output_text) {
        gptResponse = response.output_text;
      } else if (response.output && response.output.length > 0) {
        // Buscar el mensaje en el array output
        const messageOutput = response.output.find(item => item.type === 'message');
        if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
          gptResponse = messageOutput.content[0].text;
        } else {
          gptResponse = 'Sin respuesta';
        }
      } else if (response.content) {
        gptResponse = response.content;
      } else if (typeof response === 'string') {
        gptResponse = response;
      } else {
        gptResponse = 'Sin respuesta en formato desconocido';
      }
    } catch (error) {
      // Si falla GPT-5, usar GPT-4o-mini como fallback
      console.log('GPT-5 no disponible, usando GPT-4o-mini como fallback');
      console.log('Error:', error.message);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: text
          }
        ],
        max_completion_tokens: 500
      });
      gptResponse = completion.choices[0].message.content;
    }

    // Log en consola
    console.log('\n=== Test Endpoint ===');
    console.log('Texto recibido:', text);
    console.log('Respuesta de GPT:', gptResponse);
    console.log('====================\n');

    // Enviar respuesta al cliente
    res.json({
      success: true,
      response: gptResponse
    });

  } catch (error) {
    console.error('Error en /api/test:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al comunicarse con GPT',
      details: error.message
    });
  }
});

// Endpoint para saludar a GPT
app.get('/api/hello-gpt', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Hola, ¿cómo estás?'
        }
      ],
      max_completion_tokens: 150
    });

    // Imprimir la respuesta en la consola
    const gptResponse = completion.choices[0].message.content;
    console.log('\n=== Respuesta de GPT ===');
    console.log(gptResponse);
    console.log('========================\n');

    // Enviar respuesta al cliente
    res.json({
      success: true,
      message: gptResponse,
      fullResponse: completion
    });

  } catch (error) {
    console.error('Error al comunicarse con GPT:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al comunicarse con GPT',
      details: error.message
    });
  }
});

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
    console.log('Esto puede tardar 30-60 segundos...');

    // Usar GPT-5 para extraer información de la propiedad
    const prompt = `Analiza este enlace de propiedad inmobiliaria de Idealista y extrae TODA la información disponible en formato JSON estricto.

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
- imagenes: array con URLs de todas las imágenes de la propiedad
- estado: si está disponible, reservado, vendido, alquilado
- tipoPropiedad: piso, casa, local, etc.

IMPORTANTE:
1. Responde SOLO con el objeto JSON, sin texto adicional
2. Si no encuentras un dato, usa null
3. Las imágenes deben ser URLs completas y válidas
4. Los números deben ser números, no strings

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
  "imagenes": ["https://...jpg", "https://...jpg"],
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
        effort: 'low'
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
    let propertyData;
    try {
      // Limpiar la respuesta por si tiene markdown
      let cleanResponse = gptResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '');
      }

      propertyData = JSON.parse(cleanResponse);
      console.log('Datos parseados correctamente');
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      return res.status(500).json({
        success: false,
        error: 'No se pudo parsear la respuesta como JSON',
        rawResponse: gptResponse
      });
    }

    res.json({
      success: true,
      data: propertyData
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

    // Generar ID único
    const property = {
      id: Date.now().toString(),
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
app.delete('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const index = properties.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Propiedad no encontrada'
    });
  }

  properties.splice(index, 1);

  res.json({
    success: true,
    message: 'Propiedad eliminada'
  });
});

// Endpoint para estimar alquiler con GPT
app.post('/api/estimate-rent', async (req, res) => {
  try {
    const propertyData = req.body;

    console.log('\n=== Estimando alquiler ===');
    console.log('Propiedad:', propertyData.nombre);

    const prompt = `Eres un experto en tasación de alquileres inmobiliarios en España. Analiza EN PROFUNDIDAD esta propiedad y estima un rango de alquiler mensual realista.

DATOS DE LA PROPIEDAD:
- Ubicación: ${propertyData.direccion}
- Tipo: ${propertyData.tipoPropiedad}
- Superficie: ${propertyData.superficie}m²
- Habitaciones: ${propertyData.habitaciones}
- Baños: ${propertyData.banos}
- Precio de compra: ${propertyData.precio}€
${propertyData.descripcion ? `- Descripción completa: ${propertyData.descripcion}` : ''}
${propertyData.caracteristicas && propertyData.caracteristicas.length > 0 ? `- Características específicas: ${propertyData.caracteristicas.join(', ')}` : ''}

ANÁLISIS REQUERIDO:

1. **Ubicación y zona específica**:
   - Identifica el barrio, distrito y ciudad exactos
   - Analiza si es zona premium, céntrica, residencial o periférica
   - Considera la demanda de alquiler en esa ubicación específica
   - Valora cercanía a transporte, servicios, comercios

2. **Características de la propiedad**:
   - Estado de conservación (nuevo, reformado, a reformar)
   - Calidades (suelos, acabados, materiales)
   - Servicios del edificio (ascensor, portero, piscina, gimnasio)
   - Orientación, vistas, luminosidad
   - Extras (terraza, garaje, trastero, aire acondicionado)

3. **Comparativa de mercado**:
   - Busca alquileres similares en la misma zona
   - Considera propiedades con características parecidas
   - Ajusta según las ventajas/desventajas de esta propiedad

4. **Precio de compra como referencia**:
   - Usa el precio de ${propertyData.precio}€ para validar la estimación
   - La rentabilidad típica en alquiler es 3-6% bruto anual
   - Verifica que el rango sea coherente con el valor del inmueble

Proporciona un rango REALISTA de alquiler mensual actual (diciembre 2024).

Responde ÚNICAMENTE con el rango en este formato exacto: "XXX-YYY€/mes"
Ejemplo para un piso de 100m² en Madrid centro: "1400-1700€/mes"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto tasador de propiedades inmobiliarias en España con 20 años de experiencia. Conoces en detalle el mercado de alquiler en todas las ciudades españolas. Proporciona estimaciones precisas, realistas y basadas en datos del mercado actual.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_completion_tokens: 150
    });

    const estimate = completion.choices[0].message.content.trim();
    console.log('Estimación:', estimate);

    res.json({
      success: true,
      estimate
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
  res.json({ message: 'Backend de RealStateAI funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Prueba el endpoint GPT en: http://localhost:${PORT}/api/hello-gpt`);
});
