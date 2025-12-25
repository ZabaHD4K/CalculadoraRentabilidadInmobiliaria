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

// Endpoint de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend de RealStateAI funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Prueba el endpoint GPT en: http://localhost:${PORT}/api/hello-gpt`);
});
