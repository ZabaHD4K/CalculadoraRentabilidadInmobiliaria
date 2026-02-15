const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── JWT helpers ──────────────────────────────────────────────────────────────

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; token?: string; email?: string; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}

export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

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
  alquilerJustificacion?: string | null;
  alquilerConfianza?: string | null;
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

  // Datos económicos detallados
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

  // Gastos de la vivienda
  ibi?: number | null;
  comunidadAnual?: number | null;
  mantenimiento?: number | null;
  seguroHogar?: number | null;
  seguroVidaHipoteca?: number | null;
  seguroImpago?: number | null;
  interesesHipoteca?: number | null;
  periodosVacantes?: number | null;

  // Datos de hipoteca
  capitalPropio?: number | null;
  plazoHipoteca?: number | null;
  tipoInteres?: number | null;
  cuotaMensual?: number | null;
  tipoHipoteca?: string | null;
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

// ─── Mapeo camelCase ↔ snake_case ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbRow(property: PropertyData): Record<string, any> {
  return {
    nombre: property.nombre,
    direccion: property.direccion,
    precio: property.precio,
    superficie: property.superficie,
    habitaciones: property.habitaciones,
    banos: property.banos,
    descripcion: property.descripcion,
    caracteristicas: property.caracteristicas,
    imagenes: property.imagenes,
    estado: property.estado,
    tipo_propiedad: property.tipoPropiedad,
    piso_ocupado: property.pisoOcupado ?? false,
    piso_alquilado: property.pisoAlquilado ?? false,
    notas_adicionales: property.notasAdicionales ?? null,
    url_imagen: property.urlImagen ?? null,
    comunidad_autonoma: property.comunidadAutonoma ?? null,
    es_obra_nueva: property.esObraNueva ?? false,
    alquiler_mensual: property.alquilerMensual ?? null,
    alquiler_estimado: property.alquilerEstimado ?? null,
    alquiler_justificacion: property.alquilerJustificacion ?? null,
    alquiler_confianza: property.alquilerConfianza ?? null,
    gastos_anuales: property.gastosAnuales ?? null,
    itp: property.itp ?? null,
    iva: property.iva ?? null,
    ajd: property.ajd ?? null,
    notaria_compra: property.notariaCompra ?? null,
    registro_compra: property.registroCompra ?? null,
    reforma: property.reforma ?? null,
    comision_agencia: property.comisionAgencia ?? null,
    gestoria_hipoteca: property.gestoriaHipoteca ?? null,
    tasacion: property.tasacion ?? null,
    comision_apertura: property.comisionApertura ?? null,
    ibi: property.ibi ?? null,
    comunidad_anual: property.comunidadAnual ?? null,
    mantenimiento: property.mantenimiento ?? null,
    seguro_hogar: property.seguroHogar ?? null,
    seguro_vida_hipoteca: property.seguroVidaHipoteca ?? null,
    seguro_impago: property.seguroImpago ?? null,
    intereses_hipoteca: property.interesesHipoteca ?? null,
    periodos_vacantes: property.periodosVacantes ?? null,
    capital_propio: property.capitalPropio ?? null,
    plazo_hipoteca: property.plazoHipoteca ?? null,
    tipo_interes: property.tipoInteres ?? null,
    cuota_mensual: property.cuotaMensual ?? null,
    tipo_hipoteca: property.tipoHipoteca ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbRow(row: Record<string, any>): PropertyData {
  return {
    id: row.id,
    nombre: row.nombre ?? '',
    direccion: row.direccion ?? '',
    precio: row.precio ?? 0,
    superficie: row.superficie ?? 0,
    habitaciones: row.habitaciones ?? 0,
    banos: row.banos ?? 0,
    descripcion: row.descripcion ?? '',
    caracteristicas: row.caracteristicas ?? [],
    imagenes: row.imagenes ?? [],
    estado: row.estado ?? 'disponible',
    tipoPropiedad: row.tipo_propiedad ?? 'piso',
    pisoOcupado: row.piso_ocupado ?? false,
    pisoAlquilado: row.piso_alquilado ?? false,
    notasAdicionales: row.notas_adicionales ?? undefined,
    urlImagen: row.url_imagen ?? undefined,
    createdAt: row.created_at ?? undefined,
    comunidadAutonoma: row.comunidad_autonoma ?? undefined,
    esObraNueva: row.es_obra_nueva ?? false,
    alquilerMensual: row.alquiler_mensual ?? null,
    alquilerEstimado: row.alquiler_estimado ?? null,
    alquilerJustificacion: row.alquiler_justificacion ?? null,
    alquilerConfianza: row.alquiler_confianza ?? null,
    gastosAnuales: row.gastos_anuales ?? null,
    itp: row.itp ?? null,
    iva: row.iva ?? null,
    ajd: row.ajd ?? null,
    notariaCompra: row.notaria_compra ?? null,
    registroCompra: row.registro_compra ?? null,
    reforma: row.reforma ?? null,
    comisionAgencia: row.comision_agencia ?? null,
    gestoriaHipoteca: row.gestoria_hipoteca ?? null,
    tasacion: row.tasacion ?? null,
    comisionApertura: row.comision_apertura ?? null,
    ibi: row.ibi ?? null,
    comunidadAnual: row.comunidad_anual ?? null,
    mantenimiento: row.mantenimiento ?? null,
    seguroHogar: row.seguro_hogar ?? null,
    seguroVidaHipoteca: row.seguro_vida_hipoteca ?? null,
    seguroImpago: row.seguro_impago ?? null,
    interesesHipoteca: row.intereses_hipoteca ?? null,
    periodosVacantes: row.periodos_vacantes ?? null,
    capitalPropio: row.capital_propio ?? null,
    plazoHipoteca: row.plazo_hipoteca ?? null,
    tipoInteres: row.tipo_interes ?? null,
    cuotaMensual: row.cuota_mensual ?? null,
    tipoHipoteca: row.tipo_hipoteca ?? null,
  };
}

// ─── CRUD de propiedades (via Express + JWT) ──────────────────────────────────

export async function getProperties(): Promise<PropertiesResponse> {
  try {
    const res = await fetch(`${API_URL}/api/properties`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!data.success) return { success: false, error: data.error };
    return { success: true, properties: (data.properties || []).map(fromDbRow) };
  } catch {
    return { success: false, error: 'Error al obtener las propiedades' };
  }
}

export async function saveProperty(propertyData: PropertyData): Promise<PropertiesResponse> {
  try {
    const res = await fetch(`${API_URL}/api/properties`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(toDbRow(propertyData)),
    });
    const data = await res.json();
    if (!data.success) return { success: false, error: data.error };
    return { success: true, property: fromDbRow(data.property) };
  } catch {
    return { success: false, error: 'Error al guardar la propiedad' };
  }
}

