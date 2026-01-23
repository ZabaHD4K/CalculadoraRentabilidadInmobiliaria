"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyData, analyzeProperty, saveProperty, getProperties, deleteProperty, estimateRent, calculateExpenses, calculateHousingExpenses, calculateITP, calculateIVA, ITP_BY_COMUNIDAD, getEuribor } from "@/services/api";

export default function Home() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [estimatingRent, setEstimatingRent] = useState<string | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState<string | null>(null);
  const [rentEstimates, setRentEstimates] = useState<Record<string, string>>({});
  const [calculatingExpenses, setCalculatingExpenses] = useState(false);
  const [showComunidadDropdown, setShowComunidadDropdown] = useState(false);
  const [comunidadFilter, setComunidadFilter] = useState("");
  const [currentSection, setCurrentSection] = useState<'gastos' | 'hipoteca' | 'gastosVivienda'>('gastos');
  const [capitalPropio, setCapitalPropio] = useState<number>(0);
  const [showCapitalWarning, setShowCapitalWarning] = useState(false);
  const [plazoHipoteca, setPlazoHipoteca] = useState<number>(0);
  const [tipoInteres, setTipoInteres] = useState<number>(0);
  const [cuotaMensual, setCuotaMensual] = useState<number>(0);
  const [tipoHipoteca, setTipoHipoteca] = useState<'fija' | 'variable'>('variable');
  const [euriborActual, setEuriborActual] = useState<number>(2.5);
  const [showSeguroImpagoWarning, setShowSeguroImpagoWarning] = useState(false);
  const [consultingEuribor, setConsultingEuribor] = useState(false);
  const [consultingRent, setConsultingRent] = useState(false);

  // Porcentajes para campos calculados
  const [porcentajeMantenimiento, setPorcentajeMantenimiento] = useState<number>(10);
  const [porcentajeSeguroImpago, setPorcentajeSeguroImpago] = useState<number>(5);
  const [porcentajePeriodosVacantes, setPorcentajePeriodosVacantes] = useState<number>(5);

  // Warnings para porcentajes bajos
  const [showMantenimientoWarning, setShowMantenimientoWarning] = useState(false);
  const [showPeriodosVacantesWarning, setShowPeriodosVacantesWarning] = useState(false);

  // Formulario
  const [formData, setFormData] = useState<PropertyData>({
    nombre: "",
    direccion: "",
    precio: 0,
    superficie: 0,
    habitaciones: 0,
    banos: 0,
    alquilerMensual: null,
    gastosAnuales: null,
    descripcion: "",
    caracteristicas: [],
    imagenes: [],
    estado: "disponible",
    tipoPropiedad: "piso",
    pisoOcupado: false,
    pisoAlquilado: false,
    notasAdicionales: "",
    urlImagen: "",
  });

  const [idealistaUrl, setIdealistaUrl] = useState("");

  // Cargar propiedades al iniciar
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const result = await getProperties();
    if (result.success && result.properties) {
      setProperties(result.properties);
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!idealistaUrl.trim()) return;

    setAnalyzingUrl(true);
    const result = await analyzeProperty(idealistaUrl);

    if (result.success && result.data) {
      // Si viene con alquilerMensual, marcar automáticamente como alquilado
      const isRented = !!(result.data.alquilerMensual && result.data.alquilerMensual > 0);

      setFormData({
        ...result.data,
        pisoOcupado: false,
        pisoAlquilado: isRented,
        notasAdicionales: "",
        urlImagen: result.data.imagenes && result.data.imagenes.length > 0 ? result.data.imagenes[0] : "",
      });
    } else {
      alert(`Error: ${result.error}`);
    }

    setAnalyzingUrl(false);
  };

  const handleSaveProperty = async () => {
    setLoading(true);
    const result = await saveProperty(formData);

    if (result.success) {
      await loadProperties();
      setShowModal(false);
      resetForm();
    } else {
      alert(`Error: ${result.error}`);
    }

    setLoading(false);
  };

  const handleDeleteProperty = async (id: string) => {
    const result = await deleteProperty(id);
    if (result.success) {
      await loadProperties();
    }
  };

  const handleEstimateRent = async (property: PropertyData) => {
    if (!property.id) return;

    setEstimatingRent(property.id);
    const result = await estimateRent(property);

    if (result.success && result.estimate) {
      // Actualizar la propiedad con el alquiler estimado
      setProperties(prev => prev.map(p =>
        p.id === property.id
          ? { ...p, alquilerEstimado: result.estimate }
          : p
      ));
    } else {
      alert(`Error: ${result.error}`);
    }

    setEstimatingRent(null);
  };

  const handleOpenDetails = async (property: PropertyData) => {
    setSelectedProperty({ ...property });
    setComunidadFilter(property.comunidadAutonoma || '');
    setShowDetailsModal(true);

    // Inicializar porcentajes basándose en los valores existentes
    const rentaAnual = (property.alquilerMensual || 0) * 12;
    if (rentaAnual > 0) {
      // Calcular porcentajes a partir de los valores existentes
      if (property.mantenimiento) {
        const porcentajeCalc = (property.mantenimiento / rentaAnual) * 100;
        setPorcentajeMantenimiento(Math.round(porcentajeCalc * 10) / 10);
      } else {
        setPorcentajeMantenimiento(10);
      }

      if (property.seguroImpago !== null && property.seguroImpago !== undefined) {
        const porcentajeCalc = (property.seguroImpago / rentaAnual) * 100;
        setPorcentajeSeguroImpago(Math.round(porcentajeCalc * 10) / 10);
      } else {
        setPorcentajeSeguroImpago(5);
      }

      if (property.periodosVacantes) {
        const porcentajeCalc = (property.periodosVacantes / rentaAnual) * 100;
        setPorcentajePeriodosVacantes(Math.round(porcentajeCalc * 10) / 10);
      } else {
        setPorcentajePeriodosVacantes(5);
      }
    } else {
      // Si no hay renta anual, usar valores por defecto
      setPorcentajeMantenimiento(10);
      setPorcentajeSeguroImpago(5);
      setPorcentajePeriodosVacantes(5);
    }

    // Obtener Euribor actualizado desde GPT
    await fetchEuribor();
  };

  // Función para calcular TODOS los gastos (de compra y de vivienda) automáticamente
  const handleCalculateAllExpenses = async () => {
    if (!selectedProperty) return;

    setCalculatingExpenses(true);

    try {
      // 1. Calcular gastos de compra con GPT
      const purchaseResult = await calculateExpenses(selectedProperty);

      if (!purchaseResult.success || !purchaseResult.expenses) {
        alert(`Error al calcular gastos de compra: ${purchaseResult.error}`);
        setCalculatingExpenses(false);
        return;
      }

      // Calcular ITP o IVA según si es obra nueva
      const comunidad = purchaseResult.expenses.comunidadAutonoma || selectedProperty.comunidadAutonoma || 'Madrid';
      const esNueva = purchaseResult.expenses.esObraNueva ?? selectedProperty.esObraNueva ?? false;

      let itpCalculado = null;
      let ivaCalculado = null;

      if (esNueva) {
        ivaCalculado = calculateIVA(selectedProperty.precio);
      } else {
        itpCalculado = calculateITP(selectedProperty.precio, comunidad);
      }

      // 2. Calcular gastos de la vivienda con GPT (análisis inteligente)
      const housingResult = await calculateHousingExpenses(selectedProperty);

      if (!housingResult.success || !housingResult.expenses) {
        alert(`Error al calcular gastos de vivienda: ${housingResult.error}`);
        setCalculatingExpenses(false);
        return;
      }

      // Calcular mantenimiento, seguro impago y periodos vacantes (fijos según especificación)
      const rentaAnual = (selectedProperty.alquilerMensual || 0) * 12;
      const mantenimiento = Math.round(rentaAnual * 0.10); // 10% renta anual (recomendado)
      const seguroImpago = Math.round(rentaAnual * 0.05); // 5% renta anual
      const periodosVacantes = Math.round(rentaAnual * 0.05); // 5% renta anual

      // Actualizar los porcentajes a los valores recomendados
      setPorcentajeMantenimiento(10);
      setPorcentajeSeguroImpago(5);
      setPorcentajePeriodosVacantes(5);

      // Ocultar warnings ya que se están usando los porcentajes recomendados
      setShowMantenimientoWarning(false);
      setShowSeguroImpagoWarning(false);
      setShowPeriodosVacantesWarning(false);

      // 3. Actualizar TODOS los campos (gastos de compra + gastos de vivienda)
      setSelectedProperty({
        ...selectedProperty,
        ...purchaseResult.expenses,
        comunidadAutonoma: comunidad,
        esObraNueva: esNueva,
        itp: itpCalculado,
        iva: ivaCalculado,
        // Gastos de vivienda (calculados inteligentemente por GPT)
        comunidadAnual: housingResult.expenses.comunidadAnual,
        seguroHogar: housingResult.expenses.seguroHogar,
        seguroVidaHipoteca: housingResult.expenses.seguroVidaHipoteca,
        ibi: housingResult.expenses.ibi,
        // Gastos de vivienda (calculados con fórmulas fijas)
        mantenimiento,
        seguroImpago,
        periodosVacantes,
      });
      setComunidadFilter(comunidad);

      // Rellenar automáticamente el capital propio
      rellenarCapitalPropio();
    } catch (error) {
      console.error('Error al calcular gastos:', error);
      alert('Error al calcular gastos');
    }

    setCalculatingExpenses(false);
  };

  const handleSaveDetails = async () => {
    if (!selectedProperty || !selectedProperty.id) return;

    setLoading(true);

    // Calcular gastosAnuales automáticamente sumando los campos de la tercera pestaña
    const gastosAnualesCalculados =
      (selectedProperty.comunidadAnual || 0) +
      (selectedProperty.mantenimiento || 0) +
      (selectedProperty.seguroHogar || 0) +
      (selectedProperty.seguroVidaHipoteca || 0) +
      (selectedProperty.seguroImpago || 0) +
      (selectedProperty.ibi || 0) +
      (selectedProperty.periodosVacantes || 0);

    // Actualizar la propiedad con los gastos anuales calculados
    const propertyToSave = {
      ...selectedProperty,
      gastosAnuales: gastosAnualesCalculados
    };

    // Actualizar la propiedad en el backend (necesitaremos crear un endpoint de actualización)
    // Por ahora, actualizamos localmente
    setProperties(prev => prev.map(p =>
      p.id === selectedProperty.id ? propertyToSave : p
    ));

    setShowDetailsModal(false);
    setLoading(false);
  };

  // Calcular capital mínimo requerido (20% del coste total sin reforma)
  const calcularCapitalMinimo = () => {
    if (!selectedProperty) return 0;
    const costoSinReforma =
      selectedProperty.precio +
      (selectedProperty.itp || 0) +
      (selectedProperty.iva || 0) +
      (selectedProperty.notariaCompra || 0) +
      (selectedProperty.registroCompra || 0) +
      (selectedProperty.comisionAgencia || 0) +
      (selectedProperty.gestoriaHipoteca || 0) +
      (selectedProperty.tasacion || 0) +
      (selectedProperty.comisionApertura || 0);
    return Math.round(costoSinReforma * 0.20);
  };

  // Obtener Euribor actualizado desde GPT
  const fetchEuribor = async () => {
    const result = await getEuribor();
    if (result.success) {
      setEuriborActual(result.euribor);
      console.log('Euribor actualizado:', result.euribor);
    }
  };

  // Consultar Euribor del BCE mediante GPT
  const consultarEuriborBCE = async () => {
    setConsultingEuribor(true);
    await fetchEuribor();
    setConsultingEuribor(false);
    // Recalcular el tipo de interés con el nuevo Euribor
    const interesCalculado = calcularTipoInteres(tipoHipoteca);
    setTipoInteres(interesCalculado);
  };

  // Función para estimar alquiler con GPT
  const estimarAlquiler = async () => {
    if (!selectedProperty) return;

    setConsultingRent(true);
    try {
      const response = await fetch('http://localhost:3000/api/estimate-rent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedProperty),
      });

      if (!response.ok) {
        throw new Error('Error al estimar el alquiler');
      }

      const data = await response.json();
      
      // Extraer el valor numérico de la respuesta
      const match = data.estimate.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      if (match) {
        // Usar el valor medio del rango
        const valorMedio = Math.round((parseFloat(match[1]) + parseFloat(match[2])) / 2);
        setSelectedProperty({ ...selectedProperty, alquilerMensual: valorMedio });
      } else {
        // Buscar un solo número
        const singleMatch = data.estimate.match(/(\d+(?:\.\d+)?)/);
        if (singleMatch) {
          setSelectedProperty({ ...selectedProperty, alquilerMensual: Math.round(parseFloat(singleMatch[1])) });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al estimar el alquiler. Por favor, inténtalo de nuevo.');
    } finally {
      setConsultingRent(false);
    }
  };

  // Calcular tipo de interés según tipo de hipoteca
  const calcularTipoInteres = (tipo: 'fija' | 'variable') => {
    // Ambos tipos usan Euribor como base
    const diferencialVariable = 0.8; // Diferencial variable típico: 0.7% - 1.0%
    const diferencialFija = 1.5; // Diferencial fija típico: 1.3% - 1.8%

    if (tipo === 'variable') {
      return Number((euriborActual + diferencialVariable).toFixed(2));
    } else {
      // Fija: Euribor actual + diferencial mayor (se fija el tipo al inicio)
      return Number((euriborActual + diferencialFija).toFixed(2));
    }
  };

  // Rellenar automáticamente el capital propio y datos de hipoteca
  const rellenarCapitalPropio = () => {
    const capitalMinimo = calcularCapitalMinimo();
    setCapitalPropio(capitalMinimo);
    setShowCapitalWarning(false);

    // Rellenar también plazo y tipo de interés
    setPlazoHipoteca(30);
    const interesCalculado = calcularTipoInteres(tipoHipoteca);
    setTipoInteres(interesCalculado);
  };

  // Manejar cambio de tipo de hipoteca
  const handleTipoHipotecaChange = (tipo: 'fija' | 'variable') => {
    setTipoHipoteca(tipo);
    const interesCalculado = calcularTipoInteres(tipo);
    setTipoInteres(interesCalculado);
  };

  // Validar capital propio cuando cambia
  const handleCapitalPropioChange = (valor: number) => {
    setCapitalPropio(valor);
    const capitalMinimo = calcularCapitalMinimo();
    setShowCapitalWarning(valor < capitalMinimo && valor > 0);
  };

  // Calcular cuota mensual de hipoteca usando la fórmula francesa
  const calcularCuotaHipoteca = () => {
    if (!selectedProperty) return;

    // Calcular el importe a financiar (precio total - capital propio)
    const precioTotal =
      selectedProperty.precio +
      (selectedProperty.itp || 0) +
      (selectedProperty.iva || 0) +
      (selectedProperty.notariaCompra || 0) +
      (selectedProperty.registroCompra || 0) +
      (selectedProperty.comisionAgencia || 0) +
      (selectedProperty.gestoriaHipoteca || 0) +
      (selectedProperty.tasacion || 0) +
      (selectedProperty.comisionApertura || 0) +
      (selectedProperty.reforma || 0);

    const importeFinanciar = precioTotal - capitalPropio;

    if (importeFinanciar <= 0 || plazoHipoteca <= 0 || tipoInteres <= 0) {
      alert('Por favor, completa todos los campos correctamente');
      return;
    }

    // Fórmula francesa para calcular la cuota mensual
    // C = P * [i * (1 + i)^n] / [(1 + i)^n - 1]
    // Donde:
    // C = Cuota mensual
    // P = Principal (importe a financiar)
    // i = Tasa de interés mensual (tasa anual / 12 / 100)
    // n = Número total de pagos (años * 12)

    const tasaMensual = tipoInteres / 12 / 100;
    const numeroPagos = plazoHipoteca * 12;

    const cuota = importeFinanciar *
      (tasaMensual * Math.pow(1 + tasaMensual, numeroPagos)) /
      (Math.pow(1 + tasaMensual, numeroPagos) - 1);

    setCuotaMensual(Math.round(cuota));
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      direccion: "",
      precio: 0,
      superficie: 0,
      habitaciones: 0,
      banos: 0,
      alquilerMensual: null,
      gastosAnuales: null,
      descripcion: "",
      caracteristicas: [],
      imagenes: [],
      estado: "disponible",
      tipoPropiedad: "piso",
      pisoOcupado: false,
      pisoAlquilado: false,
      notasAdicionales: "",
      urlImagen: "",
    });
    setIdealistaUrl("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-900/50 border border-teal-500/30 rounded-full">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-teal-400 text-sm font-medium">Herramienta de inversión inmobiliaria</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          <span className="text-white">Gestiona tus </span>
          <span className="text-teal-400">inversiones</span>
        </h1>

        <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto">
          Añade propiedades de Idealista, analiza su rentabilidad y toma decisiones de inversión inteligentes.
        </p>
      </div>

      {/* Botón Añadir Propiedad */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-teal-500/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir Propiedad
        </button>
      </div>

      {/* Lista de Propiedades */}
      <div className="max-w-6xl mx-auto">
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No hay propiedades añadidas</h3>
            <p className="text-gray-400">
              Añade tu primera propiedad para empezar a analizar su rentabilidad. Puedes pegar un enlace de Idealista como referencia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                onClick={() => handleOpenDetails(property)}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:border-teal-500/50"
              >
                {/* Imagen */}
                {property.urlImagen && (
                  <div className="h-48 bg-slate-900">
                    <img
                      src={property.urlImagen}
                      alt={property.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{property.nombre}</h3>
                  <p className="text-gray-400 text-sm mb-4">{property.direccion}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Precio</p>
                      <p className="text-teal-400 font-bold">{property.precio.toLocaleString()}€</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Superficie</p>
                      <p className="text-white font-semibold">{property.superficie}m²</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Habitaciones</p>
                      <p className="text-white font-semibold">{property.habitaciones}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Baños</p>
                      <p className="text-white font-semibold">{property.banos}</p>
                    </div>
                  </div>

                  {property.alquilerEstimado && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-4">
                      <p className="text-gray-400 text-xs mb-1">Alquiler estimado (GPT)</p>
                      <p className="text-purple-400 font-bold">{property.alquilerEstimado}</p>
                    </div>
                  )}

                  {/* Estado */}
                  <div className="flex gap-2 mb-4">
                    {property.pisoOcupado && (
                      <span className="px-2 py-1 bg-orange-900/30 border border-orange-500/30 text-orange-400 text-xs rounded-full">
                        Ocupado
                      </span>
                    )}
                    {property.pisoAlquilado && (
                      <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs rounded-full">
                        Alquilado{property.alquilerMensual ? ` (${property.alquilerMensual}€/mes)` : ''}
                      </span>
                    )}
                    {!property.pisoOcupado && !property.pisoAlquilado && (
                      <span className="px-2 py-1 bg-green-900/30 border border-green-500/30 text-green-400 text-xs rounded-full">
                        {property.estado}
                      </span>
                    )}
                  </div>

                  {/* Botón y resultado de alquiler estimado - solo si no está alquilado */}
                  {!property.pisoAlquilado && (
                    <div className="mt-4 space-y-3">
                      {/* Resultado de la estimación */}
                      {rentEstimates[property.id || ''] && (
                        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-2 border-purple-500/50 rounded-xl p-4 animate-fade-in">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-purple-300 text-xs font-semibold">Alquiler Estimado (IA)</p>
                          </div>
                          <p className="text-2xl font-bold text-white mb-1">
                            {rentEstimates[property.id || '']}
                          </p>
                          <p className="text-xs text-purple-300/80">Análisis basado en ubicación, características y mercado actual</p>
                        </div>
                      )}

                      {/* Botón para calcular */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setLoadingEstimate(property.id || '');
                          try {
                            const result = await estimateRent(property);
                            if (result.success && result.estimate) {
                              setRentEstimates(prev => ({
                                ...prev,
                                [property.id || '']: result.estimate || ''
                              }));
                            }
                          } catch (error) {
                            console.error('Error al calcular el alquiler estimado');
                          } finally {
                            setLoadingEstimate(null);
                          }
                        }}
                        disabled={loadingEstimate === property.id}
                        className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loadingEstimate === property.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Analizando mercado...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>{rentEstimates[property.id || ''] ? 'Recalcular estimación' : 'Calcular alquiler estimado'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Indicador para click */}
                  <div className="mt-4 text-center">
                    <span className="text-xs text-gray-500">Haz click para ver detalles</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h2 className="text-2xl font-bold text-white">Añadir nueva propiedad</h2>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-6">
              {/* Enlace de Idealista */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Enlace de Idealista (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={idealistaUrl}
                    onChange={(e) => setIdealistaUrl(e.target.value)}
                    placeholder="https://www.idealista.com/inmueble/..."
                    className="flex-grow px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleAnalyzeUrl}
                    disabled={analyzingUrl || !idealistaUrl.trim()}
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {analyzingUrl ? "Buscando..." : "Buscar"}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Pega el enlace para rellenar los datos automáticamente.Tambien puedes introducir los datos manualmente.
                </p>
              </div>

              {/* Campos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del inmueble</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Piso en Calle Gran Vía"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Ej: Calle Gran Vía 45, Madrid"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio compra (€)</label>
                  <input
                    type="number"
                    value={formData.precio || ""}
                    onChange={(e) => setFormData({ ...formData, precio: parseInt(e.target.value) || 0 })}
                    placeholder="150000"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Superficie (m²)</label>
                  <input
                    type="number"
                    value={formData.superficie || ""}
                    onChange={(e) => setFormData({ ...formData, superficie: parseInt(e.target.value) || 0 })}
                    placeholder="80"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Habitaciones</label>
                  <input
                    type="number"
                    value={formData.habitaciones || ""}
                    onChange={(e) => setFormData({ ...formData, habitaciones: parseInt(e.target.value) || 0 })}
                    placeholder="2"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Baños</label>
                  <input
                    type="number"
                    value={formData.banos || ""}
                    onChange={(e) => setFormData({ ...formData, banos: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gastos anuales (€)</label>
                  <input
                    type="number"
                    value={formData.gastosAnuales || ""}
                    onChange={(e) => setFormData({ ...formData, gastosAnuales: parseInt(e.target.value) || null })}
                    placeholder="1500"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL de imagen (opcional)</label>
                  <input
                    type="url"
                    value={formData.urlImagen || ""}
                    onChange={(e) => setFormData({ ...formData, urlImagen: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Datos adicionales */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Datos adicionales</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pisoOcupado || false}
                        onChange={(e) => setFormData({ ...formData, pisoOcupado: e.target.checked })}
                        className="w-4 h-4 text-teal-500 bg-slate-800 border-slate-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-gray-300">Piso ocupado</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pisoAlquilado || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          pisoAlquilado: e.target.checked,
                          alquilerMensual: e.target.checked ? formData.alquilerMensual : null
                        })}
                        className="w-4 h-4 text-teal-500 bg-slate-800 border-slate-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-gray-300">Piso alquilado</span>
                    </label>
                  </div>

                  {/* Campo de alquiler mensual - solo visible si está alquilado */}
                  {formData.pisoAlquilado && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Alquiler mensual actual (€)</label>
                      <input
                        type="number"
                        value={formData.alquilerMensual || ""}
                        onChange={(e) => setFormData({ ...formData, alquilerMensual: parseInt(e.target.value) || null })}
                        placeholder="800"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notas adicionales</label>
                    <textarea
                      value={formData.notasAdicionales || ""}
                      onChange={(e) => setFormData({ ...formData, notasAdicionales: e.target.value })}
                      placeholder="Añade cualquier información relevante sobre la propiedad..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProperty}
                  disabled={loading || !formData.nombre || !formData.direccion}
                  className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles Económicos */}
      {showDetailsModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedProperty.nombre}</h2>
                  <p className="text-gray-400">{selectedProperty.direccion}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Botón destacado para ir al Dashboard de Análisis Financiero */}
              <button
                onClick={() => {
                  // Guardar propiedad antes de navegar
                  handleSaveProperty();
                  setTimeout(() => {
                    router.push(`/dashboard/${selectedProperty.id}`);
                  }, 500);
                }}
                className="mt-4 w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>📈 Análisis Financiero Avanzado</span>
              </button>

              {/* Botón para calcular todos los datos automáticamente */}
              <button
                onClick={handleCalculateAllExpenses}
                disabled={calculatingExpenses}
                className="mt-4 w-full px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-400 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {calculatingExpenses ? (
                  <>
                    <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculando todos los gastos con GPT...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Rellenar todo automáticamente con GPT</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Precio de la Vivienda Base */}
              <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-500/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">Precio de la vivienda base</h3>
                <p className="text-4xl font-bold text-teal-400">
                  {(
                    selectedProperty.precio +
                    (selectedProperty.itp || 0) +
                    (selectedProperty.iva || 0) +
                    (selectedProperty.notariaCompra || 0) +
                    (selectedProperty.registroCompra || 0) +
                    (selectedProperty.reforma || 0) +
                    (selectedProperty.comisionAgencia || 0) +
                    (selectedProperty.gestoriaHipoteca || 0) +
                    (selectedProperty.tasacion || 0) +
                    (selectedProperty.comisionApertura || 0)
                  ).toLocaleString()}€
                </p>
              </div>

              {/* Contenedor con animación de deslizamiento */}
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: currentSection === 'gastos'
                      ? 'translateX(0%)'
                      : currentSection === 'hipoteca'
                      ? 'translateX(-100%)'
                      : 'translateX(-200%)'
                  }}
                >
                  {/* Panel 1: Sección COSTES DE ADQUISICIÓN */}
                  <div className="min-w-full flex-shrink-0">
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-2xl font-bold text-white mb-6">Costes de Adquisición</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Precio de compra */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Compraventa</label>
                    <div className="text-3xl font-bold text-white">{selectedProperty.precio.toLocaleString()}€</div>
                    <p className="text-xs text-gray-400 mt-1">Precio de compra</p>
                  </div>

                  {/* Construcción Nueva Toggle */}
                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedProperty.esObraNueva || false}
                        onChange={(e) => {
                          const esNueva = e.target.checked;
                          const comunidad = selectedProperty.comunidadAutonoma || 'Madrid';

                          setSelectedProperty({
                            ...selectedProperty,
                            esObraNueva: esNueva,
                            itp: esNueva ? null : (ITP_BY_COMUNIDAD[comunidad] ? calculateITP(selectedProperty.precio, comunidad) : null),
                            iva: esNueva ? calculateIVA(selectedProperty.precio) : null,
                          });
                        }}
                        className="w-5 h-5 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-white font-medium">Construcción Nueva</span>
                    </label>
                    {selectedProperty.esObraNueva && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-orange-900/30 border border-orange-500/50 rounded-full">
                        <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-orange-400 font-semibold">IVA 10%</span>
                      </div>
                    )}
                  </div>

                  {/* ITP o IVA */}
                  {selectedProperty.esObraNueva ? (
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                      <label className="block text-sm font-medium text-gray-300 mb-2">IVA (10%)</label>
                      <input
                        type="number"
                        value={selectedProperty.iva || ''}
                        onChange={(e) => setSelectedProperty({ ...selectedProperty, iva: parseInt(e.target.value) || null })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Calculado: {calculateIVA(selectedProperty.precio).toLocaleString()}€</p>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 space-y-3">
                      <label className="block text-sm font-medium text-gray-300">
                        ITP (Impuesto de Transmisiones Patrimoniales)
                      </label>

                      {/* Comunidad Autónoma input dentro de ITP */}
                      <div className="relative">
                        <input
                          type="text"
                          value={comunidadFilter}
                          onChange={(e) => {
                            setComunidadFilter(e.target.value);
                            setShowComunidadDropdown(true);
                          }}
                          onFocus={() => setShowComunidadDropdown(true)}
                          placeholder="Escribe la Comunidad Autónoma (ej: Madrid, Cataluña...)"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />

                        {/* Dropdown personalizado */}
                        {showComunidadDropdown && (
                          <>
                            {/* Backdrop para cerrar el dropdown */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowComunidadDropdown(false)}
                            />

                            {/* Lista de opciones */}
                            <div className="absolute z-20 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                              {Object.keys(ITP_BY_COMUNIDAD)
                                .filter(comunidad =>
                                  comunidad.toLowerCase().includes(comunidadFilter.toLowerCase())
                                )
                                .map((comunidad) => (
                                  <button
                                    key={comunidad}
                                    type="button"
                                    onClick={() => {
                                      const itpNuevo = calculateITP(selectedProperty.precio, comunidad);

                                      setSelectedProperty({
                                        ...selectedProperty,
                                        comunidadAutonoma: comunidad,
                                        itp: itpNuevo,
                                      });
                                      setComunidadFilter(comunidad);
                                      setShowComunidadDropdown(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-600 transition-colors flex justify-between items-center group"
                                  >
                                    <span className="text-white group-hover:text-teal-400 transition-colors">
                                      {comunidad}
                                    </span>
                                    <span className="text-xs text-gray-400 group-hover:text-teal-300 font-semibold">
                                      ITP: {ITP_BY_COMUNIDAD[comunidad]}%
                                    </span>
                                  </button>
                                ))}
                              {Object.keys(ITP_BY_COMUNIDAD).filter(comunidad =>
                                comunidad.toLowerCase().includes(comunidadFilter.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-3 text-gray-500 text-sm">
                                  No se encontraron coincidencias
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {selectedProperty.comunidadAutonoma && ITP_BY_COMUNIDAD[selectedProperty.comunidadAutonoma] && (
                          <p className="text-xs text-teal-400 mt-1 font-semibold">
                            ✓ ITP en {selectedProperty.comunidadAutonoma}: {ITP_BY_COMUNIDAD[selectedProperty.comunidadAutonoma]}%
                          </p>
                        )}
                      </div>

                      {/* Campo numérico de ITP */}
                      <div>
                        <input
                          type="number"
                          value={selectedProperty.itp || ''}
                          onChange={(e) => setSelectedProperty({ ...selectedProperty, itp: parseInt(e.target.value) || null })}
                          placeholder="Monto del ITP en €"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {selectedProperty.comunidadAutonoma && ITP_BY_COMUNIDAD[selectedProperty.comunidadAutonoma] && (
                          <p className="text-xs text-gray-500 mt-1">
                            Calculado automáticamente: {calculateITP(selectedProperty.precio, selectedProperty.comunidadAutonoma).toLocaleString()}€
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notaría */}
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notaría (compraventa)</label>
                    <input
                      type="number"
                      value={selectedProperty.notariaCompra || ''}
                      onChange={(e) => setSelectedProperty({ ...selectedProperty, notariaCompra: parseInt(e.target.value) || null })}
                      placeholder="600-900€"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Registro */}
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Registro (compraventa)</label>
                    <input
                      type="number"
                      value={selectedProperty.registroCompra || ''}
                      onChange={(e) => setSelectedProperty({ ...selectedProperty, registroCompra: parseInt(e.target.value) || null })}
                      placeholder="400-600€"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Comisión Agencia */}
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Comisión Agencia</label>
                    <input
                      type="number"
                      value={selectedProperty.comisionAgencia || ''}
                      onChange={(e) => setSelectedProperty({ ...selectedProperty, comisionAgencia: parseInt(e.target.value) || null })}
                      placeholder="0€"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                      {/* Botón para avanzar a la siguiente sección */}
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => setCurrentSection('hipoteca')}
                          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg"
                        >
                          <span>Continuar a Hipoteca</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Panel 2: Sección HIPOTECA */}
                  <div className="min-w-full flex-shrink-0">
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Datos de la Hipoteca</h3>
                        <button
                          onClick={() => setCurrentSection('gastos')}
                          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                          </svg>
                          <span>Volver a Costes de Adquisición</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Capital Propio */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Capital Propio (€)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={capitalPropio || ''}
                              onChange={(e) => handleCapitalPropioChange(Number(e.target.value))}
                              placeholder="Capital de entrada"
                              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            {/* Advertencia de capital insuficiente con animación */}
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                showCapitalWarning ? 'max-h-12 opacity-100 mt-1.5' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-900/20 border border-red-500/30 rounded">
                                <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-[10px] text-red-300 leading-tight">
                                  Mínimo: <span className="font-bold">{calcularCapitalMinimo().toLocaleString()}€</span> (20%)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Plazo (años)</label>
                            <input
                              type="number"
                              value={plazoHipoteca || ''}
                              onChange={(e) => setPlazoHipoteca(Number(e.target.value))}
                              placeholder="20, 25, 30..."
                              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            {plazoHipoteca > 35 && (
                              <p className="mt-2 text-xs text-red-400 font-medium">
                                ⚠️ Un plazo mayor a 35 años es muy poco común. Lo normal es un máximo de 30 años.
                              </p>
                            )}
                          </div>

                          {/* Euribor Manual con botón de consulta */}
                          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Euribor a 12 meses (%)</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={euriborActual || ''}
                                onChange={(e) => {
                                  const nuevoEuribor = Number(e.target.value);
                                  setEuriborActual(nuevoEuribor);
                                  // Recalcular el tipo de interés con el nuevo Euribor
                                  const interesCalculado = calcularTipoInteres(tipoHipoteca);
                                  setTipoInteres(interesCalculado);
                                }}
                                step="0.01"
                                placeholder="2.50"
                                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                              <button
                                onClick={consultarEuriborBCE}
                                disabled={consultingEuribor}
                                title="Consultar Euribor del día en el BCE"
                                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                              >
                                {consultingEuribor ? (
                                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Consulta el dato oficial del BCE o intróduce manualmente</p>
                          </div>
                        </div>

                        {/* Importe de la Hipoteca (calculado) */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Importe de la Hipoteca</label>
                          <div className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white flex items-center">
                            <span className="text-lg font-semibold text-teal-400">
                              {selectedProperty?.precio && capitalPropio
                                ? (selectedProperty.precio - capitalPropio).toLocaleString() + '€'
                                : '0€'
                              }
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">Precio de vivienda - Capital propio</p>
                        </div>

                        {/* Selector Tipo de Hipoteca */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-3">Tipo de Hipoteca</label>
                          <div className="relative inline-flex w-full bg-slate-700 rounded-lg p-1">
                            {/* Indicador animado de fondo */}
                            <div
                              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-teal-500/30 border border-teal-500/50 rounded-md transition-all duration-300 ease-in-out ${
                                tipoHipoteca === 'fija' ? 'left-1' : 'left-[calc(50%+4px-1px)]'
                              }`}
                            />

                            {/* Botones */}
                            <button
                              type="button"
                              onClick={() => handleTipoHipotecaChange('fija')}
                              className={`relative flex-1 px-6 py-3 rounded-md font-semibold transition-colors duration-300 ${
                                tipoHipoteca === 'fija'
                                  ? 'text-teal-400'
                                  : 'text-gray-400 hover:text-gray-300'
                              }`}
                            >
                              Fija
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTipoHipotecaChange('variable')}
                              className={`relative flex-1 px-6 py-3 rounded-md font-semibold transition-colors duration-300 ${
                                tipoHipoteca === 'variable'
                                  ? 'text-teal-400'
                                  : 'text-gray-400 hover:text-gray-300'
                              }`}
                            >
                              Variable
                            </button>
                          </div>

                          {/* Info adicional sobre el tipo seleccionado */}
                          <div className="mt-3 text-xs text-gray-400">
                            {tipoHipoteca === 'variable' ? (
                              <p>💡 Variable: Euribor ({euriborActual.toFixed(2)}%) + Diferencial (0.8%) = {(euriborActual + 0.8).toFixed(2)}% - Se revisa periódicamente</p>
                            ) : (
                              <p>💡 Fija: Euribor ({euriborActual.toFixed(2)}%) + Diferencial (1.5%) = {(euriborActual + 1.5).toFixed(2)}% - Tipo fijo durante todo el plazo</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Interés (%)</label>
                          <input
                            type="number"
                            value={tipoInteres || ''}
                            onChange={(e) => setTipoInteres(Number(e.target.value))}
                            step="0.01"
                            placeholder="3.5"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <p className="mt-2 text-xs text-gray-400">Puedes modificar este valor manualmente</p>
                        </div>
                      </div>

                      {/* Botón para calcular cuota de hipoteca */}
                      <button
                        onClick={calcularCuotaHipoteca}
                        className="mt-4 w-full px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>Calcular cuota de hipoteca</span>
                      </button>

                      {/* Cuota Mensual - Solo se muestra si hay cálculo */}
                      {cuotaMensual > 0 && (
                        <div className="mt-4 bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-500/50 rounded-xl p-6">
                          <h4 className="text-lg font-semibold text-white mb-2">Cuota Mensual</h4>
                          <p className="text-3xl font-bold text-teal-400">
                            {cuotaMensual.toLocaleString()}€
                          </p>
                        </div>
                      )}

                      {/* Botón para avanzar a Gastos de la Vivienda */}
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => setCurrentSection('gastosVivienda')}
                          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg"
                        >
                          <span>Continuar a Gastos de la Vivienda</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Panel 3: Sección GASTOS DE LA VIVIENDA */}
                  <div className="min-w-full flex-shrink-0">
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">Gastos de la Vivienda</h3>
                        <button
                          onClick={() => setCurrentSection('hipoteca')}
                          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                          </svg>
                          <span>Volver a Hipoteca</span>
                        </button>
                      </div>

                      {/* Campo de Alquiler Mensual con botón de estimación GPT */}
                      <div className="mb-6 bg-gradient-to-r from-teal-900/30 to-blue-900/30 p-5 rounded-xl border border-teal-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-lg font-bold text-white">Alquiler Mensual Estimado</label>
                          <button
                            onClick={estimarAlquiler}
                            disabled={consultingRent}
                            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-medium shadow-lg"
                          >
                            {consultingRent ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Consultando GPT...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Calcular con GPT
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          type="number"
                          value={selectedProperty.alquilerMensual || ''}
                          onChange={(e) => setSelectedProperty({ ...selectedProperty, alquilerMensual: parseInt(e.target.value) || null })}
                          placeholder="Ej: 850€"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg font-semibold"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                          💡 Usa el botón para que GPT estime el precio de alquiler según la ubicación y características, o introdúcelo manualmente
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Comunidad Año */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Comunidad año</label>
                          <input
                            type="number"
                            value={selectedProperty.comunidadAnual || ''}
                            onChange={(e) => setSelectedProperty({ ...selectedProperty, comunidadAnual: parseInt(e.target.value) || null })}
                            placeholder="600€"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        {/* Mantenimiento */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Mantenimiento (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={porcentajeMantenimiento === 0 ? '' : porcentajeMantenimiento}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') {
                                setPorcentajeMantenimiento(0);
                                setSelectedProperty({ ...selectedProperty, mantenimiento: 0 });
                                setShowMantenimientoWarning(false);
                              } else {
                                const porcentaje = parseFloat(inputValue);
                                setPorcentajeMantenimiento(porcentaje);

                                // Calcular el valor en euros
                                const rentaAnual = (selectedProperty.alquilerMensual || 0) * 12;
                                const valorCalculado = Math.round(rentaAnual * (porcentaje / 100));
                                setSelectedProperty({ ...selectedProperty, mantenimiento: valorCalculado });

                                // Mostrar warning si es menor al 10% recomendado
                                setShowMantenimientoWarning(porcentaje < 10 && porcentaje > 0);
                              }
                            }}
                            placeholder="10%"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          {selectedProperty.alquilerMensual ? (
                            <>
                              <p className="mt-2 text-xs text-gray-400">
                                💡 Valor calculado: {selectedProperty.mantenimiento?.toLocaleString() || '0'}€ ({porcentajeMantenimiento}% de la renta anual)
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Recomendado: 10% = {Math.round(selectedProperty.alquilerMensual * 12 * 0.10).toLocaleString()}€
                              </p>
                            </>
                          ) : (
                            <p className="mt-2 text-xs text-yellow-400">
                              ⚠️ Primero debes establecer el Alquiler Mensual para calcular este valor
                            </p>
                          )}

                          {/* Advertencia de mantenimiento bajo */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              showMantenimientoWarning
                                ? 'max-h-12 opacity-100 mt-1.5'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/20 border border-yellow-500/30 rounded">
                              <svg className="w-3 h-3 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <p className="text-[10px] text-yellow-300 leading-tight">
                                💡 Se recomienda al menos 10% para cubrir reparaciones
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Seguro Hogar */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Seguro Hogar</label>
                          <input
                            type="number"
                            value={selectedProperty.seguroHogar || ''}
                            onChange={(e) => setSelectedProperty({ ...selectedProperty, seguroHogar: parseInt(e.target.value) || null })}
                            placeholder="100€"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        {/* Seguro Vida Hipoteca */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Seguro Vida Hipoteca</label>
                          <input
                            type="number"
                            value={selectedProperty.seguroVidaHipoteca || ''}
                            onChange={(e) => setSelectedProperty({ ...selectedProperty, seguroVidaHipoteca: parseInt(e.target.value) || null })}
                            placeholder="150€"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        {/* Seguro Impago */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Seguro Impago (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={porcentajeSeguroImpago === 0 ? '' : porcentajeSeguroImpago}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') {
                                setPorcentajeSeguroImpago(0);
                                setSelectedProperty({ ...selectedProperty, seguroImpago: 0 });
                                setShowSeguroImpagoWarning(false);
                              } else {
                                const porcentaje = parseFloat(inputValue);
                                setPorcentajeSeguroImpago(porcentaje);

                                // Calcular el valor en euros
                                const rentaAnual = (selectedProperty.alquilerMensual || 0) * 12;
                                const valorCalculado = Math.round(rentaAnual * (porcentaje / 100));
                                setSelectedProperty({ ...selectedProperty, seguroImpago: valorCalculado });

                                // Mostrar warning si es 0 o menor al 5% recomendado
                                setShowSeguroImpagoWarning(porcentaje < 5 && porcentaje > 0);
                              }
                            }}
                            placeholder="5%"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          {selectedProperty.alquilerMensual ? (
                            <>
                              <p className="mt-2 text-xs text-gray-400">
                                💡 Valor calculado: {selectedProperty.seguroImpago?.toLocaleString() || '0'}€ ({porcentajeSeguroImpago}% de la renta anual)
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Recomendado: 5% = {Math.round(selectedProperty.alquilerMensual * 12 * 0.05).toLocaleString()}€
                              </p>
                            </>
                          ) : (
                            <p className="mt-2 text-xs text-yellow-400">
                              ⚠️ Primero debes establecer el Alquiler Mensual para calcular este valor
                            </p>
                          )}

                          {/* Advertencia de seguro impago con animación */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              showSeguroImpagoWarning
                                ? 'max-h-12 opacity-100 mt-1.5'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/20 border border-red-500/30 rounded">
                              <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <p className="text-[10px] text-red-300 leading-tight">
                                ⚠️ Muy recomendado contratar seguro de impago (mínimo 5%)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* IBI */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">IBI</label>
                          <input
                            type="number"
                            value={selectedProperty.ibi || ''}
                            onChange={(e) => setSelectedProperty({ ...selectedProperty, ibi: parseInt(e.target.value) || null })}
                            placeholder="160€"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <p className="mt-2 text-xs text-gray-400">
                            📋 Consulta con el propietario o agente inmobiliario
                          </p>
                        </div>

                        {/* Periodos Vacantes */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Periodos Vacantes (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={porcentajePeriodosVacantes === 0 ? '' : porcentajePeriodosVacantes}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') {
                                setPorcentajePeriodosVacantes(0);
                                setSelectedProperty({ ...selectedProperty, periodosVacantes: 0 });
                                setShowPeriodosVacantesWarning(false);
                              } else {
                                const porcentaje = parseFloat(inputValue);
                                setPorcentajePeriodosVacantes(porcentaje);

                                // Calcular el valor en euros
                                const rentaAnual = (selectedProperty.alquilerMensual || 0) * 12;
                                const valorCalculado = Math.round(rentaAnual * (porcentaje / 100));
                                setSelectedProperty({ ...selectedProperty, periodosVacantes: valorCalculado });

                                // Mostrar warning si es menor al 5% recomendado
                                setShowPeriodosVacantesWarning(porcentaje < 5 && porcentaje > 0);
                              }
                            }}
                            placeholder="5%"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          {selectedProperty.alquilerMensual ? (
                            <>
                              <p className="mt-2 text-xs text-gray-400">
                                💡 Valor calculado: {selectedProperty.periodosVacantes?.toLocaleString() || '0'}€ ({porcentajePeriodosVacantes}% de la renta anual)
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Recomendado: 5% = {Math.round(selectedProperty.alquilerMensual * 12 * 0.05).toLocaleString()}€
                              </p>
                            </>
                          ) : (
                            <p className="mt-2 text-xs text-yellow-400">
                              ⚠️ Primero debes establecer el Alquiler Mensual para calcular este valor
                            </p>
                          )}

                          {/* Advertencia de periodos vacantes bajo */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              showPeriodosVacantesWarning
                                ? 'max-h-12 opacity-100 mt-1.5'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/20 border border-yellow-500/30 rounded">
                              <svg className="w-3 h-3 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <p className="text-[10px] text-yellow-300 leading-tight">
                                💡 Se recomienda al menos 5% para periodos sin inquilino
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total de Gastos Anuales */}
                      <div className="mt-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-2">Total Gastos Anuales</h4>
                        <p className="text-3xl font-bold text-orange-400">
                          {(
                            (selectedProperty.comunidadAnual || 0) +
                            (selectedProperty.mantenimiento || 0) +
                            (selectedProperty.seguroHogar || 0) +
                            (selectedProperty.seguroVidaHipoteca || 0) +
                            (selectedProperty.seguroImpago || 0) +
                            (selectedProperty.ibi || 0) +
                            (selectedProperty.periodosVacantes || 0)
                          ).toLocaleString()}€
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Mensual: {Math.round((
                            (selectedProperty.comunidadAnual || 0) +
                            (selectedProperty.mantenimiento || 0) +
                            (selectedProperty.seguroHogar || 0) +
                            (selectedProperty.seguroVidaHipoteca || 0) +
                            (selectedProperty.seguroImpago || 0) +
                            (selectedProperty.ibi || 0) +
                            (selectedProperty.periodosVacantes || 0)
                          ) / 12).toLocaleString()}€
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
                <button
                  onClick={handleSaveDetails}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("¿Estás seguro de eliminar esta propiedad?")) {
                      handleDeleteProperty(selectedProperty.id!);
                      setShowDetailsModal(false);
                    }
                  }}
                  className="px-6 py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 rounded-lg font-semibold transition-all whitespace-nowrap"
                >
                  Eliminar Propiedad
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
