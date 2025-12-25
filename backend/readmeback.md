# RealStateAI Backend

Backend del proyecto RealStateAI con integración de OpenAI GPT.

## Instalación

1. Instalar dependencias:
```bash
npm install
```

## Configuración

El archivo `.env` ya está configurado con tu API key de OpenAI. **NUNCA** subas este archivo a Git.

## Uso

1. Iniciar el servidor:
```bash
npm start
```

2. El servidor correrá en `http://localhost:3000`

3. Para probar el endpoint de GPT, abre en tu navegador o usa Postman:
```
http://localhost:3000/api/hello-gpt
```

## Endpoints

- `GET /` - Endpoint de prueba
- `GET /api/hello-gpt` - Envía un saludo a GPT y muestra la respuesta en consola
- `POST /api/test` - Recibe texto del frontend y lo envía a GPT

### Endpoint `/api/test`

Este endpoint recibe texto desde el frontend, lo envía a GPT y devuelve la respuesta.

**Request:**
```javascript
POST /api/test
Content-Type: application/json

{
  "text": "Tu pregunta o texto aquí"
}
```

**Ejemplo con fetch:**
```javascript
const response = await fetch('http://localhost:3000/api/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: '¿Cuál es la capital de España?'
  })
});

const data = await response.json();
console.log(data.response); // Respuesta de GPT
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "response": "La respuesta de GPT aquí..."
}
```

**Respuesta con error:**
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

## Estructura del proyecto

```
.
├── server.js          # Servidor Express principal
├── .env              # Variables de entorno (API keys)
├── .gitignore        # Archivos ignorados por Git
├── package.json      # Dependencias del proyecto
└── README.md         # Este archivo
```

## Seguridad

- La API key de OpenAI está almacenada en el archivo `.env`
- El archivo `.env` está incluido en `.gitignore` para no subirse a Git
- Nunca compartas tu API key públicamente
