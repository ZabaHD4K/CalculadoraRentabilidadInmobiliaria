require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

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

// Contraseña de acceso (hash SHA-256 de "3808")
const crypto = require('crypto');
const ACCESS_PASSWORD_HASH = crypto.createHash('sha256').update('3808').digest('hex');
console.log('🔐 Sistema de autenticación habilitado');

// Credenciales de Idealista API
const IDEALISTA_API_KEY = process.env.IDEALISTA_API_KEY;
const IDEALISTA_SECRET = process.env.IDEALISTA_SECRET;
let idealistaToken = null;
let tokenExpiration = null;

// ==================== HELPER FUNCTIONS ====================

/**
 * Descarga una imagen desde una URL y la guarda localmente
 * @param {string} imageUrl - URL de la imagen a descargar
 * @param {string} propertyId - ID único de la propiedad
 * @param {number} imageIndex - Índice de la imagen (0, 1, 2...)
 * @returns {Promise<string>} Ruta local de la imagen guardada (/uploads/propertyId/image-0.jpg)
 */
async function downloadAndSaveImage(imageUrl, propertyId, imageIndex) {
  try {
    console.log(`📥 Descargando imagen ${imageIndex + 1}: ${imageUrl}`);

    // Descargar imagen con axios (responseType: 'arraybuffer' para binario)
    // Simular un navegador real con headers completos
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.idealista.com/',
        'Origin': 'https://www.idealista.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-site',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      },
      timeout: 15000, // 15 segundos de timeout
      maxRedirects: 5, // Seguir redirects automáticamente
      validateStatus: (status) => status < 500 // Aceptar todos los status < 500
    });

    // Crear directorio si no existe
    const uploadDir = path.join(__dirname, '../frontend/public/uploads', propertyId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Determinar extensión del archivo (jpg por defecto)
    const contentType = response.headers['content-type'] || 'image/jpeg';
    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';

    // Guardar imagen
    const fileName = `image-${imageIndex}.${extension}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, response.data);

    // Retornar ruta pública (relativa para el frontend)
    const publicPath = `/uploads/${propertyId}/${fileName}`;
    console.log(`✅ Imagen guardada: ${publicPath}`);

    return publicPath;

  } catch (error) {
    console.error(`❌ Error descargando imagen ${imageIndex + 1}:`, error.message);
    // Retornar null si falla la descarga
    return null;
  }
}

// ==================== IDEALISTA API INTEGRATION ====================

/**
 * Obtiene un token OAuth de la API de Idealista
 */
async function getIdealistaToken() {
  // Si ya tenemos un token válido, devolverlo
  if (idealistaToken && tokenExpiration && Date.now() < tokenExpiration) {
    return idealistaToken;
  }

  try {
    const credentials = Buffer.from(`${IDEALISTA_API_KEY}:${IDEALISTA_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://api.idealista.com/oauth/token',
      'grant_type=client_credentials&scope=read',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    idealistaToken = response.data.access_token;
    // El token dura 3600 segundos (1 hora), lo renovamos 5 minutos antes
    tokenExpiration = Date.now() + ((response.data.expires_in - 300) * 1000);
    
    console.log('✅ Token de Idealista obtenido correctamente');
    return idealistaToken;
  } catch (error) {
    console.error('❌ Error al obtener token de Idealista:', error.response?.data || error.message);
    throw new Error('No se pudo autenticar con la API de Idealista');
  }
}

/**
 * Extrae el ID de propiedad de una URL de Idealista
 * Ejemplo: https://www.idealista.com/inmueble/12345678/ -> 12345678
 */
