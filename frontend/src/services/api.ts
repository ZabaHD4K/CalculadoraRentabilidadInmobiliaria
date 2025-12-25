const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse {
  success: boolean;
  response?: string;
  error?: string;
  details?: string;
}

export interface PropertyData {
  id?: string;
  nombre: string;
  direccion: string;
  precio: number;
  superficie: number;
  habitaciones: number;
  banos: number;
  alquilerMensual?: number | null;
  alquilerEstimado?: string | null;
  gastosAnuales?: number | null;
  descripcion: string;
  caracteristicas: string[];
  imagenes: string[];
  estado: string;
  tipoPropiedad: string;
  pisoOcupado?: boolean;
  pisoAlquilado?: boolean;
  notasAdicionales?: string;
  urlImagen?: string;
  createdAt?: string;
}

export interface AnalyzePropertyResponse {
  success: boolean;
  data?: PropertyData;
  error?: string;
  rawResponse?: string;
  details?: string;
}

export interface PropertiesResponse {
  success: boolean;
  properties?: PropertyData[];
  property?: PropertyData;
  error?: string;
  message?: string;
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

export async function analyzeProperty(url: string): Promise<AnalyzePropertyResponse> {
  try {
    console.log('Analizando propiedad:', url);
    console.log('Esto puede tardar 30-60 segundos...');

    // Crear un AbortController para timeout manual
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos

    const response = await fetch(`${API_URL}/api/analyze-property`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Error al analizar la propiedad',
        details: errorData.details,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en analyzeProperty:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'La solicitud tardó demasiado tiempo (timeout después de 2 minutos)',
        details: 'El análisis de la propiedad excedió el tiempo límite',
      };
    }

    return {
      success: false,
      error: 'Error al conectar con el servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function saveProperty(propertyData: PropertyData): Promise<PropertiesResponse> {
  try {
    const response = await fetch(`${API_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Error al guardar la propiedad',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en saveProperty:', error);
    return {
      success: false,
      error: 'Error al conectar con el servidor',
    };
  }
}

export async function getProperties(): Promise<PropertiesResponse> {
  try {
    const response = await fetch(`${API_URL}/api/properties`);

    if (!response.ok) {
      return {
        success: false,
        error: 'Error al obtener las propiedades',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getProperties:', error);
    return {
      success: false,
      error: 'Error al conectar con el servidor',
    };
  }
}

export async function deleteProperty(id: string): Promise<PropertiesResponse> {
  try {
    const response = await fetch(`${API_URL}/api/properties/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Error al eliminar la propiedad',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en deleteProperty:', error);
    return {
      success: false,
      error: 'Error al conectar con el servidor',
    };
  }
}

export interface EstimateRentResponse {
  success: boolean;
  estimate?: string;
  error?: string;
}

export async function estimateRent(propertyData: PropertyData): Promise<EstimateRentResponse> {
  try {
    const response = await fetch(`${API_URL}/api/estimate-rent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Error al estimar el alquiler',
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en estimateRent:', error);
    return {
      success: false,
      error: 'Error al conectar con el servidor',
    };
  }
}
