"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PropertyData, getProperties, updateProperty } from "@/services/api";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [seguroHogar, setSeguroHogar] = useState(0);
  const [ibi, setIbi] = useState(0);
  
  // Estados para gastos en porcentajes
  const [mantenimientoPct, setMantenimientoPct] = useState(1.0); // % del precio inmueble
  const [seguroImpagoPct, setSeguroImpagoPct] = useState(4.0); // % de la renta anual
  const [periodosVacantesPct, setPeriodosVacantesPct] = useState(5.0); // % de la renta anual
  
  // Estados para cálculos con IA
  const [calculandoComunidad, setCalculandoComunidad] = useState(false);
  const [calculandoMantenimiento, setCalculandoMantenimiento] = useState(false);
  const [calculandoSeguroHogar, setCalculandoSeguroHogar] = useState(false);
  const [calculandoSeguroImpago, setCalculandoSeguroImpago] = useState(false);
  const [calculandoIBI, setCalculandoIBI] = useState(false);
  const [calculandoVacantes, setCalculandoVacantes] = useState(false);
  
  // Estado para el desplegable de edición de gastos
  const [mostrarEditarGastos, setMostrarEditarGastos] = useState(false);
  
  // Estado para guardar cambios
  const [guardando, setGuardando] = useState(false);
  const [cambiosGuardados, setCambiosGuardados] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const handleGuardarCambios = async () => {
    if (!property) return;
    
    setGuardando(true);
    
    try {
      // Calcular valores desde porcentajes
      const mantenimiento = (mantenimientoPct / 100) * precioInmueble;
      const rentaAnual = alquilerMensualSimulado * 12;
      const seguroImpago = (seguroImpagoPct / 100) * rentaAnual;
      const periodosVacantes = (periodosVacantesPct / 100) * rentaAnual;
      
      // Calcular gastosAnuales
      const gastosAnualesCalculados =
        comunidadAnual +
        mantenimiento +
        seguroHogar +
        (property.seguroVidaHipoteca || 0) +
        seguroImpago +
        ibi +
        periodosVacantes;
      
      // Actualizar la propiedad con todos los valores editados
      const updatedProperty: PropertyData = {
        ...property,
        precio: precioInmueble,
        alquilerMensual: alquilerMensualSimulado,
        capitalPropio: capitalPropio,
        plazoHipoteca: plazoHipoteca,
        tipoInteres: tipoInteres,
        comunidadAnual: comunidadAnual,
        seguroHogar: seguroHogar,
        ibi: ibi,
        mantenimiento: Math.round(mantenimiento),
        seguroImpago: Math.round(seguroImpago),
        periodosVacantes: Math.round(periodosVacantes),
        gastosAnuales: Math.round(gastosAnualesCalculados),
      };
      
      console.log('📊 Guardando propiedad con ROI data:', {
        precio: updatedProperty.precio,
        alquilerMensual: updatedProperty.alquilerMensual,
        gastosAnuales: updatedProperty.gastosAnuales,
        capitalPropio: updatedProperty.capitalPropio,
        plazoHipoteca: updatedProperty.plazoHipoteca,
        tipoInteres: updatedProperty.tipoInteres
      });
      
      const result = await updateProperty(updatedProperty);
      
      if (result.success) {
        setCambiosGuardados(true);
        setTimeout(() => setCambiosGuardados(false), 3000);
        // Actualizar el state local con la propiedad guardada
        setProperty(updatedProperty);
      } else {
        alert('Error al guardar: ' + result.error);
      }
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const calcularComunidadAproximada = () => {
    setCalculandoComunidad(true);
    // Fórmula: 50-150€/mes según tipo de edificio
    const metrosCuadrados = 80; // Valor estándar
    const comunidadMensual = 100; // ~100€/mes promedio
    setComunidadAnual(comunidadMensual * 12);
    setTimeout(() => setCalculandoComunidad(false), 1000);
  };

  const calcularMantenimientoAproximado = () => {
    setCalculandoMantenimiento(true);
    // Fórmula estándar: 1% del precio del inmueble
    setMantenimientoPct(1.0);
    setTimeout(() => setCalculandoMantenimiento(false), 1000);
  };

  const calcularSeguroHogarAproximado = () => {
    setCalculandoSeguroHogar(true);
    // Fórmula: 200-400€/año según valor
    const seguroEstimado = 200 + (precioInmueble / 1000); // Base + incremento por valor
    setSeguroHogar(Math.min(1000, Math.round(seguroEstimado)));
    setTimeout(() => setCalculandoSeguroHogar(false), 1000);
  };

  const calcularSeguroImpagoAproximado = () => {
    setCalculandoSeguroImpago(true);
    // Fórmula estándar: 4-5% de la renta anual
    setSeguroImpagoPct(4.5);
    setTimeout(() => setCalculandoSeguroImpago(false), 1000);
  };

  const calcularIBIAproximado = () => {
    setCalculandoIBI(true);
    // Fórmula aproximada: 0.4% - 1.1% del valor catastral (aprox 50% del precio de mercado)
    // Usamos 0.6% como promedio sobre el 50% del precio
    const valorCatastralEstimado = precioInmueble * 0.5;
    const ibiEstimado = valorCatastralEstimado * 0.006;
    setIbi(Math.round(ibiEstimado));
    setTimeout(() => setCalculandoIBI(false), 1000);
  };

  const calcularVacantesAproximado = () => {
    setCalculandoVacantes(true);
    // Fórmula estándar: 5% de la renta anual (equivale a ~18 días vacíos)
    setPeriodosVacantesPct(5.0);
    setTimeout(() => setCalculandoVacantes(false), 1000);
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
          setSeguroHogar(foundProperty.seguroHogar || 0);
          setIbi(foundProperty.ibi || 0);
          
          // Calcular porcentajes iniciales desde los valores de la propiedad
          const rentaAnual = (foundProperty.alquilerMensual || 0) * 12;
          if (foundProperty.mantenimiento && foundProperty.precio > 0) {
            setMantenimientoPct((foundProperty.mantenimiento / foundProperty.precio) * 100);
          }
          if (foundProperty.seguroImpago && rentaAnual > 0) {
            setSeguroImpagoPct((foundProperty.seguroImpago / rentaAnual) * 100);
          }
          if (foundProperty.periodosVacantes && rentaAnual > 0) {
            setPeriodosVacantesPct((foundProperty.periodosVacantes / rentaAnual) * 100);
          }
          
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
    } catch (error) {
      console.error('Error cargando propiedad:', error);
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

  // Calcular gastos desde porcentajes
  const mantenimiento = (mantenimientoPct / 100) * precioInmueble;
  const seguroImpago = (seguroImpagoPct / 100) * rentaAnual;
  const periodosVacantes = (periodosVacantesPct / 100) * rentaAnual;

  // Gastos anuales de vivienda (usando valores simulados)
  const gastosAnuales = 
    comunidadAnual +
    mantenimiento +
    seguroHogar +
    (property.seguroVidaHipoteca || 0) +
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
    { name: 'Seguros', value: Math.round(seguroHogar + (property.seguroVidaHipoteca || 0) + seguroImpago), color: '#10b981' },
    { name: 'IBI', value: ibi, color: '#3b82f6' },
    { name: 'Periodos Vacantes', value: Math.round(periodosVacantes), color: '#ef4444' },
  ].filter(item => item.value > 0);

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              // Navegar a la página principal con recarga completa
              window.location.href = '/';
            }}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">📈 Análisis Financiero Avanzado</h1>
          <p className="text-xl text-gray-400">{property.nombre}</p>
          <p className="text-gray-500">{property.direccion}</p>
        </div>

        {/* Beneficios */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">💰 Beneficios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-gray-400 mb-1">Cash Flow Anual</p>
              <p className={`text-2xl font-bold ${cashFlowAnual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
              </p>
              <p className="text-xs text-gray-500 mt-1">Dinero líquido después de gastos e hipoteca</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-gray-400 mb-1">Tiempo para Recuperar Inversión</p>
              <p className="text-2xl font-bold text-blue-400">
                {cashFlowAnual > 0 ? (capitalPropio / cashFlowAnual).toFixed(1) : '∞'} años
              </p>
              <p className="text-xs text-gray-500 mt-1">Basado solo en cash flow</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-gray-400 mb-1">Revalorización Anual</p>
              <p className="text-2xl font-bold text-purple-400">
                {revalorizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
              </p>
              <p className="text-xs text-gray-500 mt-1">{inflacion}% sobre precio inmueble</p>
            </div>
          </div>
          
          {/* Retorno del Capital Empleado Anual - Cuadro Grande */}
          <div className="mt-6 bg-gradient-to-br from-emerald-900/40 to-green-800/40 border-2 border-emerald-500/60 rounded-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h4 className="text-2xl font-bold text-emerald-300">💰 Retorno del Capital Empleado Anual</h4>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-300">Capital Invertido</p>
                <p className="text-xl font-bold text-white">{capitalPropio.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-950/50 rounded-lg p-6 border border-emerald-500/30">
                <p className="text-sm text-emerald-300 mb-2">Retorno Total Anual</p>
                <p className="text-4xl font-bold text-emerald-400 mb-2">
                  {gananciaTotal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Cash Flow + Amortización + Revalorización</span>
                </div>
              </div>
              
              <div className="bg-emerald-950/50 rounded-lg p-6 border border-emerald-500/30">
                <p className="text-sm text-emerald-300 mb-2">ROI (Rentabilidad)</p>
                <p className={`text-4xl font-bold mb-2 ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {roi.toFixed(2)}%
                </p>
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <p className="text-xs text-gray-300">Recuperación total:</p>
                  <p className="text-lg font-bold text-emerald-300">
                    {gananciaTotal > 0 ? (capitalPropio / gananciaTotal).toFixed(1) : '∞'} años
                  </p>
                </div>
              </div>
              
              <div className="bg-emerald-950/50 rounded-lg p-6 border border-emerald-500/30">
                <p className="text-sm text-emerald-300 mb-2">Ganancia Total Anual</p>
                <p className="text-4xl font-bold text-emerald-400 mb-2">
                  {gananciaTotal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                </p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>💵 Cash Flow:</span>
                    <span className="font-semibold">{cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>🏦 Amortización:</span>
                    <span className="font-semibold">{amortizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>📈 Revalorización:</span>
                    <span className="font-semibold">{revalorizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Explicación detallada */}
            <div className="mt-6 bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-emerald-300 mb-3">📊 ¿Qué incluye la Ganancia Total Anual?</h5>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex gap-3">
                  <span className="text-emerald-400 font-bold">💵</span>
                  <div>
                    <strong className="text-emerald-300">Cash Flow ({cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/año):</strong>
                    <span className="text-gray-400"> Dinero líquido que entra en tu cuenta cada año después de pagar todos los gastos y la hipoteca.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 font-bold">🏦</span>
                  <div>
                    <strong className="text-blue-300">Amortización ({amortizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/año):</strong>
                    <span className="text-gray-400"> Parte de las cuotas hipotecarias que reduce tu deuda y aumenta tu patrimonio (equity) en el inmueble.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">📈</span>
                  <div>
                    <strong className="text-purple-300">Revalorización ({revalorizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/año):</strong>
                    <span className="text-gray-400"> Incremento del valor del inmueble anual basado en la tasa de inflación ({inflacion}%).</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <p className="text-emerald-300 font-semibold">
                    💰 Total: {gananciaTotal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/año
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Esto representa un retorno del {roi.toFixed(2)}% anual sobre tu capital invertido de {capitalPropio.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 <strong>ROI Total</strong> incluye tres componentes: el flujo de caja generado por el alquiler, 
              la amortización del préstamo (que aumenta tu patrimonio), y la revalorización del inmueble ajustada por inflación.
            </p>
          </div>
        </div>

        {/* Capital Propio Requerido - se movió aquí */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Inversión Total */}
        </div>

        {/* Sliders de Control - Panel expandible */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Ajustar Parámetros de Simulación
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Capital Propio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Capital Propio: <span className="text-teal-400 font-bold">{capitalPropio.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                <span className="text-gray-400 text-xs ml-2">({((capitalPropio / precioTotal) * 100).toFixed(0)}%)</span>
              </label>
              <input
                type="range"
                min={precioTotal * 0.1}
                max={precioTotal}
                step={1000}
                value={capitalPropio}
                onChange={(e) => setCapitalPropio(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Plazo Hipoteca */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Plazo Hipoteca: <span className="text-purple-400 font-bold">{plazoHipoteca} años</span>
              </label>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={plazoHipoteca}
                onChange={(e) => setPlazoHipoteca(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 años</span>
                <span>40 años</span>
              </div>
            </div>

            {/* Tipo de Interés */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tipo de Interés: <span className="text-pink-400 font-bold">{tipoInteres.toFixed(2)}%</span>
              </label>
              <input
                type="range"
                min={1}
                max={8}
                step={0.1}
                value={tipoInteres}
                onChange={(e) => setTipoInteres(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>8%</span>
              </div>
            </div>

            {/* Precio del Inmueble */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Precio Inmueble (Negociable): <span className="text-orange-400 font-bold">{precioInmueble.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
              </label>
              <input
                type="range"
                min={property.precio * 0.8}
                max={property.precio * 1.2}
                step={1000}
                value={precioInmueble}
                onChange={(e) => setPrecioInmueble(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{(property.precio * 0.8).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                <span>{(property.precio * 1.2).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Precio total: {precioTotal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ (Inmueble + {gastosAdquisicion.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ costes de adquisición)
              </p>
            </div>

            {/* Precio de Alquiler */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Precio Alquiler Mensual: <span className="text-green-400 font-bold">{alquilerMensualSimulado.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
              </label>
              <input
                type="range"
                min={Math.max(100, (property.alquilerMensual || 500) * 0.5)}
                max={(property.alquilerMensual || 500) * 1.5}
                step={10}
                value={alquilerMensualSimulado}
                onChange={(e) => setAlquilerMensualSimulado(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.max(100, (property.alquilerMensual || 500) * 0.5).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                <span>{((property.alquilerMensual || 500) * 1.5).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Anual: {(alquilerMensualSimulado * 12).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
              </p>
            </div>

            {/* Incremento Alquiler */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Incremento Alquiler: <span className="text-blue-400 font-bold">{incrementoAlquiler.toFixed(1)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={incrementoAlquiler}
                onChange={(e) => setIncrementoAlquiler(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>10%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 Ajusta los sliders para simular diferentes escenarios y ver cómo afectan a la rentabilidad de tu inversión
            </p>
          </div>
        </div>

        {/* Gráficos - Grid de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evolución de Rentabilidad */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Evolución Proyectada (10 años)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucionRentabilidad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="año" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Renta Anual" stroke="#14b8a6" strokeWidth={2} />
                <Line type="monotone" dataKey="Cash Flow" stroke="#a855f7" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución de Gastos */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Distribución de Gastos Anuales</h3>
              <button
                onClick={() => setMostrarEditarGastos(!mostrarEditarGastos)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-lg font-semibold transition-all shadow-lg text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {mostrarEditarGastos ? 'Cerrar' : 'Editar Gastos'}
              </button>
            </div>
            
            {/* Desplegable animado para editar gastos */}
            <div 
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                mostrarEditarGastos ? 'max-h-[900px] opacity-100 mb-6' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="bg-slate-900/50 rounded-lg p-6 border border-teal-500/30">
                <h4 className="text-lg font-bold text-teal-400 mb-4">⚙️ Ajustar Gastos Anuales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Comunidad Anual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Comunidad Anual: <span className="text-teal-400 font-bold">{comunidadAnual.toLocaleString('es-ES')}€</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={calcularComunidadAproximada}
                        disabled={calculandoComunidad}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded text-xs font-semibold transition-all"
                      >
                        {calculandoComunidad ? '...' : '🤖'}
                      </button>
                      <span className="text-xs text-gray-400 self-center">Promedio: ~100€/mes (1.200€/año)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={3000}
                      step={50}
                      value={comunidadAnual}
                      onChange={(e) => setComunidadAnual(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0€</span>
                      <span>3.000€</span>
                    </div>
                  </div>

                  {/* Mantenimiento (%) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Mantenimiento: <span className="text-teal-400 font-bold">{mantenimientoPct.toFixed(1)}%</span> 
                      <span className="text-gray-400 text-xs ml-2">({mantenimiento.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€)</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={calcularMantenimientoAproximado}
                        disabled={calculandoMantenimiento}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded text-xs font-semibold transition-all"
                      >
                        {calculandoMantenimiento ? '...' : '🤖'}
                      </button>
                      <span className="text-xs text-gray-400 self-center">Recomendado: 1% del valor del inmueble</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.1}
                      value={mantenimientoPct}
                      onChange={(e) => setMantenimientoPct(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0% del precio</span>
                      <span>5% del precio</span>
                    </div>
                  </div>

                  {/* Seguro Hogar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Seguro Hogar: <span className="text-teal-400 font-bold">{seguroHogar.toLocaleString('es-ES')}€</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={calcularSeguroHogarAproximado}
                        disabled={calculandoSeguroHogar}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded text-xs font-semibold transition-all"
                      >
                        {calculandoSeguroHogar ? '...' : '🤖'}
                      </button>
                      <span className="text-xs text-gray-400 self-center">Promedio: 200-400€/año según valor</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      step={10}
                      value={seguroHogar}
                      onChange={(e) => setSeguroHogar(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0€</span>
                      <span>1.000€</span>
                    </div>
                  </div>

                  {/* Seguro Impago (%) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Seguro Impago: <span className="text-teal-400 font-bold">{seguroImpagoPct.toFixed(1)}%</span>
                      <span className="text-gray-400 text-xs ml-2">({seguroImpago.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€)</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={calcularSeguroImpagoAproximado}
                        disabled={calculandoSeguroImpago}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded text-xs font-semibold transition-all"
                      >
                        {calculandoSeguroImpago ? '...' : '🤖'}
                      </button>
                      <span className="text-xs text-gray-400 self-center">Típico: 4-5% de la renta anual</span>
                    </div>
                    {seguroImpagoPct === 0 && (
                      <div className="mb-2 p-2 bg-red-900/30 border border-red-500/50 rounded">
                        <p className="text-xs text-red-400 font-semibold">
                          ⚠️ Debido a la situación actual, es MUY RECOMENDABLE tener seguro de impago por riesgo de Okupación
                        </p>
                      </div>
                    )}
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={seguroImpagoPct}
                      onChange={(e) => setSeguroImpagoPct(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0% de renta</span>
                      <span>10% de renta</span>
                    </div>
                  </div>

                  {/* IBI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      IBI: <span className="text-teal-400 font-bold">{ibi.toLocaleString('es-ES')}€</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={calcularIBIAproximado}
                        disabled={calculandoIBI}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded text-xs font-semibold transition-all"
                      >
                        {calculandoIBI ? '...' : '🤖'}
                      </button>
                      <span className="text-xs text-gray-400 self-center">Fórmula: 0.6% del valor catastral</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10000}
                      step={50}
                      value={ibi}
                      onChange={(e) => setIbi(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0€</span>
                      <span>10.000€</span>
                    </div>
                  </div>

                  {/* Periodos Vacantes (%) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Periodos Vacantes: <span className="text-teal-400 font-bold">{periodosVacantesPct.toFixed(1)}%</span>
                      <span className="text-gray-400 text-xs ml-2">({periodosVacantes.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€)</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={calcularVacantesAproximado}
                        disabled={calculandoVacantes}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded text-xs font-semibold transition-all"
                      >
                        {calculandoVacantes ? '...' : '🤖'}
                      </button>
                      <span className="text-xs text-gray-400 self-center">Estándar: 5% (~18 días vacíos/año)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={0.5}
                      value={periodosVacantesPct}
                      onChange={(e) => setPeriodosVacantesPct(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0% de renta</span>
                      <span>20% de renta</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    ⚠️ <strong>Valores aproximados:</strong> La Comunidad Anual y el IBI son estimaciones. Para datos exactos, consulta con la inmobiliaria o el propietario actual.
                  </p>
                </div>
                <div className="mt-2 p-3 bg-teal-900/20 border border-teal-500/30 rounded-lg">
                  <p className="text-sm text-teal-300">
                    📊 Total gastos anuales: <strong>{gastosAnuales.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</strong>
                  </p>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosGastos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosGastos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  formatter={(value: any) => `${value.toLocaleString('es-ES')}€`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Amortización */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Tabla de Amortización (Primeros 5 años)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-gray-300 font-semibold">Año</th>
                  <th className="pb-3 text-gray-300 font-semibold">Cuota Anual</th>
                  <th className="pb-3 text-gray-300 font-semibold">Intereses</th>
                  <th className="pb-3 text-gray-300 font-semibold">Amortización</th>
                  <th className="pb-3 text-gray-300 font-semibold">Saldo Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {tablaAmortizacion.map((fila) => (
                  <tr key={fila.año} className="border-b border-slate-700/50">
                    <td className="py-3 text-white">Año {fila.año}</td>
                    <td className="py-3 text-teal-400">{fila.cuota.toLocaleString('es-ES')}€</td>
                    <td className="py-3 text-red-400">{fila.intereses.toLocaleString('es-ES')}€</td>
                    <td className="py-3 text-green-400">{fila.amortizacion.toLocaleString('es-ES')}€</td>
                    <td className="py-3 text-gray-300">{fila.saldoPendiente.toLocaleString('es-ES')}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparativa Con/Sin Financiación */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Comparativa: Con vs Sin Financiación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Con Financiación */}
            <div className="bg-gradient-to-br from-teal-900/30 to-teal-800/30 border border-teal-500/50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-teal-400 mb-4">Con Financiación (Apalancamiento)</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Inversión inicial:</span>
                  <span className="text-white font-semibold">{comparativa.conFinanciacion.inversion.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cash Flow anual:</span>
                  <span className={`font-semibold ${comparativa.conFinanciacion.cashFlowAnual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {comparativa.conFinanciacion.cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">ROI:</span>
                  <span className="text-teal-400 font-semibold">{comparativa.conFinanciacion.roi.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Rentabilidad Neta:</span>
                  <span className="text-teal-400 font-semibold">{comparativa.conFinanciacion.rentabilidadNeta.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Sin Financiación */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-500/50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-purple-400 mb-4">Sin Financiación (Contado)</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Inversión inicial:</span>
                  <span className="text-white font-semibold">{comparativa.sinFinanciacion.inversion.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cash Flow anual:</span>
                  <span className="text-green-400 font-semibold">{comparativa.sinFinanciacion.cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">ROI:</span>
                  <span className="text-purple-400 font-semibold">{comparativa.sinFinanciacion.roi.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Rentabilidad Neta:</span>
                  <span className="text-purple-400 font-semibold">{comparativa.sinFinanciacion.rentabilidadNeta.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              📊 <strong>Efecto del apalancamiento:</strong> 
              {roi > comparativa.sinFinanciacion.roi 
                ? ` La financiación mejora tu ROI en ${(roi - comparativa.sinFinanciacion.roi).toFixed(2)}% puntos porcentuales`
                : ` Pagar al contado es más rentable en ${(comparativa.sinFinanciacion.roi - roi).toFixed(2)}% puntos`
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Botón flotante para guardar cambios */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleGuardarCambios}
          disabled={guardando}
          className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 flex items-center gap-3 ${
            cambiosGuardados
              ? 'bg-green-500 hover:bg-green-600 scale-110'
              : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 hover:scale-105'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {guardando ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Guardando...</span>
            </>
          ) : cambiosGuardados ? (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Guardado!</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>💾 Guardar Cambios</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
