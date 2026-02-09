/**
 * Módulo de cálculos financieros para inversión inmobiliaria.
 * Funciones puras extraídas de la lógica de negocio para facilitar testing.
 */

// ==================== TABLAS DE IMPUESTOS ====================

const ITP_BY_COMUNIDAD = {
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

const AJD_BY_COMUNIDAD = {
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

// ==================== IMPUESTOS ====================

/**
 * Calcula el ITP (Impuesto de Transmisiones Patrimoniales) para segunda mano.
 * @param {number} precio - Precio de compra del inmueble
 * @param {string} comunidadAutonoma - Nombre de la comunidad autónoma
 * @returns {number} Importe del ITP redondeado
 */
function calculateITP(precio, comunidadAutonoma) {
  const porcentaje = ITP_BY_COMUNIDAD[comunidadAutonoma] || 7;
  return Math.round((precio * porcentaje) / 100);
}

/**
 * Calcula el IVA para obra nueva (10% fijo en vivienda).
 * @param {number} precio - Precio de compra del inmueble
 * @returns {number} Importe del IVA redondeado
 */
function calculateIVA(precio) {
  return Math.round((precio * 10) / 100);
}

/**
 * Calcula el AJD (Actos Jurídicos Documentados) para obra nueva.
 * @param {number} precio - Precio de compra del inmueble
 * @param {string} comunidadAutonoma - Nombre de la comunidad autónoma
 * @returns {number} Importe del AJD redondeado
 */
function calculateAJD(precio, comunidadAutonoma) {
  const porcentaje = AJD_BY_COMUNIDAD[comunidadAutonoma] || 1;
  return Math.round((precio * porcentaje) / 100);
}

// ==================== HIPOTECA ====================

/**
 * Calcula la cuota mensual de hipoteca usando el sistema francés.
 * C = P * [i * (1 + i)^n] / [(1 + i)^n - 1]
 * @param {number} capitalFinanciado - Importe total a financiar
 * @param {number} tipoInteresAnual - Tipo de interés anual (ej: 3.5 para 3.5%)
 * @param {number} plazoAnios - Plazo en años
 * @returns {number} Cuota mensual redondeada
 */
function calcularCuotaHipoteca(capitalFinanciado, tipoInteresAnual, plazoAnios) {
  if (capitalFinanciado <= 0 || tipoInteresAnual <= 0 || plazoAnios <= 0) {
    return 0;
  }
  const tasaMensual = tipoInteresAnual / 12 / 100;
  const numeroPagos = plazoAnios * 12;
  const cuota = capitalFinanciado *
    (tasaMensual * Math.pow(1 + tasaMensual, numeroPagos)) /
    (Math.pow(1 + tasaMensual, numeroPagos) - 1);
  return Math.round(cuota);
}

/**
 * Calcula el tipo de interés según tipo de hipoteca.
 * @param {'fija' | 'variable'} tipoHipoteca - Tipo de hipoteca
 * @param {number} euribor - Valor actual del Euribor (ej: 2.5)
 * @returns {number} Tipo de interés anual
 */
function calcularTipoInteres(tipoHipoteca, euribor) {
  if (tipoHipoteca === 'variable') {
    return parseFloat((euribor + 0.8).toFixed(3));
  }
  return parseFloat((euribor + 1.5).toFixed(3));
}

// ==================== ROI ====================

/**
 * Calcula el ROI total de una inversión inmobiliaria.
 * ROI = (Cash Flow + Amortización hipoteca + Revalorización) / Capital invertido * 100
 * @param {object} params
 * @param {number} params.precioInmueble - Precio del inmueble
 * @param {number} params.alquilerMensual - Alquiler mensual estimado
 * @param {number} params.gastosAnuales - Suma de gastos anuales de vivienda
 * @param {number} params.capitalPropio - Capital propio aportado
 * @param {number} params.inversionTotal - Inversión total (precio + gastos de adquisición)
 * @param {number} params.tipoInteres - Tipo de interés anual (%)
 * @param {number} params.plazoHipoteca - Plazo en años
 * @param {number} [params.tasaRevalorizacion=2] - Tasa de revalorización anual (%)
 * @returns {{ roi: number, cashFlowAnual: number, amortizacionAnual: number, revalorizacionAnual: number }}
 */
function calcularROI({
  precioInmueble,
  alquilerMensual,
  gastosAnuales,
  capitalPropio,
  inversionTotal,
  tipoInteres,
  plazoHipoteca,
  tasaRevalorizacion = 2,
}) {
  const ingresosAnuales = alquilerMensual * 12;
  let cashFlowAnual = ingresosAnuales - gastosAnuales;
  let amortizacionAnual = 0;

  const capitalFinanciado = inversionTotal - capitalPropio;

  if (capitalFinanciado > 0 && tipoInteres > 0 && plazoHipoteca > 0) {
    const tasaMensual = tipoInteres / 100 / 12;
    const numPagos = plazoHipoteca * 12;
    const cuotaMensual = capitalFinanciado *
      (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) /
      (Math.pow(1 + tasaMensual, numPagos) - 1);
    const cuotaAnual = cuotaMensual * 12;
    cashFlowAnual -= cuotaAnual;

    // Amortización del primer año
    let saldoHipoteca = capitalFinanciado;
    for (let mes = 0; mes < 12; mes++) {
      const interesMes = saldoHipoteca * tasaMensual;
      const amortizacionMes = cuotaMensual - interesMes;
      amortizacionAnual += amortizacionMes;
      saldoHipoteca -= amortizacionMes;
    }
  }

  const revalorizacionAnual = precioInmueble * (tasaRevalorizacion / 100);
  const gananciaTotal = cashFlowAnual + amortizacionAnual + revalorizacionAnual;
  const capitalInvertido = capitalPropio > 0 ? capitalPropio : inversionTotal;
  const roi = capitalInvertido > 0 ? (gananciaTotal / capitalInvertido) * 100 : 0;

  return {
    roi,
    cashFlowAnual,
    amortizacionAnual,
    revalorizacionAnual,
  };
}

// ==================== TIR ====================

/**
 * Calcula la TIR (Tasa Interna de Retorno) a 30 años usando búsqueda binaria.
 * @param {object} params
 * @param {number} params.capitalPropio - Capital propio invertido
 * @param {number} params.capitalFinanciado - Capital financiado con hipoteca
 * @param {number} params.alquilerMensual - Alquiler mensual inicial
 * @param {number} params.gastosAnuales - Gastos anuales iniciales
 * @param {number} params.cuotaMensualHipoteca - Cuota mensual de la hipoteca
 * @param {number} params.tipoInteres - Tipo de interés anual (%)
 * @param {number} params.plazoHipoteca - Plazo de hipoteca en años
 * @param {number} params.precioInmueble - Precio del inmueble
 * @param {number} [params.inflacion=2] - Inflación anual (%)
 * @param {number} [params.incrementoAlquiler=2] - Incremento anual del alquiler (%)
 * @returns {number} TIR en porcentaje
 */
function calcularTIR({
  capitalPropio,
  capitalFinanciado,
  alquilerMensual,
  gastosAnuales,
  cuotaMensualHipoteca,
  tipoInteres,
  plazoHipoteca,
  precioInmueble,
  inflacion = 2,
  incrementoAlquiler = 2,
}) {
  const cuotaAnualHipoteca = cuotaMensualHipoteca * 12;
  const flujos = [-capitalPropio];
  let alquilerActual = alquilerMensual;
  let gastosActuales = gastosAnuales;
  let saldoHipotecaPendiente = capitalFinanciado;
  const tasaMensualHipoteca = tipoInteres / 100 / 12;
  const apreciacionInmueble = inflacion / 100;
  let valorInmueble = precioInmueble;

  for (let anio = 1; anio <= 30; anio++) {
    const rentaAnualAjustada = alquilerActual * 12;

    let cuotaHipotecaAnio = 0;
    if (anio <= plazoHipoteca && saldoHipotecaPendiente > 0) {
      cuotaHipotecaAnio = cuotaAnualHipoteca;
      for (let mes = 0; mes < 12; mes++) {
        const interesMes = saldoHipotecaPendiente * tasaMensualHipoteca;
        const amortizacionMes = cuotaMensualHipoteca - interesMes;
        saldoHipotecaPendiente = Math.max(0, saldoHipotecaPendiente - amortizacionMes);
      }
    }

    const cashFlowAnioActual = rentaAnualAjustada - gastosActuales - cuotaHipotecaAnio;
    valorInmueble *= (1 + apreciacionInmueble);

    if (anio === 30) {
      const valorResidual = valorInmueble - saldoHipotecaPendiente;
      flujos.push(cashFlowAnioActual + valorResidual);
    } else {
      flujos.push(cashFlowAnioActual);
    }

    alquilerActual *= (1 + incrementoAlquiler / 100);
    gastosActuales *= (1 + inflacion / 100);
  }

  // Búsqueda binaria para encontrar TIR (VPN = 0)
  let tirMin = -50;
  let tirMax = 100;
  let tir = 0;

  for (let iter = 0; iter < 200; iter++) {
    tir = (tirMin + tirMax) / 2;
    let vpn = 0;

    for (let i = 0; i < flujos.length; i++) {
      vpn += flujos[i] / Math.pow(1 + tir / 100, i);
    }

    if (Math.abs(vpn) < 0.01) break;

    if (vpn > 0) {
      tirMin = tir;
    } else {
      tirMax = tir;
    }
  }

  return tir;
}

// ==================== VAN ====================

/**
 * Calcula el VAN (Valor Actual Neto) a 30 años.
 * @param {object} params - Mismos parámetros que calcularTIR
 * @returns {number} VAN en euros
 */
function calcularVAN({
  capitalPropio,
  capitalFinanciado,
  alquilerMensual,
  gastosAnuales,
  cuotaMensualHipoteca,
  tipoInteres,
  plazoHipoteca,
  precioInmueble,
  inflacion = 2,
  incrementoAlquiler = 2,
}) {
  const cuotaAnualHipoteca = cuotaMensualHipoteca * 12;
  let van = -capitalPropio;
  let alquilerActual = alquilerMensual;
  let gastosActuales = gastosAnuales;
  let saldoHipotecaPendiente = capitalFinanciado;
  const tasaMensualHipoteca = tipoInteres / 100 / 12;
  let valorInmueble = precioInmueble;

  for (let anio = 1; anio <= 30; anio++) {
    const rentaAnualAjustada = alquilerActual * 12;

    let cuotaHipotecaAnio = 0;
    if (anio <= plazoHipoteca && saldoHipotecaPendiente > 0) {
      cuotaHipotecaAnio = cuotaAnualHipoteca;
      for (let mes = 0; mes < 12; mes++) {
        const interesMes = saldoHipotecaPendiente * tasaMensualHipoteca;
        const amortizacionMes = cuotaMensualHipoteca - interesMes;
        saldoHipotecaPendiente = Math.max(0, saldoHipotecaPendiente - amortizacionMes);
      }
    }

    let flujoAnio = rentaAnualAjustada - gastosActuales - cuotaHipotecaAnio;
    valorInmueble *= (1 + inflacion / 100);

    if (anio === 30) {
      flujoAnio += valorInmueble - saldoHipotecaPendiente;
    }

    van += flujoAnio / Math.pow(1 + tipoInteres / 100, anio);

    alquilerActual *= (1 + incrementoAlquiler / 100);
    gastosActuales *= (1 + inflacion / 100);
  }

  return van;
}

module.exports = {
  ITP_BY_COMUNIDAD,
  AJD_BY_COMUNIDAD,
  calculateITP,
  calculateIVA,
  calculateAJD,
  calcularCuotaHipoteca,
  calcularTipoInteres,
  calcularROI,
  calcularTIR,
  calcularVAN,
};