function extractPropertyIdFromUrl(url) {
  const match = url.match(/\/inmueble\/(\d+)\//);
  return match ? match[1] : null;
}

/**
 * Extrae las URLs reales de las imágenes desde el HTML de Idealista
 * usando Puppeteer (navegador headless real) para pasar protecciones anti-bot
 */
async function getIdealistaPropertyImages(url) {
  let browser = null;
  try {
    console.log(`🔍 Scraping con Puppeteer (navegador real): ${url}`);

    // Lanzar navegador headless
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();

    // Configurar user agent y viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // Navegar a la página
    console.log('🌐 Navegando a Idealista...');
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Esperar a que carguen las imágenes
    console.log('⏳ Esperando a que carguen las imágenes...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extraer URLs de imágenes del HTML/JSON
    const imageUrls = await page.evaluate(() => {
      const urls = [];

      // Estrategia 1: Buscar el JSON de datos de la propiedad
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          if (data.image) {
            if (Array.isArray(data.image)) {
              urls.push(...data.image);
            } else if (typeof data.image === 'string') {
              urls.push(data.image);
            }
          }
        } catch (e) {}
      });

      // Estrategia 2: Buscar en el HTML el carrusel de fotos
      const photoElements = document.querySelectorAll('.detail-multimedia-gallery img, .multimedia-gallery img, [class*="gallery"] img');
      photoElements.forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy');
        if (src && src.includes('idealista.com')) {
          let cleanUrl = src.replace('/WEB_LISTING-S/', '/WEB_LISTING/');
          cleanUrl = cleanUrl.replace('/WEB_LISTING-M/', '/WEB_LISTING/');
          cleanUrl = cleanUrl.split('?')[0];
          if (!urls.includes(cleanUrl)) {
            urls.push(cleanUrl);
          }
        }
      });

      // Estrategia 3: Buscar todas las imágenes grandes
      const allImages = document.querySelectorAll('img');
      allImages.forEach(img => {
        const src = img.src || img.getAttribute('data-src');
        if (src && src.includes('idealista.com') && src.includes('id.pro.es.image.master')) {
          let cleanUrl = src.replace('/WEB_LISTING-S/', '/WEB_LISTING/');
          cleanUrl = cleanUrl.replace('/WEB_LISTING-M/', '/WEB_LISTING/');
          cleanUrl = cleanUrl.split('?')[0];
          if (!urls.includes(cleanUrl) && cleanUrl.length > 50) {
            urls.push(cleanUrl);
          }
        }
      });

      return urls;
    });

    console.log(`✅ ${imageUrls.length} URLs de imágenes extraídas con Puppeteer`);
    console.log('📋 URLs extraídas:', imageUrls.slice(0, 5));

    await browser.close();
    return imageUrls.length > 0 ? imageUrls : null;

  } catch (error) {
    console.error('❌ Error al hacer scraping con Puppeteer:', error.message);
    if (browser) {
      await browser.close();
    }
    return null;
  }
}

/**
 * Captura screenshot de la página de Idealista y extrae la imagen principal
 * Usa Puppeteer para evitar bloqueos anti-bot
 */
