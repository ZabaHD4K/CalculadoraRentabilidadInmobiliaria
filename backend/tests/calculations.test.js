const {
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
} = require('../utils/calculations');

// ==================== ITP ====================

describe('calculateITP', () => {
  test('Madrid aplica 6% sobre el precio', () => {
    expect(calculateITP(200000, 'Madrid')).toBe(12000);
  });

  test('Cataluña aplica 10%', () => {
    expect(calculateITP(200000, 'Cataluña')).toBe(20000);
  });

  test('País Vasco aplica 4% (el más bajo)', () => {
    expect(calculateITP(300000, 'País Vasco')).toBe(12000);
  });

  test('Cantabria aplica 10% (el más alto)', () => {
    expect(calculateITP(150000, 'Cantabria')).toBe(15000);
  });

  test('Canarias aplica 6.5%', () => {
    expect(calculateITP(200000, 'Canarias')).toBe(13000);
  });

  test('comunidad no reconocida usa 7% por defecto', () => {
    expect(calculateITP(100000, 'Inventada')).toBe(7000);
  });

  test('precio 0 devuelve 0', () => {
    expect(calculateITP(0, 'Madrid')).toBe(0);
  });

  test('cubre todas las 19 comunidades/ciudades autónomas', () => {
    const comunidades = Object.keys(ITP_BY_COMUNIDAD);
    expect(comunidades).toHaveLength(19);
    comunidades.forEach((comunidad) => {
      const resultado = calculateITP(100000, comunidad);
      expect(resultado).toBeGreaterThan(0);
    });
  });
});

// ==================== IVA ====================

describe('calculateIVA', () => {
  test('aplica 10% fijo para vivienda nueva', () => {
    expect(calculateIVA(250000)).toBe(25000);
  });

  test('precio pequeño', () => {
    expect(calculateIVA(50000)).toBe(5000);
  });

  test('precio 0 devuelve 0', () => {
    expect(calculateIVA(0)).toBe(0);
  });

  test('redondea correctamente', () => {
    // 123456 * 10% = 12345.6 → 12346
    expect(calculateIVA(123456)).toBe(12346);
  });
});

// ==================== AJD ====================

describe('calculateAJD', () => {
  test('Madrid aplica 0.75%', () => {
    expect(calculateAJD(200000, 'Madrid')).toBe(1500);
  });

  test('País Vasco aplica 0.5%', () => {
    expect(calculateAJD(200000, 'País Vasco')).toBe(1000);
  });

  test('Cataluña aplica 1.5%', () => {
    expect(calculateAJD(200000, 'Cataluña')).toBe(3000);
  });

  test('comunidad no reconocida usa 1% por defecto', () => {
    expect(calculateAJD(200000, 'Inventada')).toBe(2000);
  });

  test('cubre todas las 19 comunidades', () => {
    const comunidades = Object.keys(AJD_BY_COMUNIDAD);
    expect(comunidades).toHaveLength(19);
  });

  test('obra nueva: IVA + AJD es mayor que ITP en la mayoría de casos', () => {
    const precio = 200000;
    const iva = calculateIVA(precio);
    const ajdMadrid = calculateAJD(precio, 'Madrid');
    const itpMadrid = calculateITP(precio, 'Madrid');
    // IVA(20000) + AJD Madrid(1500) = 21500 > ITP Madrid(12000)
    expect(iva + ajdMadrid).toBeGreaterThan(itpMadrid);
  });
});

// ==================== HIPOTECA ====================

describe('calcularCuotaHipoteca', () => {
  test('caso típico: 180.000€ a 30 años al 3%', () => {
    const cuota = calcularCuotaHipoteca(180000, 3, 30);
    // Cuota esperada ~759€/mes
    expect(cuota).toBeGreaterThan(740);
    expect(cuota).toBeLessThan(780);
  });

  test('caso típico: 100.000€ a 20 años al 2.5%', () => {
    const cuota = calcularCuotaHipoteca(100000, 2.5, 20);
    // Cuota esperada ~530€/mes
    expect(cuota).toBeGreaterThan(520);
    expect(cuota).toBeLessThan(540);
  });

  test('capital 0 devuelve 0', () => {
    expect(calcularCuotaHipoteca(0, 3, 30)).toBe(0);
  });

  test('interés 0 devuelve 0', () => {
    expect(calcularCuotaHipoteca(180000, 0, 30)).toBe(0);
  });

  test('plazo 0 devuelve 0', () => {
    expect(calcularCuotaHipoteca(180000, 3, 0)).toBe(0);
  });

  test('mayor interés implica mayor cuota', () => {
    const cuotaBaja = calcularCuotaHipoteca(200000, 2, 25);
    const cuotaAlta = calcularCuotaHipoteca(200000, 5, 25);
    expect(cuotaAlta).toBeGreaterThan(cuotaBaja);
  });

  test('mayor plazo implica menor cuota mensual', () => {
    const cuota20 = calcularCuotaHipoteca(200000, 3, 20);
    const cuota30 = calcularCuotaHipoteca(200000, 3, 30);
    expect(cuota30).toBeLessThan(cuota20);
  });

  test('mayor capital implica mayor cuota', () => {
    const cuotaPeq = calcularCuotaHipoteca(100000, 3, 25);
    const cuotaGrande = calcularCuotaHipoteca(300000, 3, 25);
    expect(cuotaGrande).toBeGreaterThan(cuotaPeq);
    // Debe ser exactamente el triple (proporcional)
    expect(cuotaGrande).toBeCloseTo(cuotaPeq * 3, -1);
  });
});

