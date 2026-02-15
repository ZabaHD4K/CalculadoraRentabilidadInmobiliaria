import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============ TIPOS ============

export interface PDFReportData {
  // Propiedad
  nombre: string;
  direccion: string;
  precio: number;
  superficie: number;
  habitaciones: number;
  banos: number;
  tipoPropiedad: string;
  estado: string;
  descripcion: string;
  caracteristicas: string[];

  // Alquiler
  alquilerMensual: number;
  rentaAnual: number;

  // Costes de adquisición
  itp: number;
  iva: number;
  notariaCompra: number;
  registroCompra: number;
  comisionAgencia: number;
  gestoriaHipoteca: number;
  tasacion: number;
  comisionApertura: number;
  reforma: number;
  gastosAdquisicion: number;
  precioTotal: number;

  // Hipoteca
  capitalPropio: number;
  capitalFinanciado: number;
  plazoHipoteca: number;
  tipoInteres: number;
  cuotaMensualHipoteca: number;
  cuotaAnualHipoteca: number;

  // Gastos anuales
  comunidadAnual: number;
  mantenimiento: number;
  seguroHogar: number;
  seguroVidaHipoteca: number;
  seguroImpago: number;
  ibi: number;
  periodosVacantes: number;
  gastosAnuales: number;

  // Métricas
  cashFlowAnual: number;
  cashFlowMensual: number;
  rentabilidadBruta: number;
  rentabilidadNeta: number;
  roiSimple: number;
  roi: number;
  gananciaTotal: number;
  amortizacionAnual: number;
  revalorizacionAnual: number;
  paybackPeriod: number;
  tir: number;
  van: number;

  // Simulación
  inflacion: number;
  incrementoAlquiler: number;

  // Tablas
  tablaAmortizacion: Array<{
    año: number;
    cuota: number;
    intereses: number;
    amortizacion: number;
    saldoPendiente: number;
  }>;
  evolucionRentabilidad: Array<{
    año: string;
    'Renta Anual': number;
    'Cash Flow': number;
    'Rentabilidad (%)': number;
  }>;
  datosGastos: Array<{ name: string; value: number }>;
  comparativa: {
    conFinanciacion: { inversion: number; cashFlowAnual: number; roi: number; rentabilidadNeta: number };
    sinFinanciacion: { inversion: number; cashFlowAnual: number; roi: number; rentabilidadNeta: number };
  };
}

// ============ HELPERS ============

const fmt = (n: number): string =>
  Math.round(n).toLocaleString('es-ES') + '€';

const fmtPct = (n: number): string => n.toFixed(2) + '%';

const fmtYears = (n: number): string => {
  if (n <= 0 || !isFinite(n)) return 'N/A';
  return n.toFixed(1) + ' años';
};

const PRIMARY: [number, number, number] = [15, 118, 110];     // teal-700
const ACCENT: [number, number, number] = [20, 184, 166];      // teal-500
const DARK: [number, number, number] = [30, 41, 59];          // slate-800
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_BG: [number, number, number] = [241, 245, 249];   // slate-100
const MUTED: [number, number, number] = [100, 116, 139];      // slate-500
const GREEN: [number, number, number] = [22, 163, 74];
const RED: [number, number, number] = [220, 38, 38];

// ============ GENERADOR ============