export async function updateProperty(propertyData: PropertyData): Promise<PropertiesResponse> {
  try {
    if (!propertyData.id) return { success: false, error: 'ID de propiedad requerido' };
    const res = await fetch(`${API_URL}/api/properties/${propertyData.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(toDbRow(propertyData)),
    });
    const data = await res.json();
    if (!data.success) return { success: false, error: data.error };
    return { success: true, property: fromDbRow(data.property) };
  } catch {
    return { success: false, error: 'Error al actualizar la propiedad' };
  }
}

export async function deleteProperty(id: string): Promise<PropertiesResponse> {
  try {
    const res = await fetch(`${API_URL}/api/properties/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: 'Error al eliminar la propiedad' };
  }
}

// ─── Funciones de IA (siguen en Express) ─────────────────────────────────────

export async function sendQueryToGPT(text: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_URL}/api/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Error del servidor: ${response.status}`, details: errorText };
    }
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error al conectar con el servidor', details: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function analyzeProperty(url: string): Promise<AnalyzePropertyResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(`${API_URL}/api/analyze-property`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Error al analizar la propiedad', details: errorData.details };
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'La solicitud tardó demasiado tiempo (timeout después de 2 minutos)', details: 'El análisis de la propiedad excedió el tiempo límite' };
    }
    return { success: false, error: 'Error al conectar con el servidor', details: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export interface EstimateRentResponse {
  success: boolean;
  estimate?: string;
  min?: number;
  max?: number;
  media?: number;
  confianza?: string;
  justificacion?: string;
  error?: string;
}

export async function estimateRent(propertyData: PropertyData): Promise<EstimateRentResponse> {
  try {
    const response = await fetch(`${API_URL}/api/estimate-rent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Error al estimar el alquiler' };
    }
    return await response.json();
  } catch (err) {
    console.error('Error en estimateRent:', err);
    return { success: false, error: 'Error al conectar con el servidor' };
  }
}