async function capturePropertyScreenshot(url, propertyId) {
  let browser = null;
  try {
    console.log(`📸 Capturando screenshot de Idealista con Puppeteer...`);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Configurar headers para parecer navegador real
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('🌐 Navegando a la página...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Intentar aceptar cookies si aparece el banner
    try {
      console.log('🍪 Buscando banner de cookies...');
      const cookieButton = await page.$('#didomi-notice-agree-button, .didomi-button-highlight, button[id*="accept"], button[id*="cookie"]');
      if (cookieButton) {
        await cookieButton.click();
        console.log('✅ Cookies aceptadas');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (e) {
      console.log('⚠️ No se encontró banner de cookies');
    }

    // Hacer scroll para activar lazy loading
    console.log('📜 Haciendo scroll para cargar imágenes...');
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Crear directorio para las imágenes
    const uploadDir = path.join(__dirname, '../frontend/public/uploads', propertyId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ESTRATEGIA 1: Buscar todos los img tags y analizar cuáles son de la galería
    console.log('🔍 Analizando imágenes en la página...');
    const images = await page.evaluate(() => {
      const allImages = Array.from(document.querySelectorAll('img'));
      return allImages.map(img => ({
        src: img.src,
        alt: img.alt || '',
        className: img.className || '',
        width: img.width,
        height: img.height
      }));
    });

    console.log(`📋 Encontradas ${images.length} imágenes en total`);

    // Debug: mostrar todas las URLs de imágenes
    if (images.length > 0) {
      console.log('📋 Primeras 5 imágenes encontradas:');
      images.slice(0, 5).forEach((img, i) => {
        console.log(`  ${i + 1}. ${img.src.substring(0, 80)}... (${img.width}x${img.height})`);
      });
    }

    // Filtrar imágenes que parezcan de la galería (grandes, con blur en URL)
    const galleryImages = images.filter(img =>
      img.src.includes('idealista.com') &&
      (img.src.includes('blur') || img.src.includes('image.master')) &&
      img.width > 200 &&
      img.height > 200
    );

    console.log(`🖼️ Imágenes de galería encontradas: ${galleryImages.length}`);
    if (galleryImages.length > 0) {
      console.log(`📍 Primera imagen: ${galleryImages[0].src.substring(0, 100)}...`);
    }

    // ESTRATEGIA 2: Capturar screenshot de la sección de multimedia completa
    const selectors = [
      '#main-multimedia',
      '.detail-multimedia',
      '[class*="multimedia"]',
      '.detail-gallery',
      '[class*="gallery"]',
      'picture img',
      'figure img'
    ];

    let screenshotCaptured = false;

    for (const selector of selectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ Elemento encontrado con selector: ${selector}`);
        const screenshotPath = path.join(uploadDir, 'image-0.jpg');

        try {
          await element.screenshot({
            path: screenshotPath,
            type: 'jpeg',
            quality: 90
          });

          console.log(`✅ Screenshot capturado: /uploads/${propertyId}/image-0.jpg`);
          await browser.close();
          return [`/uploads/${propertyId}/image-0.jpg`];
        } catch (screenshotError) {
          console.log(`⚠️ No se pudo capturar screenshot del selector ${selector}: ${screenshotError.message}`);
          continue;
        }
      }
    }

    // ESTRATEGIA 3: Si no encontramos elementos específicos, tomar screenshot del viewport completo
    if (!screenshotCaptured) {
      console.log('📸 Capturando screenshot de toda la página...');
      const screenshotPath = path.join(uploadDir, 'image-0.jpg');

      await page.screenshot({
        path: screenshotPath,
        type: 'jpeg',
        quality: 90,
        fullPage: false // Solo el viewport visible
      });

      console.log(`✅ Screenshot completo capturado: /uploads/${propertyId}/image-0.jpg`);
      await browser.close();
      return [`/uploads/${propertyId}/image-0.jpg`];
    }

    await browser.close();
    return null;

  } catch (error) {
    console.error('❌ Error al capturar screenshot:', error.message);
    if (browser) {
      await browser.close();
    }
    return null;
  }
}

/**
 * Obtiene detalles de una propiedad desde Idealista
 * Usa screenshot para obtener la imagen
 */
async function getPropertyFromIdealista(url) {
  return null; // GPT extraerá los datos de texto
}

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

    // PASO 1: Dejar que GPT extraiga todo (sistema simple que funcionaba ayer)
    console.log('🖼️ GPT extraerá los datos y las URLs de las imágenes...');
    const idealistaImage = null; // Simplificado: GPT hace todo

    // PASO 2: Usar GPT-5 para extraer toda la información
    console.log('🔄 Extrayendo datos con GPT-5 (puede tardar 30-60 segundos)...');

    let propertyData;

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
- imagenes: array con URLs de TODAS las imágenes de la propiedad (OBLIGATORIO extraer las URLs completas desde la página web)
- estado: si está disponible, reservado, vendido, alquilado
- tipoPropiedad: piso, casa, local, etc.

CRÍTICO PARA IMÁGENES:
- Debes extraer las URLs COMPLETAS de las imágenes desde la página web de Idealista
- Las URLs suelen estar en formato: https://img4.idealista.com/... o https://img3.idealista.com/...
- Extrae AL MENOS 3-5 imágenes de la propiedad
- Las imágenes son OBLIGATORIAS, no pueden ser null ni array vacío

IMPORTANTE:
1. Responde SOLO con el objeto JSON, sin texto adicional
2. Si no encuentras un dato, usa null (EXCEPTO imágenes, que deben estar)
3. Las imágenes deben ser URLs completas y válidas (https://img4.idealista.com/...)
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
  "imagenes": ["https://img4.idealista.com/blur/WEB_LISTING/0/id.pro.es.image.master/abc.jpg", "https://img4.idealista.com/blur/WEB_LISTING/0/id.pro.es.image.master/def.jpg"],
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

      // PASO 3A: Intentar obtener imágenes desde Idealista API (método oficial)
      const propertyCode = extractPropertyIdFromUrl(url);
      let apiImageUrls = null;

      if (propertyCode && IDEALISTA_API_KEY && IDEALISTA_SECRET) {
        try {
          console.log(`🔑 Intentando obtener imágenes desde API oficial de Idealista (ID: ${propertyCode})...`);
          const token = await getIdealistaToken();

          // Buscar propiedad por código
          const apiResponse = await axios.get(
            `https://api.idealista.com/3.5/es/search`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              params: {
                center: '40.416729,-3.703339',
                country: 'es',
                propertyType: 'homes',
                operation: 'sale',
                maxItems: 50
              }
            }
          );

          if (apiResponse.data && apiResponse.data.elementList) {
            const property = apiResponse.data.elementList.find(p => p.propertyCode === propertyCode);

            if (property && property.multimedia && property.multimedia.images) {
              apiImageUrls = property.multimedia.images.map(img => img.url);
              console.log(`✅ ${apiImageUrls.length} imágenes obtenidas desde API oficial`);
            }
          }
        } catch (apiError) {
          console.log('⚠️ No se pudieron obtener imágenes de la API oficial:', apiError.message);
        }
      }

      // Si obtuvimos imágenes de la API, descargarlas
      if (apiImageUrls && apiImageUrls.length > 0) {
        console.log(`📥 Descargando ${apiImageUrls.length} imágenes desde API oficial...`);

        const downloadPromises = apiImageUrls.map((imageUrl, index) =>
          downloadAndSaveImage(imageUrl, propertyId, index)
        );

        const localImagePaths = await Promise.all(downloadPromises);
        const successfulImages = localImagePaths.filter(path => path !== null);

        if (successfulImages.length > 0) {
          propertyData.imagenes = successfulImages;
          propertyData.urlImagen = successfulImages[0];
          console.log(`✅ ${successfulImages.length} imágenes descargadas desde API oficial`);
        }
      }
      // PASO 3B: Si no hay imágenes de API, intentar screenshot
      else {
        console.log('📸 Intentando capturar screenshot de las imágenes...');
        const screenshotPaths = await capturePropertyScreenshot(url, propertyId);

        if (screenshotPaths && screenshotPaths.length > 0) {
          // Screenshot exitoso - usar imagen capturada
          propertyData.imagenes = screenshotPaths;
          propertyData.urlImagen = screenshotPaths[0];
          console.log('✅ Screenshot capturado exitosamente');
        }
      }

      // PASO 3C: Fallback final a URLs de GPT (guardar las que tenemos en variable temporal)
      const gptImageUrls = propertyData.imagenes ? [...propertyData.imagenes] : [];

      if ((!propertyData.imagenes || propertyData.imagenes.length === 0 || typeof propertyData.imagenes[0] === 'string' && propertyData.imagenes[0].startsWith('http')) && gptImageUrls.length > 0) {
        // Fallback: intentar descargar URLs de GPT si API y screenshot fallaron
        console.log(`📥 Screenshot falló. Intentando descargar ${propertyData.imagenes.length} imágenes de GPT...`);

        // Guardar URLs originales
        const originalUrls = [...propertyData.imagenes];
        console.log('📋 URLs de GPT:', JSON.stringify(originalUrls.slice(0, 3), null, 2));

        // Descargar todas las imágenes en paralelo
        const downloadPromises = propertyData.imagenes.map((imageUrl, index) =>
          downloadAndSaveImage(imageUrl, propertyId, index)
        );

        const localImagePaths = await Promise.all(downloadPromises);

        // Filtrar imágenes que fallaron (null)
        const successfulImages = localImagePaths.filter(path => path !== null);

        if (successfulImages.length > 0) {
          propertyData.imagenes = successfulImages;
          propertyData.urlImagen = successfulImages[0];
          console.log(`✅ ${successfulImages.length} imágenes descargadas desde GPT URLs`);
        } else {
          propertyData.imagenes = originalUrls;
          propertyData.urlImagen = originalUrls[0];
          console.log(`⚠️ Todas las descargas fallaron. Manteniendo URLs originales.`);
        }
      } else {
        console.log('⚠️ No se pudo obtener ninguna imagen (ni screenshot ni GPT)');
      }
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
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