export function generatePDF(data: PDFReportData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();   // 297
  const M = 15; // margen
  const W = pageW - M * 2; // ancho de contenido
  let Y = 0;

  const today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  // --- Cabecera ---
  const addHeader = () => {
    doc.setFillColor(...DARK);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 25, pageW, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...WHITE);
    doc.text('RealStateAI', M, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Informe de Inversión Inmobiliaria', M, 18);

    doc.setFontSize(8);
    doc.text(today, pageW - M, 12, { align: 'right' });
    doc.text(data.nombre, pageW - M, 18, { align: 'right' });

    Y = 35;
  };

  // --- Pie de página ---
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Este informe es orientativo y no constituye asesoramiento financiero profesional.',
      M, pageH - 8
    );
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${pageNum} de ${totalPages}`,
      pageW - M, pageH - 8,
      { align: 'right' }
    );
  };

  // --- Título de sección ---
  const addSection = (title: string) => {
    checkPage(14);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY);
    doc.text(title, M, Y);
    Y += 1.5;
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.6);
    doc.line(M, Y, M + W, Y);
    Y += 5;
  };

  // --- Control de página ---
  const checkPage = (needed: number) => {
    if (Y + needed > pageH - 20) {
      doc.addPage();
      addHeader();
    }
  };

  // --- Tabla estándar 2 columnas ---
  const addKeyValueTable = (
    rows: [string, string][],
    options?: { highlightLast?: number }
  ) => {
    const highlightLast = options?.highlightLast ?? 0;

    autoTable(doc, {
      startY: Y,
      margin: { left: M, right: M },
      head: [['Concepto', 'Valor']],
      body: rows,
      styles: {
        fontSize: 9,
        cellPadding: 2.5,
        textColor: DARK,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: PRIMARY,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: LIGHT_BG,
      },
      didParseCell: (hookData) => {
        const totalRows = rows.length;
        if (highlightLast > 0 && hookData.section === 'body' && hookData.row.index >= totalRows - highlightLast) {
          hookData.cell.styles.fontStyle = 'bold';
          hookData.cell.styles.fillColor = [209, 250, 229]; // green-100
        }
      },
    });

    Y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  };

  // ===========================
  // PÁGINA 1: Propiedad + Adquisición
  // ===========================
  addHeader();

  // 1. Resumen de la propiedad
  addSection('1. Resumen de la Propiedad');
  addKeyValueTable([
    ['Nombre', data.nombre],
    ['Dirección', data.direccion],
    ['Precio del inmueble', fmt(data.precio)],
    ['Superficie', data.superficie + ' m²'],
    ['Habitaciones', String(data.habitaciones)],
    ['Baños', String(data.banos)],
    ['Tipo de propiedad', data.tipoPropiedad || 'No especificado'],
    ['Estado', data.estado || 'No especificado'],
  ]);

  // Descripción (si existe)
  if (data.descripcion) {
    checkPage(20);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(data.descripcion, W);
    const maxLines = Math.min(lines.length, 4);
    doc.text(lines.slice(0, maxLines), M, Y);
    Y += maxLines * 3.5 + 4;
  }

  // 2. Costes de adquisición
  addSection('2. Costes de Adquisición');

  const costRows: [string, string][] = [];
  if (data.itp > 0) costRows.push(['ITP (Impuesto Transmisiones)', fmt(data.itp)]);
  if (data.iva > 0) costRows.push(['IVA', fmt(data.iva)]);
  if (data.notariaCompra > 0) costRows.push(['Notaría de compra', fmt(data.notariaCompra)]);
  if (data.registroCompra > 0) costRows.push(['Registro de la propiedad', fmt(data.registroCompra)]);
  if (data.comisionAgencia > 0) costRows.push(['Comisión de agencia', fmt(data.comisionAgencia)]);
  if (data.gestoriaHipoteca > 0) costRows.push(['Gestoría de hipoteca', fmt(data.gestoriaHipoteca)]);
  if (data.tasacion > 0) costRows.push(['Tasación', fmt(data.tasacion)]);
  if (data.comisionApertura > 0) costRows.push(['Comisión de apertura', fmt(data.comisionApertura)]);
  if (data.reforma > 0) costRows.push(['Reforma / Rehabilitación', fmt(data.reforma)]);
  costRows.push(['Total gastos de adquisición', fmt(data.gastosAdquisicion)]);
  costRows.push(['PRECIO TOTAL (inmueble + gastos)', fmt(data.precioTotal)]);

  addKeyValueTable(costRows, { highlightLast: 2 });

  // ===========================
  // SECCIÓN 3: Hipoteca
  // ===========================
  addSection('3. Datos de la Hipoteca');
  addKeyValueTable([
    ['Capital propio (aportación)', fmt(data.capitalPropio)],
    ['Capital financiado', fmt(data.capitalFinanciado)],
    ['Plazo de la hipoteca', data.plazoHipoteca + ' años'],
    ['Tipo de interés', fmtPct(data.tipoInteres)],
    ['Cuota mensual', fmt(data.cuotaMensualHipoteca)],
    ['Cuota anual', fmt(data.cuotaAnualHipoteca)],
  ]);

  // ===========================
  // SECCIÓN 4: Gastos anuales
  // ===========================
  addSection('4. Gastos Anuales de Explotación');
  addKeyValueTable([
    ['Comunidad de propietarios', fmt(data.comunidadAnual)],
    ['Mantenimiento', fmt(data.mantenimiento)],
    ['Seguro de hogar', fmt(data.seguroHogar)],
    ['Seguro de vida (hipoteca)', fmt(data.seguroVidaHipoteca)],
    ['Seguro de impago', fmt(data.seguroImpago)],
    ['IBI (Impuesto Bienes Inmuebles)', fmt(data.ibi)],
    ['Periodos vacantes', fmt(data.periodosVacantes)],
    ['TOTAL GASTOS ANUALES', fmt(data.gastosAnuales)],
  ], { highlightLast: 1 });

  // ===========================
  // SECCIÓN 5: Métricas clave
  // ===========================
  addSection('5. Métricas Clave de Rentabilidad');

  // Tabla con colores condicionales
  const metricsRows: string[][] = [
    ['Alquiler mensual', fmt(data.alquilerMensual)],
    ['Renta anual bruta', fmt(data.rentaAnual)],
    ['Cash Flow mensual', fmt(data.cashFlowMensual)],
    ['Cash Flow anual', fmt(data.cashFlowAnual)],
    ['Rentabilidad bruta (yield)', fmtPct(data.rentabilidadBruta)],
    ['Rentabilidad neta (yield)', fmtPct(data.rentabilidadNeta)],
    ['ROI simple (solo cash flow)', fmtPct(data.roiSimple)],
    ['ROI total (CF + amort. + reval.)', fmtPct(data.roi)],
    ['Ganancia total anual', fmt(data.gananciaTotal)],
    ['Amortización anual hipoteca', fmt(data.amortizacionAnual)],
    ['Revalorización anual estimada', fmt(data.revalorizacionAnual)],
    ['Periodo de recuperación (payback)', fmtYears(data.paybackPeriod)],
    ['TIR a 30 años', fmtPct(data.tir)],
    ['VAN (Valor Actual Neto)', fmt(data.van)],
  ];

  autoTable(doc, {
    startY: Y,
    margin: { left: M, right: M },
    head: [['Métrica', 'Valor']],
    body: metricsRows,
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
      textColor: DARK,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: DARK,
      textColor: WHITE,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 1) {
        const idx = hookData.row.index;
        // Cash Flow anual (idx 3), ROI total (idx 7), Ganancia total (idx 8)
        if (idx === 3 || idx === 7 || idx === 8) {
          const rawVal = idx === 3 ? data.cashFlowAnual : idx === 7 ? data.roi : data.gananciaTotal;
          hookData.cell.styles.textColor = rawVal >= 0 ? GREEN : RED;
          hookData.cell.styles.fontStyle = 'bold';
        }
        // TIR (idx 12), VAN (idx 13)
        if (idx === 12) {
          hookData.cell.styles.textColor = data.tir >= 0 ? GREEN : RED;
          hookData.cell.styles.fontStyle = 'bold';
        }
        if (idx === 13) {
          hookData.cell.styles.textColor = data.van >= 0 ? GREEN : RED;
          hookData.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  Y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ===========================
  // SECCIÓN 6: Evolución 10 años
  // ===========================
  addSection('6. Evolución de Rentabilidad (10 años)');

  autoTable(doc, {
    startY: Y,
    margin: { left: M, right: M },
    head: [['Año', 'Renta Anual', 'Cash Flow', 'Rentabilidad (%)']],
    body: data.evolucionRentabilidad.map(row => [
      row.año,
      fmt(row['Renta Anual']),
      fmt(row['Cash Flow']),
      fmtPct(row['Rentabilidad (%)']),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: DARK,
      halign: 'center',
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: PRIMARY,
      textColor: WHITE,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    columnStyles: {
      0: { halign: 'left' },
    },
  });

  Y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;
  checkPage(8);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...MUTED);
  doc.text(
    `Supuestos: incremento alquiler ${fmtPct(data.incrementoAlquiler)}/año, inflación ${fmtPct(data.inflacion)}/año`,
    M, Y
  );
  Y += 8;

  // ===========================
  // SECCIÓN 7: Amortización hipotecaria
  // ===========================
  addSection('7. Amortización Hipotecaria (primeros 5 años)');

  autoTable(doc, {
    startY: Y,
    margin: { left: M, right: M },
    head: [['Año', 'Cuota Anual', 'Intereses', 'Amortización', 'Saldo Pendiente']],
    body: data.tablaAmortizacion.map(row => [
      'Año ' + row.año,
      fmt(row.cuota),
      fmt(row.intereses),
      fmt(row.amortizacion),
      fmt(row.saldoPendiente),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: DARK,
      halign: 'center',
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: PRIMARY,
      textColor: WHITE,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
    columnStyles: {
      0: { halign: 'left' },
    },
  });

  Y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ===========================
  // SECCIÓN 8: Comparativa financiación
  // ===========================
  addSection('8. Comparativa: Con vs Sin Financiación');

  autoTable(doc, {
    startY: Y,
    margin: { left: M, right: M },
    head: [['', 'Con Financiación', 'Sin Financiación']],
    body: [
      ['Inversión inicial', fmt(data.comparativa.conFinanciacion.inversion), fmt(data.comparativa.sinFinanciacion.inversion)],
      ['Cash Flow anual', fmt(data.comparativa.conFinanciacion.cashFlowAnual), fmt(data.comparativa.sinFinanciacion.cashFlowAnual)],
      ['ROI', fmtPct(data.comparativa.conFinanciacion.roi), fmtPct(data.comparativa.sinFinanciacion.roi)],
      ['Rentabilidad neta', fmtPct(data.comparativa.conFinanciacion.rentabilidadNeta), fmtPct(data.comparativa.sinFinanciacion.rentabilidadNeta)],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: DARK,
      halign: 'center',
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: DARK,
      textColor: WHITE,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: LIGHT_BG,
    },
  });

  Y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ===========================
  // SECCIÓN 9: Distribución de gastos
  // ===========================
  if (data.datosGastos.length > 0) {
    addSection('9. Distribución de Gastos Anuales');

    const totalGastosConHipoteca = data.datosGastos.reduce((sum, g) => sum + g.value, 0);

    autoTable(doc, {
      startY: Y,
      margin: { left: M, right: M },
      head: [['Concepto', 'Importe Anual', '% del Total']],
      body: data.datosGastos.map(g => [
        g.name,
        fmt(g.value),
        totalGastosConHipoteca > 0 ? fmtPct((g.value / totalGastosConHipoteca) * 100) : '0%',
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 2.5,
        textColor: DARK,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: PRIMARY,
        textColor: WHITE,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: LIGHT_BG,
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
      },
    });

    Y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // ===========================
  // SECCIÓN 10: Resumen ejecutivo
  // ===========================
  addSection('10. Resumen Ejecutivo');
  checkPage(45);

  // Caja de resumen
  const boxColor: [number, number, number] = data.roi >= 5 ? [220, 252, 231] : data.roi >= 0 ? [254, 249, 195] : [254, 226, 226];
  const borderColor: [number, number, number] = data.roi >= 5 ? GREEN : data.roi >= 0 ? [161, 98, 7] : RED;

  doc.setFillColor(...boxColor);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, Y, W, 40, 3, 3, 'FD');

  const textColor: [number, number, number] = data.roi >= 5 ? GREEN : data.roi >= 0 ? [161, 98, 7] : RED;
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);

  const verdict = data.roi >= 10
    ? 'INVERSIÓN MUY RENTABLE'
    : data.roi >= 5
      ? 'INVERSIÓN RENTABLE'
      : data.roi >= 0
        ? 'INVERSIÓN MODERADA'
        : 'INVERSIÓN NO RECOMENDABLE';

  doc.setTextColor(...textColor);
  doc.text(verdict, M + W / 2, Y + 8, { align: 'center' });

  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const summaryLines = [
    `Con una inversión de ${fmt(data.capitalPropio)} (capital propio), esta propiedad genera:`,
    `    Cash Flow anual: ${fmt(data.cashFlowAnual)}  |  Cash Flow mensual: ${fmt(data.cashFlowMensual)}`,
    `    ROI total: ${fmtPct(data.roi)}  |  TIR a 30 años: ${fmtPct(data.tir)}`,
    `    Periodo de recuperación: ${fmtYears(data.paybackPeriod)}  |  VAN: ${fmt(data.van)}`,
  ];

  summaryLines.forEach((line, i) => {
    doc.text(line, M + 5, Y + 16 + i * 5.5);
  });

  Y += 48;

  // ===========================
  // PIES DE PÁGINA (en todas las páginas)
  // ===========================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // ===========================
  // DESCARGAR
  // ===========================
  const safeName = data.nombre.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`RealStateAI_Informe_${safeName}_${dateStr}.pdf`);
}