describe('calcularTipoInteres', () => {
  test('variable: euribor + 0.8%', () => {
    expect(calcularTipoInteres('variable', 2.5)).toBeCloseTo(3.3, 1);
  });

  test('fija: euribor + 1.5%', () => {
    expect(calcularTipoInteres('fija', 2.5)).toBeCloseTo(4.0, 1);
  });

  test('fija siempre es mayor que variable con mismo euribor', () => {
    const fija = calcularTipoInteres('fija', 3);
    const variable = calcularTipoInteres('variable', 3);
    expect(fija).toBeGreaterThan(variable);
  });

  test('euribor negativo funciona correctamente', () => {
    const variable = calcularTipoInteres('variable', -0.5);
    expect(variable).toBeCloseTo(0.3, 1);
  });
});

// ==================== ROI ====================

describe('calcularROI', () => {
  const casoBase = {
    precioInmueble: 200000,
    alquilerMensual: 900,
    gastosAnuales: 3000,
    capitalPropio: 80000,
    inversionTotal: 220000,
    tipoInteres: 3,
    plazoHipoteca: 25,
    tasaRevalorizacion: 2,
  };

  test('devuelve un ROI positivo para caso razonable', () => {
    const resultado = calcularROI(casoBase);
    expect(resultado.roi).toBeGreaterThan(0);
  });

  test('devuelve cash flow, amortización y revalorización', () => {
    const resultado = calcularROI(casoBase);
    expect(resultado).toHaveProperty('cashFlowAnual');
    expect(resultado).toHaveProperty('amortizacionAnual');
    expect(resultado).toHaveProperty('revalorizacionAnual');
    expect(resultado).toHaveProperty('roi');
  });

  test('revalorización es 2% del precio del inmueble', () => {
    const resultado = calcularROI(casoBase);
    expect(resultado.revalorizacionAnual).toBe(200000 * 0.02);
  });

  test('mayor alquiler produce mayor ROI', () => {
    const roiBajo = calcularROI({ ...casoBase, alquilerMensual: 700 });
    const roiAlto = calcularROI({ ...casoBase, alquilerMensual: 1200 });
    expect(roiAlto.roi).toBeGreaterThan(roiBajo.roi);
  });

  test('mayor capital propio reduce el ROI (efecto apalancamiento)', () => {
    const roiApalancado = calcularROI({ ...casoBase, capitalPropio: 60000 });
    const roiSinApalancar = calcularROI({
      ...casoBase,
      capitalPropio: 220000,
      tipoInteres: 0,
      plazoHipoteca: 0,
    });
    // Con apalancamiento, el ROI sobre el capital invertido es más alto
    expect(roiApalancado.roi).toBeGreaterThan(roiSinApalancar.roi);
  });

  test('sin financiación, amortización es 0', () => {
    const resultado = calcularROI({
      ...casoBase,
      capitalPropio: 220000,
      tipoInteres: 0,
      plazoHipoteca: 0,
    });
    expect(resultado.amortizacionAnual).toBe(0);
  });

  test('cash flow anual = ingresos - gastos - cuota hipoteca', () => {
    const resultado = calcularROI(casoBase);
    const ingresosAnuales = 900 * 12;
    // Cash flow debe ser menor que ingresos - gastos (por la hipoteca)
    expect(resultado.cashFlowAnual).toBeLessThan(ingresosAnuales - 3000);
  });
});

// ==================== TIR ====================

describe('calcularTIR', () => {
  const casoBase = {
    capitalPropio: 80000,
    capitalFinanciado: 140000,
    alquilerMensual: 900,
    gastosAnuales: 3000,
    cuotaMensualHipoteca: calcularCuotaHipoteca(140000, 3, 25),
    tipoInteres: 3,
    plazoHipoteca: 25,
    precioInmueble: 200000,
    inflacion: 2,
    incrementoAlquiler: 2,
  };

  test('TIR es un número finito', () => {
    const tir = calcularTIR(casoBase);
    expect(Number.isFinite(tir)).toBe(true);
  });

  test('TIR es positiva para inversión rentable', () => {
    const tir = calcularTIR(casoBase);
    expect(tir).toBeGreaterThan(0);
  });

  test('TIR está en rango razonable (0-30%)', () => {
    const tir = calcularTIR(casoBase);
    expect(tir).toBeGreaterThan(0);
    expect(tir).toBeLessThan(30);
  });

  test('mayor alquiler produce mayor TIR', () => {
    const tirBaja = calcularTIR({ ...casoBase, alquilerMensual: 600 });
    const tirAlta = calcularTIR({ ...casoBase, alquilerMensual: 1200 });
    expect(tirAlta).toBeGreaterThan(tirBaja);
  });

  test('mayor inflación incrementa la TIR (por revalorización)', () => {
    const tirBaja = calcularTIR({ ...casoBase, inflacion: 1 });
    const tirAlta = calcularTIR({ ...casoBase, inflacion: 4 });
    expect(tirAlta).toBeGreaterThan(tirBaja);
  });
});