export interface CalculateExpensesResponse {
  success: boolean;
  expenses?: Partial<PropertyData>;
  error?: string;
}

export async function calculateExpenses(propertyData: PropertyData): Promise<CalculateExpensesResponse> {
  try {
    const response = await fetch(`${API_URL}/api/calculate-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Error al calcular gastos' };
    }
    return await response.json();
  } catch (err) {
    console.error('Error en calculateExpenses:', err);
    return { success: false, error: 'Error al conectar con el servidor' };
  }
}

export async function calculateHousingExpenses(propertyData: PropertyData): Promise<CalculateExpensesResponse> {
  try {
    const response = await fetch(`${API_URL}/api/calculate-housing-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Error al calcular gastos de vivienda' };
    }
    return await response.json();
  } catch (err) {
    console.error('Error en calculateHousingExpenses:', err);
    return { success: false, error: 'Error al conectar con el servidor' };
  }
}

export async function getEuribor(): Promise<{ success: boolean; euribor: number; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/euribor`);
    const data = await response.json();
    return { success: data.success, euribor: data.euribor, error: data.error };
  } catch (err) {
    console.error('Error en getEuribor:', err);
    return { success: false, euribor: 2.5, error: 'Error de conexión' };
  }
}

export async function sendFeedback(data: { tipo: string; mensaje: string; email?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (err) {
    console.error('Error en sendFeedback:', err);
    return { success: false, error: 'Error de conexión' };
  }
}

// ─── Cálculos de impuestos (locales) ─────────────────────────────────────────

export const ITP_BY_COMUNIDAD: { [key: string]: number } = {
  'Andalucía': 7,
  'Aragón': 8,
  'Asturias': 8,
  'Baleares': 8,
  'Canarias': 6.5,
  'Cantabria': 10,
  'Castilla y León': 8,
  'Castilla-La Mancha': 9,
  'Cataluña': 10,
  'Comunidad Valenciana': 10,
  'Extremadura': 8,
  'Galicia': 10,
  'Madrid': 6,
  'Murcia': 8,
  'Navarra': 6,
  'País Vasco': 4,
  'La Rioja': 7,
  'Ceuta': 6,
  'Melilla': 6,
};

export function calculateITP(precio: number, comunidadAutonoma: string): number {
  const porcentaje = ITP_BY_COMUNIDAD[comunidadAutonoma] || 7;
  return Math.round((precio * porcentaje) / 100);
}

export function calculateIVA(precio: number): number {
  return Math.round((precio * 10) / 100);
}

export function calculateAJD(precio: number, comunidadAutonoma: string): number {
  const porcentajes: { [key: string]: number } = {
    'Andalucía': 1.2,
    'Aragón': 1.5,
    'Asturias': 1.2,
    'Baleares': 1.2,
    'Canarias': 0.75,
    'Cantabria': 1.5,
    'Castilla y León': 1.5,
    'Castilla-La Mancha': 1.5,
    'Cataluña': 1.5,
    'Comunidad Valenciana': 1.5,
    'Extremadura': 1.5,
    'Galicia': 1.5,
    'Madrid': 0.75,
    'Murcia': 1.5,
    'Navarra': 0.5,
    'País Vasco': 0.5,
    'La Rioja': 1,
    'Ceuta': 0.5,
    'Melilla': 0.5,
  };
  const porcentaje = porcentajes[comunidadAutonoma] || 1;
  return Math.round((precio * porcentaje) / 100);
}
