"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PropertyData, getProperties, updateProperty } from "@/services/api";
import FeedbackButton from "@/components/FeedbackButton";
import DashboardHeader from "@/components/DashboardHeader";
import BenefitsCards from "@/components/BenefitsCards";
import ROIReturnBox from "@/components/ROIReturnBox";
import SimulationSliders from "@/components/SimulationSliders";
import ProfitabilityChart from "@/components/ProfitabilityChart";
import ExpenseEditor from "@/components/ExpenseEditor";
import AmortizationTable from "@/components/AmortizationTable";
import FinancingComparison from "@/components/FinancingComparison";
import FloatingSaveButton from "@/components/FloatingSaveButton";
import { generatePDF, PDFReportData } from "@/utils/generatePDF";

export default function FinancialDashboard() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados editables para simulaciones
  const [precioInmueble, setPrecioInmueble] = useState(0);
  const [capitalPropio, setCapitalPropio] = useState(0);
  const [plazoHipoteca, setPlazoHipoteca] = useState(30);
  const [tipoInteres, setTipoInteres] = useState(3.5);
  const [inflacion, setInflacion] = useState(2.0);
  const [incrementoAlquiler, setIncrementoAlquiler] = useState(2.0);
  const [alquilerMensualSimulado, setAlquilerMensualSimulado] = useState(0);
  
  // Estados para gastos editables (en euros para valores fijos)
  const [comunidadAnual, setComunidadAnual] = useState(0);

  // Estados para gastos en euros (el % solo define el valor inicial por defecto)
  const [mantenimiento, setMantenimiento] = useState(0);
  const [seguroHogar, setSeguroHogar] = useState(0);
  const [seguroImpago, setSeguroImpago] = useState(0);
  const [periodosVacantesPct, setPeriodosVacantesPct] = useState(0.03); // % del precio inmueble
  const [porcentajeIBI, setPorcentajeIBI] = useState(0.30); // % del precio según municipio
  const [tipoMunicipioIBI, setTipoMunicipioIBI] = useState<'pueblo' | 'ciudad_media' | 'gran_ciudad' | 'capital'>('ciudad_media');

  // Seguro de vida (basado en edad e importe financiado)
  const [edadAsegurado, setEdadAsegurado] = useState(30);
  const [porcentajeSeguroVida, setPorcentajeSeguroVida] = useState(0.20);
  
  // Estado para el desplegable de edición de gastos
  const [mostrarEditarGastos, setMostrarEditarGastos] = useState(false);
  
  // Estado para guardar cambios
  const [guardando, setGuardando] = useState(false);
  const [cambiosGuardados, setCambiosGuardados] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null);

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/');
    } else {
      loadProperty();
    }
  }, [propertyId]);

  const handleGuardarCambios = async () => {
    if (!property) return;
    
    setGuardando(true);
    
    try {
      // Calcular valores que siguen usando porcentajes
      const periodosVacantesCalc = (periodosVacantesPct / 100) * precioInmueble;
      const ibiCalc = (porcentajeIBI / 100) * precioInmueble;
      const importeHipoteca = Math.max(0, precioTotal - capitalPropio);
      const seguroVidaCalc = Math.round(importeHipoteca * (porcentajeSeguroVida / 100));

      // Calcular gastosAnuales (mantenimiento, seguroHogar, seguroImpago son directos en €)
      const gastosAnualesCalculados =
        comunidadAnual +
        mantenimiento +
        seguroHogar +
        seguroVidaCalc +
        seguroImpago +
        ibiCalc +
        periodosVacantesCalc;

      const updatedProperty: PropertyData = {
        ...property,
        precio: precioInmueble,
        alquilerMensual: alquilerMensualSimulado,
        capitalPropio: capitalPropio,
        plazoHipoteca: plazoHipoteca,
        tipoInteres: tipoInteres,
        comunidadAnual: comunidadAnual,
        seguroHogar: Math.round(seguroHogar),
        ibi: Math.round(ibiCalc),
        mantenimiento: Math.round(mantenimiento),
        seguroImpago: Math.round(seguroImpago),
        periodosVacantes: Math.round(periodosVacantesCalc),
        seguroVidaHipoteca: seguroVidaCalc,
        gastosAnuales: Math.round(gastosAnualesCalculados),
      };
      
      const result = await updateProperty(updatedProperty);

      if (result.success) {
        setCambiosGuardados(true);
        setTimeout(() => setCambiosGuardados(false), 3000);
        // Actualizar el state local con la propiedad guardada
        setProperty(updatedProperty);
      } else {
        showToast('Error al guardar: ' + result.error);
      }
    } catch {
      showToast('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  // Misma función que en page.tsx para calcular seguro de vida según edad (modelo exponencial)
  // Basado en datos reales: 60 años, 180.000€ hipoteca → 2.400€/año = 1.33%
  const calcularPorcentajeSeguroVida = (edad: number): number => {
    const edadClamped = Math.max(20, Math.min(70, edad));
    return Math.round(0.03 * Math.exp(0.0632 * edadClamped) * 100) / 100;
  };

  // Misma función que en page.tsx para detectar tipo de municipio
  const detectarTipoMunicipio = (direccion: string): { tipo: 'pueblo' | 'ciudad_media' | 'gran_ciudad' | 'capital', porcentaje: number } => {
    const dir = direccion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const capitalesCaras = ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao', 'san sebastian', 'donostia', 'palma de mallorca', 'palma'];
    const grandesCiudades = ['malaga', 'zaragoza', 'murcia', 'las palmas', 'alicante', 'cordoba', 'valladolid', 'vigo', 'gijon', 'hospitalet', 'vitoria', 'santander', 'oviedo', 'pamplona', 'almeria', 'burgos', 'salamanca', 'albacete', 'castellon', 'logrono', 'badajoz', 'huelva', 'tarragona', 'leon', 'cadiz', 'jaen', 'ourense', 'girona', 'lugo', 'santiago'];
    if (capitalesCaras.some(c => dir.includes(c))) return { tipo: 'capital', porcentaje: 0.40 };
    if (grandesCiudades.some(c => dir.includes(c))) return { tipo: 'gran_ciudad', porcentaje: 0.35 };
    const indicadoresUrbanos = ['calle', 'avenida', 'avda', 'paseo', 'plaza', 'ronda', 'gran via', 'boulevard'];
    if (indicadoresUrbanos.some(i => dir.includes(i))) return { tipo: 'ciudad_media', porcentaje: 0.30 };
    return { tipo: 'ciudad_media', porcentaje: 0.30 };
  };

  const loadProperty = async () => {
    try {
      const result = await getProperties();
      if (result.success && result.properties) {
        const foundProperty = result.properties.find((p: PropertyData) => p.id === propertyId);
        if (foundProperty) {
          setProperty(foundProperty);
          
          // Inicializar valores desde la propiedad
          setPrecioInmueble(foundProperty.precio);
          setAlquilerMensualSimulado(foundProperty.alquilerMensual || 0);
          
          // Inicializar gastos fijos
          setComunidadAnual(foundProperty.comunidadAnual || 0);

          // Inicializar gastos en € (si guardados, usar esos; si no, calcular desde % por defecto)
          const rentaAnual = (foundProperty.alquilerMensual || 0) * 12;
          const defaultMantenimiento = (0.10 / 100) * foundProperty.precio;
          const defaultSeguroHogar = (0.01 / 100) * foundProperty.precio;
          const defaultSeguroImpago = (5.0 / 100) * rentaAnual;
          setMantenimiento(foundProperty.mantenimiento || Math.round(defaultMantenimiento));
          setSeguroHogar(foundProperty.seguroHogar || Math.round(defaultSeguroHogar));
          setSeguroImpago(foundProperty.seguroImpago || Math.round(defaultSeguroImpago));
          if (foundProperty.periodosVacantes && foundProperty.precio > 0) {
            setPeriodosVacantesPct(Math.round((foundProperty.periodosVacantes / foundProperty.precio) * 10000) / 100);
          }
          if (foundProperty.ibi && foundProperty.precio > 0) {
            setPorcentajeIBI(Math.round((foundProperty.ibi / foundProperty.precio) * 10000) / 100);
          }
          // Detectar tipo de municipio desde la dirección
          if (foundProperty.direccion) {
            const { tipo } = detectarTipoMunicipio(foundProperty.direccion);
            setTipoMunicipioIBI(tipo);
          }
          // Seguro de vida: inicializar edad y porcentaje
          const porcentajeVidaInit = calcularPorcentajeSeguroVida(edadAsegurado);
          setPorcentajeSeguroVida(Math.round(porcentajeVidaInit * 100) / 100);
          
          // Cargar datos de hipoteca desde la propiedad guardada
          if (foundProperty.capitalPropio) {
            setCapitalPropio(foundProperty.capitalPropio);
          } else {
            // Si no hay capital propio guardado, calcular 30% del precio total
            const gastosAdquisicion = 
              (foundProperty.itp || 0) +
              (foundProperty.iva || 0) +
              (foundProperty.notariaCompra || 0) +
              (foundProperty.registroCompra || 0) +
              (foundProperty.comisionAgencia || 0) +
              (foundProperty.gestoriaHipoteca || 0) +
              (foundProperty.tasacion || 0) +
              (foundProperty.comisionApertura || 0) +
              (foundProperty.reforma || 0);
            
            const precioTotal = foundProperty.precio + gastosAdquisicion;
            setCapitalPropio(precioTotal * 0.3); // 30% por defecto
          }
          
          // Cargar plazo de hipoteca
          if (foundProperty.plazoHipoteca) {
            setPlazoHipoteca(foundProperty.plazoHipoteca);
          }
          
          // Cargar tipo de interés
          if (foundProperty.tipoInteres) {
            setTipoInteres(foundProperty.tipoInteres);
          }
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando análisis financiero...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Propiedad no encontrada</div>
      </div>
    );
  }

  // ============ CÁLCULOS FINANCIEROS ============
  
  // Gastos de adquisición (tasas e impuestos)
  const gastosAdquisicion = 
    (property.itp || 0) +
    (property.iva || 0) +
    (property.notariaCompra || 0) +
    (property.registroCompra || 0) +
    (property.comisionAgencia || 0) +
    (property.gestoriaHipoteca || 0) +
    (property.tasacion || 0) +
    (property.comisionApertura || 0) +
    (property.reforma || 0);
  
  // Precio total = Precio negociado del inmueble + Gastos
  const precioTotal = precioInmueble + gastosAdquisicion;

  const capitalFinanciado = precioTotal - capitalPropio;
  const cuotaMensualHipoteca = capitalFinanciado > 0 
    ? (capitalFinanciado * (tipoInteres / 100 / 12)) / (1 - Math.pow(1 + (tipoInteres / 100 / 12), -(plazoHipoteca * 12)))
    : 0;

  const alquilerMensual = alquilerMensualSimulado;
  const rentaAnual = alquilerMensual * 12;

  // mantenimiento, seguroHogar, seguroImpago son estados directos en €
  const periodosVacantes = (periodosVacantesPct / 100) * precioInmueble;
  const ibi = (porcentajeIBI / 100) * precioInmueble;
  const importeFinanciado = Math.max(0, precioTotal - capitalPropio);
  const seguroVidaHipoteca = Math.round(importeFinanciado * (porcentajeSeguroVida / 100));

  // Gastos anuales de vivienda (usando valores simulados)
  const gastosAnuales =
    comunidadAnual +
    mantenimiento +
    seguroHogar +
    seguroVidaHipoteca +
    seguroImpago +
    ibi +
    periodosVacantes;

  const cuotaAnualHipoteca = cuotaMensualHipoteca * 12;

  // CASH FLOW ANUAL
  const cashFlowAnual = rentaAnual - gastosAnuales - cuotaAnualHipoteca;
  const cashFlowMensual = cashFlowAnual / 12;

  // RENTABILIDAD BRUTA (yield bruto)
  const rentabilidadBruta = precioTotal > 0 ? (rentaAnual / precioTotal) * 100 : 0;

  // RENTABILIDAD NETA (yield neto - sin considerar financiación)
  const rentabilidadNeta = precioTotal > 0 ? ((rentaAnual - gastosAnuales) / precioTotal) * 100 : 0;

  // AMORTIZACIÓN ANUAL DE HIPOTECA (primer año)
  const tasaMensual = tipoInteres / 100 / 12;
  let amortizacionAnual = 0;
  let saldoHipoteca = capitalFinanciado;
  
  for (let mes = 0; mes < 12; mes++) {
    const interesMes = saldoHipoteca * tasaMensual;
    const amortizacionMes = cuotaMensualHipoteca - interesMes;
    amortizacionAnual += amortizacionMes;
    saldoHipoteca -= amortizacionMes;
  }

  // REVALORIZACIÓN ANUAL DEL INMUEBLE (usando inflación como proxy)
  const revalorizacionAnual = precioInmueble * (inflacion / 100);

  // ROI SIMPLE (solo Cash Flow)
  const roiSimple = capitalPropio > 0 ? (cashFlowAnual / capitalPropio) * 100 : 0;

  // ROI TOTAL (incluye Cash Flow + Amortización + Revalorización)
  const gananciaTotal = cashFlowAnual + amortizacionAnual + revalorizacionAnual;
  const roi = capitalPropio > 0 ? (gananciaTotal / capitalPropio) * 100 : 0;

  // PAYBACK PERIOD (años para recuperar inversión)
  const paybackPeriod = cashFlowAnual > 0 ? capitalPropio / cashFlowAnual : 0;

  // TIR (Tasa Interna de Retorno) - Incluye valor residual del inmueble
  const calcularTIR = () => {
    // Simulación de flujos de caja a 30 años
    const flujos = [-capitalPropio]; // Inversión inicial (capital propio)
    let alquilerActual = alquilerMensual;
    let gastosActuales = gastosAnuales;
    let saldoHipotecaPendiente = capitalFinanciado;
    const tasaMensualHipoteca = tipoInteres / 100 / 12;
    
    // Apreciación anual estimada del inmueble (igual a inflación por defecto)
    const apreciacionInmueble = inflacion / 100;
    let valorInmueble = precioInmueble;
    
    for (let año = 1; año <= 30; año++) {
      const rentaAnualAjustada = alquilerActual * 12;
      
      // Solo pagar hipoteca si quedan años de plazo
      let cuotaHipotecaAño = 0;
      if (año <= plazoHipoteca && saldoHipotecaPendiente > 0) {
        cuotaHipotecaAño = cuotaAnualHipoteca;
        // Calcular amortización del año
        for (let mes = 0; mes < 12; mes++) {
          const interesMes = saldoHipotecaPendiente * tasaMensualHipoteca;
          const amortizacionMes = cuotaMensualHipoteca - interesMes;
          saldoHipotecaPendiente = Math.max(0, saldoHipotecaPendiente - amortizacionMes);
        }
      }
      
      const cashFlowAñoActual = rentaAnualAjustada - gastosActuales - cuotaHipotecaAño;
      
      // Actualizar valor del inmueble
      valorInmueble *= (1 + apreciacionInmueble);
      
      // En el último año, añadir valor residual (venta del inmueble - deuda pendiente)
      if (año === 30) {
        const valorResidual = valorInmueble - saldoHipotecaPendiente;
        flujos.push(cashFlowAñoActual + valorResidual);
      } else {
        flujos.push(cashFlowAñoActual);
      }
      
      // Ajustar por inflación para el próximo año
      alquilerActual *= (1 + incrementoAlquiler / 100);
      gastosActuales *= (1 + inflacion / 100);
    }
    
    // Aproximación de TIR usando búsqueda binaria
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
  };

  // VAN (Valor Actual Neto) usando la tasa de descuento
  const calcularVAN = () => {
    let van = -capitalPropio;
    let alquilerActual = alquilerMensual;
    let gastosActuales = gastosAnuales;
    let saldoHipotecaPendiente = capitalFinanciado;
    const tasaMensualHipoteca = tipoInteres / 100 / 12;
    let valorInmueble = precioInmueble;
    
    for (let año = 1; año <= 30; año++) {
      const rentaAnualAjustada = alquilerActual * 12;
      
      let cuotaHipotecaAño = 0;
      if (año <= plazoHipoteca && saldoHipotecaPendiente > 0) {
        cuotaHipotecaAño = cuotaAnualHipoteca;
        for (let mes = 0; mes < 12; mes++) {
          const interesMes = saldoHipotecaPendiente * tasaMensualHipoteca;
          const amortizacionMes = cuotaMensualHipoteca - interesMes;
          saldoHipotecaPendiente = Math.max(0, saldoHipotecaPendiente - amortizacionMes);
        }
      }
      
      let flujoAño = rentaAnualAjustada - gastosActuales - cuotaHipotecaAño;
      valorInmueble *= (1 + inflacion / 100);
      
      if (año === 30) {
        flujoAño += valorInmueble - saldoHipotecaPendiente;
      }
      
      // Usar tipo de interés de la hipoteca como tasa de descuento
      van += flujoAño / Math.pow(1 + tipoInteres / 100, año);
      
      alquilerActual *= (1 + incrementoAlquiler / 100);
      gastosActuales *= (1 + inflacion / 100);
    }
    
    return van;
  };

  const tir = calcularTIR();
  const van = calcularVAN();

  // TABLA DE AMORTIZACIÓN (primeros 5 años)
  const calcularTablaAmortizacion = () => {
    const tabla = [];
    let saldoPendiente = capitalFinanciado;
    const tasaMensual = tipoInteres / 100 / 12;
    
    let interesesAcumuladosAño = 0;
    let amortizacionAcumuladaAño = 0;
    
    for (let mes = 1; mes <= Math.min(60, plazoHipoteca * 12); mes++) {
      const interesMes = saldoPendiente * tasaMensual;
      const amortizacionMes = cuotaMensualHipoteca - interesMes;
      saldoPendiente -= amortizacionMes;
      
      // Acumular valores del año
      interesesAcumuladosAño += interesMes;
      amortizacionAcumuladaAño += amortizacionMes;
      
      if (mes % 12 === 0) { // Al final de cada año
        tabla.push({
          año: mes / 12,
          cuota: Math.round(cuotaMensualHipoteca * 12),
          intereses: Math.round(interesesAcumuladosAño),
          amortizacion: Math.round(amortizacionAcumuladaAño),
          saldoPendiente: Math.round(Math.max(0, saldoPendiente))
        });
        // Resetear acumuladores para el siguiente año
        interesesAcumuladosAño = 0;
        amortizacionAcumuladaAño = 0;
      }
    }
    
    return tabla;
  };

  const tablaAmortizacion = calcularTablaAmortizacion();

  // EVOLUCIÓN DE RENTABILIDAD A 10 AÑOS
  const calcularEvolucionRentabilidad = () => {
    const evolucion = [];
    let alquilerActual = alquilerMensual;
    let saldoHipoteca = capitalFinanciado;
    const tasaMensual = tipoInteres / 100 / 12;
    
    for (let año = 1; año <= 10; año++) {
      const rentaAnualAjustada = alquilerActual * 12;
      const gastosAjustados = gastosAnuales * Math.pow(1 + inflacion / 100, año - 1);
      
      // Calcular amortización anual de hipoteca
      let amortizacionAnual = 0;
      for (let mes = 0; mes < 12; mes++) {
        const interesMes = saldoHipoteca * tasaMensual;
        const amortizacionMes = cuotaMensualHipoteca - interesMes;
        amortizacionAnual += amortizacionMes;
        saldoHipoteca -= amortizacionMes;
      }
      
      const cashFlowAño = rentaAnualAjustada - gastosAjustados - cuotaAnualHipoteca;
      const rentabilidadNetaAño = ((rentaAnualAjustada - gastosAjustados) / precioTotal) * 100;
      
      evolucion.push({
        año: `Año ${año}`,
        'Renta Anual': Math.round(rentaAnualAjustada),
        'Cash Flow': Math.round(cashFlowAño),
        'Rentabilidad (%)': parseFloat(rentabilidadNetaAño.toFixed(2))
      });
      
      // Incrementar alquiler
      alquilerActual *= (1 + incrementoAlquiler / 100);
    }
    
    return evolucion;
  };

  const evolucionRentabilidad = calcularEvolucionRentabilidad();

  // COMPARATIVA CON/SIN FINANCIACIÓN
  const calcularComparativaSinFinanciacion = () => {
    const rentabilidadSinFinanciacion = ((rentaAnual - gastosAnuales) / precioTotal) * 100;
    const roiSinFinanciacion = ((rentaAnual - gastosAnuales) / precioTotal) * 100;
    
    return {
      conFinanciacion: {
        inversion: capitalPropio,
        cashFlowAnual: cashFlowAnual,
        roi: roi,
        rentabilidadNeta: rentabilidadNeta
      },
      sinFinanciacion: {
        inversion: precioTotal,
        cashFlowAnual: rentaAnual - gastosAnuales,
        roi: roiSinFinanciacion,
        rentabilidadNeta: rentabilidadSinFinanciacion
      }
    };
  };

  const comparativa = calcularComparativaSinFinanciacion();

  // Datos para el gráfico de distribución de gastos (usar valores simulados)
  const datosGastos = [
    { name: 'Hipoteca', value: Math.round(cuotaAnualHipoteca), color: '#8b5cf6' },
    { name: 'Comunidad', value: comunidadAnual, color: '#ec4899' },
    { name: 'Mantenimiento', value: Math.round(mantenimiento), color: '#f59e0b' },
    { name: 'Seguros', value: Math.round(seguroHogar + seguroVidaHipoteca + seguroImpago), color: '#10b981' },
    { name: 'IBI', value: Math.round(ibi), color: '#3b82f6' },
    { name: 'Periodos Vacantes', value: Math.round(periodosVacantes), color: '#ef4444' },
  ].filter(item => item.value > 0);

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  // Exportar PDF
  const handleExportPDF = () => {
    const reportData: PDFReportData = {
      nombre: property.nombre,
      direccion: property.direccion,
      precio: precioInmueble,
      superficie: property.superficie,
      habitaciones: property.habitaciones,
      banos: property.banos,
      tipoPropiedad: property.tipoPropiedad,
      estado: property.estado,
      descripcion: property.descripcion,
      caracteristicas: property.caracteristicas,
      alquilerMensual,
      rentaAnual,
      itp: property.itp || 0,
      iva: property.iva || 0,
      notariaCompra: property.notariaCompra || 0,
      registroCompra: property.registroCompra || 0,
      comisionAgencia: property.comisionAgencia || 0,
      gestoriaHipoteca: property.gestoriaHipoteca || 0,
      tasacion: property.tasacion || 0,
      comisionApertura: property.comisionApertura || 0,
      reforma: property.reforma || 0,
      gastosAdquisicion,
      precioTotal,
      capitalPropio,
      capitalFinanciado,
      plazoHipoteca,
      tipoInteres,
      cuotaMensualHipoteca,
      cuotaAnualHipoteca,
      comunidadAnual,
      mantenimiento,
      seguroHogar,
      seguroVidaHipoteca,
      seguroImpago,
      ibi,
      periodosVacantes,
      gastosAnuales,
      cashFlowAnual,
      cashFlowMensual,
      rentabilidadBruta,
      rentabilidadNeta,
      roiSimple,
      roi,
      gananciaTotal,
      amortizacionAnual,
      revalorizacionAnual,
      paybackPeriod,
      tir,
      van,
      inflacion,
      incrementoAlquiler,
      tablaAmortizacion,
      evolucionRentabilidad,
      datosGastos,
      comparativa,
    };
    generatePDF(reportData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <FeedbackButton />

      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-teal-600 text-white'}`}>
          {toast.type === 'error' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
          {toast.msg}
        </div>
      )}
      <div className="max-w-[1800px] mx-auto">
        <DashboardHeader
          propertyName={property.nombre}
          propertyAddress={property.direccion}
          onBack={() => { window.location.href = '/'; }}
          onExportPDF={handleExportPDF}
        />

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">💰 Beneficios</h3>
          <BenefitsCards
            cashFlowAnual={cashFlowAnual}
            capitalPropio={capitalPropio}
            revalorizacionAnual={revalorizacionAnual}
            inflacion={inflacion}
          />
          <ROIReturnBox
            capitalPropio={capitalPropio}
            gananciaTotal={gananciaTotal}
            roi={roi}
            cashFlowAnual={cashFlowAnual}
            amortizacionAnual={amortizacionAnual}
            revalorizacionAnual={revalorizacionAnual}
            inflacion={inflacion}
          />
        </div>

        <SimulationSliders
          capitalPropio={capitalPropio}
          plazoHipoteca={plazoHipoteca}
          tipoInteres={tipoInteres}
          precioInmueble={precioInmueble}
          precioTotal={precioTotal}
          gastosAdquisicion={gastosAdquisicion}
          alquilerMensualSimulado={alquilerMensualSimulado}
          incrementoAlquiler={incrementoAlquiler}
          property={property}
          onCapitalPropioChange={setCapitalPropio}
          onPlazoChange={setPlazoHipoteca}
          onTipoInteresChange={setTipoInteres}
          onPrecioInmuebleChange={setPrecioInmueble}
          onAlquilerChange={setAlquilerMensualSimulado}
          onIncrementoAlquilerChange={setIncrementoAlquiler}
        />

        {/* Gráficos - Grid de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProfitabilityChart data={evolucionRentabilidad} />
          <ExpenseEditor
            mostrarEditarGastos={mostrarEditarGastos}
            setMostrarEditarGastos={setMostrarEditarGastos}
            comunidadAnual={comunidadAnual}
            setComunidadAnual={setComunidadAnual}
            mantenimiento={mantenimiento}
            setMantenimiento={setMantenimiento}
            seguroHogar={seguroHogar}
            setSeguroHogar={setSeguroHogar}
            seguroImpago={seguroImpago}
            setSeguroImpago={setSeguroImpago}
            porcentajeIBI={porcentajeIBI}
            setPorcentajeIBI={setPorcentajeIBI}
            periodosVacantesPct={periodosVacantesPct}
            setPeriodosVacantesPct={setPeriodosVacantesPct}
            porcentajeSeguroVida={porcentajeSeguroVida}
            setPorcentajeSeguroVida={setPorcentajeSeguroVida}
            edadAsegurado={edadAsegurado}
            setEdadAsegurado={setEdadAsegurado}
            tipoMunicipioIBI={tipoMunicipioIBI}
            setTipoMunicipioIBI={setTipoMunicipioIBI}
            precioInmueble={precioInmueble}
            rentaAnual={rentaAnual}
            periodosVacantes={periodosVacantes}
            ibi={ibi}
            seguroVidaHipoteca={seguroVidaHipoteca}
            importeFinanciado={importeFinanciado}
            gastosAnuales={gastosAnuales}
            datosGastos={datosGastos}
            calcularPorcentajeSeguroVida={calcularPorcentajeSeguroVida}
          />
        </div>

        <AmortizationTable data={tablaAmortizacion} />
        <FinancingComparison comparativa={comparativa} roi={roi} />
      </div>
      
      <FloatingSaveButton
        onSave={handleGuardarCambios}
        guardando={guardando}
        cambiosGuardados={cambiosGuardados}
      />
    </div>
  );
}