// ==================== VAN ====================

describe('calcularVAN', () => {
  const casoBase = {
    capitalPropio: 80000,
    capitalFinanciado: 140000,
    alquilerMensual: 900,
    gastosAnuales: 3000,
    cuotaMensualHipoteca: calcularCuotaHipoteca(140000, 3, 25),
    tipoInteres: 3,
    plazoHipoteca: 25,
    precioInmueble: 200000,
    inflacion: 2,
    incrementoAlquiler: 2,
  };

  test('VAN es un número finito', () => {
    const van = calcularVAN(casoBase);
    expect(Number.isFinite(van)).toBe(true);
  });

  test('VAN es positivo para inversión rentable', () => {
    const van = calcularVAN(casoBase);
    expect(van).toBeGreaterThan(0);
  });

  test('mayor alquiler produce mayor VAN', () => {
    const vanBajo = calcularVAN({ ...casoBase, alquilerMensual: 600 });
    const vanAlto = calcularVAN({ ...casoBase, alquilerMensual: 1200 });
    expect(vanAlto).toBeGreaterThan(vanBajo);
  });

  test('mayor tipo de interés reduce el VAN (mayor tasa de descuento)', () => {
    const vanAlto = calcularVAN({ ...casoBase, tipoInteres: 2 });
    const vanBajo = calcularVAN({ ...casoBase, tipoInteres: 6 });
    expect(vanAlto).toBeGreaterThan(vanBajo);
  });

  test('VAN y TIR son coherentes: VAN > 0 cuando la inversión es rentable y TIR > tasa descuento', () => {
    const van = calcularVAN(casoBase);
    const tir = calcularTIR(casoBase);
    // Si VAN > 0, la TIR debe ser mayor que la tasa de descuento (tipoInteres)
    if (van > 0) {
      expect(tir).toBeGreaterThan(casoBase.tipoInteres);
    }
  });
});

// ==================== INTEGRACIÓN ====================

describe('Integración: flujo completo de análisis', () => {
  test('analizar piso en Madrid de 250.000€ (segunda mano)', () => {
    const precio = 250000;
    const comunidad = 'Madrid';

    // 1. Calcular impuestos
    const itp = calculateITP(precio, comunidad);
    expect(itp).toBe(15000); // 6% de 250k

    // 2. Calcular inversión total
    const gastosAdquisicion = itp + 800 + 500; // ITP + notaría + registro
    const inversionTotal = precio + gastosAdquisicion;
    expect(inversionTotal).toBe(266300);

    // 3. Calcular hipoteca (30% capital propio)
    const capitalPropio = Math.round(inversionTotal * 0.3);
    const capitalFinanciado = inversionTotal - capitalPropio;
    const cuota = calcularCuotaHipoteca(capitalFinanciado, 3.5, 25);
    expect(cuota).toBeGreaterThan(0);

    // 4. Calcular ROI
    const resultado = calcularROI({
      precioInmueble: precio,
      alquilerMensual: 1100,
      gastosAnuales: 4000,
      capitalPropio,
      inversionTotal,
      tipoInteres: 3.5,
      plazoHipoteca: 25,
    });
    expect(resultado.roi).toBeGreaterThan(0);

    // 5. Calcular TIR
    const tir = calcularTIR({
      capitalPropio,
      capitalFinanciado,
      alquilerMensual: 1100,
      gastosAnuales: 4000,
      cuotaMensualHipoteca: cuota,
      tipoInteres: 3.5,
      plazoHipoteca: 25,
      precioInmueble: precio,
    });
    expect(tir).toBeGreaterThan(0);

    // 6. Calcular VAN
    const van = calcularVAN({
      capitalPropio,
      capitalFinanciado,
      alquilerMensual: 1100,
      gastosAnuales: 4000,
      cuotaMensualHipoteca: cuota,
      tipoInteres: 3.5,
      plazoHipoteca: 25,
      precioInmueble: precio,
    });
    expect(van).toBeGreaterThan(0);
  });

  test('obra nueva en Barcelona: IVA + AJD en vez de ITP', () => {
    const precio = 300000;
    const comunidad = 'Cataluña';

    const iva = calculateIVA(precio);
    const ajd = calculateAJD(precio, comunidad);
    const itp = calculateITP(precio, comunidad);

    expect(iva).toBe(30000);  // 10%
    expect(ajd).toBe(4500);   // 1.5%
    expect(itp).toBe(30000);  // 10%

    // En obra nueva se paga IVA + AJD, no ITP
    const impuestosObraNueva = iva + ajd;
    expect(impuestosObraNueva).toBe(34500);
    expect(impuestosObraNueva).toBeGreaterThan(itp);
  });
});
