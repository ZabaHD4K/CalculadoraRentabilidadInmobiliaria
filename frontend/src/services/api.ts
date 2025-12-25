const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse {
  success: boolean;
  response?: string;
  error?: string;
  details?: string;
}

export async function sendQueryToGPT(text: string): Promise<ApiResponse> {
  try {
    console.log('Enviando a:', `${API_URL}/api/test`);
    console.log('Texto:', text);

    const response = await fetch(`${API_URL}/api/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return {
        success: false,
        error: `Error del servidor: ${response.status}`,
        details: errorText,
      };
    }

    const data = await response.json();
    console.log('Respuesta:', data);
    return data;
  } catch (error) {
    console.error('Error en fetch:', error);
    return {
      success: false,
      error: 'Error al conectar con el servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
