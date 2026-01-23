"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PropertyData, getProperties } from "@/services/api";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FinancialDashboard() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados editables para simulaciones
  const [capitalPropio, setCapitalPropio] = useState(0);
  const [plazoHipoteca, setPlazoHipoteca] = useState(30);
  const [tipoInteres, setTipoInteres] = useState(3.5);
  const [inflacion, setInflacion] = useState(2.0);
  const [incrementoAlquiler, setIncrementoAlquiler] = useState(2.0);
  const [tasaDescuento, setTasaDescuento] = useState(5.0);

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      const result = await getProperties();
      if (result.success && result.properties) {
        const foundProperty = result.properties.find((p: PropertyData) => p.id === propertyId);
        if (foundProperty) {
          setProperty(foundProperty);
          
          // Inicializar valores por defecto
          const precioTotal = foundProperty.precio + 
            (foundProperty.itp || 0) +
            (foundProperty.iva || 0) +
            (foundProperty.notariaCompra || 0) +
            (foundProperty.registroCompra || 0) +
            (foundProperty.comisionAgencia || 0);
          
          setCapitalPropio(precioTotal * 0.2); // 20% por defecto
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
  
  const precioTotal = property.precio + 
    (property.itp || 0) +
    (property.iva || 0) +
    (property.notariaCompra || 0) +
    (property.registroCompra || 0) +
    (property.comisionAgencia || 0);

  const capitalFinanciado = precioTotal - capitalPropio;
  const cuotaMensualHipoteca = capitalFinanciado > 0 
    ? (capitalFinanciado * (tipoInteres / 100 / 12)) / (1 - Math.pow(1 + (tipoInteres / 100 / 12), -(plazoHipoteca * 12)))
    : 0;

  const alquilerMensual = property.alquilerMensual || 0;
  const rentaAnual = alquilerMensual * 12;

  // Gastos anuales de vivienda
  const gastosAnuales = 
    (property.comunidadAnual || 0) +
    (property.mantenimiento || 0) +
    (property.seguroHogar || 0) +
    (property.seguroVidaHipoteca || 0) +
    (property.seguroImpago || 0) +
    (property.ibi || 0) +
    (property.periodosVacantes || 0);

  const cuotaAnualHipoteca = cuotaMensualHipoteca * 12;

  // CASH FLOW ANUAL
  const cashFlowAnual = rentaAnual - gastosAnuales - cuotaAnualHipoteca;
  const cashFlowMensual = cashFlowAnual / 12;

  // RENTABILIDAD BRUTA
  const rentabilidadBruta = precioTotal > 0 ? (rentaAnual / precioTotal) * 100 : 0;

  // RENTABILIDAD NETA
  const rentabilidadNeta = precioTotal > 0 ? ((rentaAnual - gastosAnuales) / precioTotal) * 100 : 0;

  // ROI (Return on Investment) - sobre capital invertido
  const roi = capitalPropio > 0 ? (cashFlowAnual / capitalPropio) * 100 : 0;

  // ROCE (Return on Capital Employed) - más conservador
  const roce = capitalPropio > 0 ? ((rentaAnual - gastosAnuales - cuotaAnualHipoteca) / capitalPropio) * 100 : 0;

  // PAYBACK PERIOD (años para recuperar inversión)
  const paybackPeriod = cashFlowAnual > 0 ? capitalPropio / cashFlowAnual : 0;

  // TIR (Tasa Interna de Retorno) - Aproximación simplificada
  const calcularTIR = () => {
    // Simulación de flujos de caja a 30 años
    const flujos = [-capitalPropio]; // Inversión inicial
    let alquilerActual = alquilerMensual;
    let gastosActuales = gastosAnuales;
    
    for (let año = 1; año <= 30; año++) {
      const rentaAnualAjustada = alquilerActual * 12;
      const cashFlowAñoActual = rentaAnualAjustada - gastosActuales - cuotaAnualHipoteca;
      
      // Ajustar por inflación
      alquilerActual *= (1 + incrementoAlquiler / 100);
      gastosActuales *= (1 + inflacion / 100);
      
      flujos.push(cashFlowAñoActual);
    }
    
    // Aproximación de TIR usando búsqueda binaria
    let tirMin = -50;
    let tirMax = 50;
    let tir = 0;
    
    for (let iter = 0; iter < 100; iter++) {
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

  const tir = calcularTIR();

  // TABLA DE AMORTIZACIÓN (primeros 5 años)
  const calcularTablaAmortizacion = () => {
    const tabla = [];
    let saldoPendiente = capitalFinanciado;
    const tasaMensual = tipoInteres / 100 / 12;
    
    for (let mes = 1; mes <= Math.min(60, plazoHipoteca * 12); mes++) {
      const interesMes = saldoPendiente * tasaMensual;
      const amortizacionMes = cuotaMensualHipoteca - interesMes;
      saldoPendiente -= amortizacionMes;
      
      if (mes % 12 === 0) { // Solo guardar años completos
        tabla.push({
          año: mes / 12,
          cuota: Math.round(cuotaMensualHipoteca * 12),
          intereses: Math.round(interesMes * 12),
          amortizacion: Math.round(amortizacionMes * 12),
          saldoPendiente: Math.round(saldoPendiente)
        });
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

  // Datos para el gráfico de distribución de gastos
  const datosGastos = [
    { name: 'Hipoteca', value: Math.round(cuotaAnualHipoteca), color: '#8b5cf6' },
    { name: 'Comunidad', value: property.comunidadAnual || 0, color: '#ec4899' },
    { name: 'Mantenimiento', value: property.mantenimiento || 0, color: '#f59e0b' },
    { name: 'Seguros', value: (property.seguroHogar || 0) + (property.seguroVidaHipoteca || 0) + (property.seguroImpago || 0), color: '#10b981' },
    { name: 'IBI', value: property.ibi || 0, color: '#3b82f6' },
    { name: 'Periodos Vacantes', value: property.periodosVacantes || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
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

        {/* Métricas principales - Cards grandes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cash Flow Mensual */}
          <div className="bg-gradient-to-br from-teal-900/40 to-teal-800/40 border border-teal-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-teal-300">Cash Flow Mensual</h3>
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-3xl font-bold ${cashFlowMensual >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
              {cashFlowMensual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
            </p>
            <p className="text-xs text-gray-400 mt-2">Anual: {cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</p>
          </div>

          {/* Rentabilidad Neta */}
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-purple-300">Rentabilidad Neta</h3>
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {rentabilidadNeta.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400 mt-2">Bruta: {rentabilidadBruta.toFixed(2)}%</p>
          </div>

          {/* ROCE */}
          <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/40 border border-pink-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-pink-300">ROCE</h3>
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-pink-400">
              {roce.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400 mt-2">Return on Capital Employed</p>
          </div>

          {/* Payback Period */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-300">Payback Period</h3>
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {paybackPeriod.toFixed(1)} años
            </p>
            <p className="text-xs text-gray-400 mt-2">Tiempo para recuperar inversión</p>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* TIR */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">TIR (Tasa Interna de Retorno)</h3>
            <p className={`text-2xl font-bold ${tir >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tir.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Proyección a 30 años con inflación</p>
          </div>

          {/* ROI */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">ROI (Return on Investment)</h3>
            <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {roi.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Sobre capital propio invertido</p>
          </div>

          {/* Inversión Total */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Capital Propio Requerido</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {capitalPropio.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {((capitalPropio / precioTotal) * 100).toFixed(1)}% del precio total
            </p>
          </div>
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
                <span>{((capitalPropio / precioTotal) * 100).toFixed(0)}%</span>
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

            {/* Inflación */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Inflación Anual: <span className="text-orange-400 font-bold">{inflacion.toFixed(1)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={inflacion}
                onChange={(e) => setInflacion(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>10%</span>
              </div>
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

            {/* Tasa de Descuento */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tasa Descuento TIR: <span className="text-green-400 font-bold">{tasaDescuento.toFixed(1)}%</span>
              </label>
              <input
                type="range"
                min={1}
                max={15}
                step={0.1}
                value={tasaDescuento}
                onChange={(e) => setTasaDescuento(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>15%</span>
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
            <h3 className="text-xl font-bold text-white mb-4">Distribución de Gastos Anuales</h3>
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
    </div>
  );
}
