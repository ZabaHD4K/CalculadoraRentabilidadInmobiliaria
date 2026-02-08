"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyData, analyzeProperty, saveProperty, updateProperty, getProperties, deleteProperty, estimateRent, calculateExpenses, calculateHousingExpenses, calculateITP, calculateIVA, ITP_BY_COMUNIDAD, getEuribor } from "@/services/api";
import AuthModal from "@/components/AuthModal";
import FeedbackButton from "@/components/FeedbackButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
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
  const [showCapitalMaxWarning, setShowCapitalMaxWarning] = useState(false);
  const [plazoHipoteca, setPlazoHipoteca] = useState<number>(0);
  const [tipoInteres, setTipoInteres] = useState<number>(0);
  const [cuotaMensual, setCuotaMensual] = useState<number>(0);
  const [tipoHipoteca, setTipoHipoteca] = useState<'fija' | 'variable'>('variable');
  const [euriborActual, setEuriborActual] = useState<number>(2.5);
  const [showSeguroImpagoWarning, setShowSeguroImpagoWarning] = useState(false);
  const [consultingEuribor, setConsultingEuribor] = useState(false);
  const [consultingRent, setConsultingRent] = useState(false);

  // Porcentajes para campos calculados
  const [porcentajeMantenimiento, setPorcentajeMantenimiento] = useState<number>(0.10);
  const [porcentajeSeguroHogar, setPorcentajeSeguroHogar] = useState<number>(0.01);
  const [porcentajeSeguroImpago, setPorcentajeSeguroImpago] = useState<number>(5);
  const [porcentajePeriodosVacantes, setPorcentajePeriodosVacantes] = useState<number>(0.03);
  const [porcentajeSeguroVida, setPorcentajeSeguroVida] = useState<number>(0.20);
  const [edadAsegurado, setEdadAsegurado] = useState<number>(30);
  const [showSeguroVidaInfo, setShowSeguroVidaInfo] = useState(false);
  const [tipoMunicipioIBI, setTipoMunicipioIBI] = useState<'pueblo' | 'ciudad_media' | 'gran_ciudad' | 'capital'>('ciudad_media');
  const [porcentajeIBI, setPorcentajeIBI] = useState<number>(0.30);

  // Flag para saber si la comunidad fue estimada por IA
  const [comunidadEstimadaIA, setComunidadEstimadaIA] = useState(false);

  // Warnings para porcentajes bajos
  const [showTipoInteresTip, setShowTipoInteresTip] = useState(false);

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

  // Verificar autenticación al cargar
  useEffect(() => {
    const authenticated = sessionStorage.getItem('authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  // Cargar propiedades al iniciar (solo si está autenticado)
  useEffect(() => {
    if (isAuthenticated) {
      loadProperties();
    }
  }, [isAuthenticated]);

  // Recargar propiedades cuando vuelves a la página (por si se editaron en el dashboard)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        loadProperties();
      }
    };

    // Recargar cuando la ventana recupera el foco
    window.addEventListener('focus', handleFocus);
    
    // Recargar cuando se navega de vuelta a esta página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        loadProperties();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  // Recalcular valores basados en porcentaje cuando cambian los datos relevantes
  useEffect(() => {
    if (selectedProperty) {
      // Mantenimiento: % del precio de la vivienda
      if (porcentajeMantenimiento > 0 && selectedProperty.precio > 0) {
        const mantenimientoCalculado = Math.round(selectedProperty.precio * (porcentajeMantenimiento / 100));
        if (selectedProperty.mantenimiento !== mantenimientoCalculado) {
          setSelectedProperty(prev => prev ? ({
            ...prev,
            mantenimiento: mantenimientoCalculado
          }) : null);
        }
      }

      // Seguro hogar: % del precio de la vivienda
      if (porcentajeSeguroHogar > 0 && selectedProperty.precio > 0) {
        const seguroHogarCalculado = Math.round(selectedProperty.precio * (porcentajeSeguroHogar / 100));
        if (selectedProperty.seguroHogar !== seguroHogarCalculado) {
          setSelectedProperty(prev => prev ? ({
            ...prev,
            seguroHogar: seguroHogarCalculado
          }) : null);
        }
      }

      // Periodos vacantes: % del precio de la vivienda
      if (porcentajePeriodosVacantes > 0 && selectedProperty.precio > 0) {
        const periodosVacantesCalculado = Math.round(selectedProperty.precio * (porcentajePeriodosVacantes / 100));
        if (selectedProperty.periodosVacantes !== periodosVacantesCalculado) {
          setSelectedProperty(prev => prev ? ({
            ...prev,
            periodosVacantes: periodosVacantesCalculado
          }) : null);
        }
      }

      // Seguro vida hipoteca: % del importe financiado (hipoteca)
      const importeHipoteca = Math.max(0, calcularCostoTotal() - capitalPropio);
      if (porcentajeSeguroVida > 0 && importeHipoteca > 0) {
        const seguroVidaCalculado = Math.round(importeHipoteca * (porcentajeSeguroVida / 100));
        if (selectedProperty.seguroVidaHipoteca !== seguroVidaCalculado) {
          setSelectedProperty(prev => prev ? ({
            ...prev,
            seguroVidaHipoteca: seguroVidaCalculado
          }) : null);
        }
      }

      // IBI: % del precio según tipo de municipio
      if (porcentajeIBI > 0 && selectedProperty.precio > 0) {
        const ibiCalculado = Math.round(selectedProperty.precio * (porcentajeIBI / 100));
        if (selectedProperty.ibi !== ibiCalculado) {
          setSelectedProperty(prev => prev ? ({
            ...prev,
            ibi: ibiCalculado
          }) : null);
        }
      }

      // Seguro impago: % de la renta anual
      if (selectedProperty.alquilerMensual) {
        const rentaAnual = selectedProperty.alquilerMensual * 12;

        if (porcentajeSeguroImpago > 0) {
          const seguroImpagoCalculado = Math.round(rentaAnual * (porcentajeSeguroImpago / 100));
          if (selectedProperty.seguroImpago !== seguroImpagoCalculado) {
            setSelectedProperty(prev => prev ? ({
              ...prev,
              seguroImpago: seguroImpagoCalculado
            }) : null);
          }
        }
      }
    }
  }, [selectedProperty?.alquilerMensual, selectedProperty?.precio, capitalPropio, porcentajeMantenimiento, porcentajeSeguroHogar, porcentajeSeguroVida, porcentajeIBI, porcentajeSeguroImpago, porcentajePeriodosVacantes]);

  const loadProperties = async () => {
    const result = await getProperties();
    if (result.success && result.properties) {
      setProperties(result.properties);
      console.log('🏠 Propiedades cargadas:', result.properties.map(p => ({
        nombre: p.nombre,
        precio: p.precio,
        alquilerMensual: p.alquilerMensual,
        gastosAnuales: p.gastosAnuales,
        capitalPropio: p.capitalPropio
      })));

      // Sincronizar selectedProperty si está abierto el modal de detalles
      if (selectedProperty?.id) {
        const updated = result.properties.find((p: PropertyData) => p.id === selectedProperty.id);
        if (updated) {
          setSelectedProperty({ ...updated });
          // Actualizar también los porcentajes de gastos
          if (updated.precio > 0) {
            if (updated.mantenimiento) setPorcentajeMantenimiento(Math.round((updated.mantenimiento / updated.precio) * 10000) / 100);
            if (updated.seguroHogar) setPorcentajeSeguroHogar(Math.round((updated.seguroHogar / updated.precio) * 10000) / 100);
            if (updated.periodosVacantes) setPorcentajePeriodosVacantes(Math.round((updated.periodosVacantes / updated.precio) * 10000) / 100);
            if (updated.ibi) setPorcentajeIBI(Math.round((updated.ibi / updated.precio) * 10000) / 100);
          }
          const rentaAnual = (updated.alquilerMensual || 0) * 12;
          if (updated.seguroImpago && rentaAnual > 0) setPorcentajeSeguroImpago(Math.round((updated.seguroImpago / rentaAnual) * 10000) / 100);
          if (updated.capitalPropio) setCapitalPropio(updated.capitalPropio);
          if (updated.plazoHipoteca) setPlazoHipoteca(updated.plazoHipoteca);
          if (updated.tipoInteres) setTipoInteres(updated.tipoInteres);
        }
      }
    }
  };

  // Función para validar si todos los datos están completos para análisis financiero
  const todosLosDatosCompletos = (property: PropertyData | null) => {
    if (!property) return false;
    
    // Verificar datos básicos
    if (!property.precio || property.precio <= 0) return false;
    if (!property.alquilerMensual || property.alquilerMensual <= 0) return false;
    
    // Verificar gastos de adquisición (al menos ITP o IVA)
    const tieneImpuestos = (property.itp && property.itp > 0) || (property.iva && property.iva > 0);
    if (!tieneImpuestos) return false;
    
    // Verificar gastos notariales básicos
    const tieneNotariaRegistro = (property.notariaCompra && property.notariaCompra > 0) || 
                                 (property.registroCompra && property.registroCompra > 0);
    if (!tieneNotariaRegistro) return false;
    
    // Verificar gastos anuales (al menos comunidad e IBI)
    if (!property.comunidadAnual || property.comunidadAnual <= 0) return false;
    if (!property.ibi || property.ibi <= 0) return false;
    
    // Verificar datos de hipoteca si se usa financiación
    const tieneCapitalPropio = property.capitalPropio && property.capitalPropio > 0;
    if (tieneCapitalPropio) {
      if (!property.plazoHipoteca || property.plazoHipoteca <= 0) return false;
      if (!property.tipoInteres || property.tipoInteres <= 0) return false;
    }
    
    return true;
  };

  // Función para calcular el ROI
  const calculateROI = (property: PropertyData): { value: number | null, status: 'pending' | 'calculated' } => {
    // Verificar si tiene TODOS los datos necesarios para un cálculo preciso
    const hasBasicData = property.precio > 0;
    const hasRentData = property.alquilerMensual !== null && 
                        property.alquilerMensual !== undefined && 
                        property.alquilerMensual > 0;
    
    // Calcular gastos anuales directamente desde campos individuales (no usar gastosAnuales guardado que puede estar desactualizado)
    const gastosAnualesReal =
      (property.comunidadAnual || 0) +
      (property.mantenimiento || 0) +
      (property.seguroHogar || 0) +
      (property.seguroVidaHipoteca || 0) +
      (property.seguroImpago || 0) +
      (property.ibi || 0) +
      (property.periodosVacantes || 0);

    const hasExpenseData = gastosAnualesReal > 0;
    
    // Verificar que tenga al menos algunos gastos de compra calculados
    // (ITP o IVA + al menos notaría o registro)
    const hasPurchaseExpenses = (property.itp !== null && property.itp !== undefined) || 
                                 (property.iva !== null && property.iva !== undefined);
    
    const hasNotaryOrRegistry = (property.notariaCompra !== null && property.notariaCompra !== undefined) ||
                                 (property.registroCompra !== null && property.registroCompra !== undefined);

    // Solo calcular ROI si tiene TODOS los datos esenciales
    if (!hasBasicData || !hasRentData || !hasExpenseData || !hasPurchaseExpenses || !hasNotaryOrRegistry) {
      return { value: null, status: 'pending' };
    }

    // Calcular ingresos anuales
    const ingresosAnuales = (property.alquilerMensual || 0) * 12;

    // Usar gastos anuales calculados desde campos individuales
    const gastosAnuales = gastosAnualesReal;

    // Calcular inversión total (precio + todos los gastos de compra)
    const inversionTotal = property.precio +
      (property.itp || 0) +
      (property.iva || 0) +
      (property.notariaCompra || 0) +
      (property.registroCompra || 0) +
      (property.comisionAgencia || 0) +
      (property.gestoriaHipoteca || 0) +
      (property.tasacion || 0) +
      (property.comisionApertura || 0) +
      (property.reforma || 0);

    // Si hay capital propio definido y es mayor que 0, usar ese como base de inversión
    // (porque es el dinero real que el inversor pone)
    // Si no, usar la inversión total (compra sin financiación)
    const capitalInvertido = (property.capitalPropio && property.capitalPropio > 0) 
      ? property.capitalPropio 
      : inversionTotal;

    // Validar que la inversión sea mayor que 0
    if (capitalInvertido <= 0) {
      return { value: null, status: 'pending' };
    }

    // Calcular beneficio neto (cash flow)
    let cashFlowAnual = ingresosAnuales - gastosAnuales;
    
    // Variables para el ROI total
    let amortizacionAnual = 0;
    let revalorizacionAnual = 0;
    
    // Si hay datos de hipoteca, calcular cuota y amortización
    if (property.capitalPropio && property.plazoHipoteca && property.tipoInteres) {
      const capitalFinanciado = inversionTotal - property.capitalPropio;
      if (capitalFinanciado > 0) {
        const tasaMensual = property.tipoInteres / 100 / 12;
        const numPagos = property.plazoHipoteca * 12;
        const cuotaMensual = capitalFinanciado * (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) / (Math.pow(1 + tasaMensual, numPagos) - 1);
        const cuotaAnual = cuotaMensual * 12;
        cashFlowAnual = cashFlowAnual - cuotaAnual;
        
        // Calcular amortización del primer año (parte de la cuota que reduce la deuda)
        let saldoHipoteca = capitalFinanciado;
        for (let mes = 0; mes < 12; mes++) {
          const interesMes = saldoHipoteca * tasaMensual;
          const amortizacionMes = cuotaMensual - interesMes;
          amortizacionAnual += amortizacionMes;
          saldoHipoteca -= amortizacionMes;
        }
      }
    }
    
    // Revalorización anual del inmueble (2% por defecto como inflación típica)
    const tasaRevalorizacion = 0.02; // 2%
    revalorizacionAnual = property.precio * tasaRevalorizacion;
    
    // ROI TOTAL = (Cash Flow + Amortización + Revalorización) / Capital Invertido * 100
    const gananciaTotal = cashFlowAnual + amortizacionAnual + revalorizacionAnual;
    const roi = (gananciaTotal / capitalInvertido) * 100;

    console.log(`📊 ROI calculado para ${property.nombre}:`, {
      ingresosAnuales,
      gastosAnuales,
      capitalInvertido,
      inversionTotal,
      cashFlowAnual: Math.round(cashFlowAnual),
      amortizacionAnual: Math.round(amortizacionAnual),
      revalorizacionAnual: Math.round(revalorizacionAnual),
      gananciaTotal: Math.round(gananciaTotal),
      roi: roi.toFixed(2) + '%'
    });

    return { value: roi, status: 'calculated' };
  };

  const handleAnalyzeUrl = async () => {
    if (!idealistaUrl.trim()) return;

    setAnalyzingUrl(true);
    const result = await analyzeProperty(idealistaUrl);

    if (result.success && result.data) {
      // Si viene con alquilerMensual, marcar automáticamente como alquiladod
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
      // Actualizar la propiedad con el alquiler estimado y justificación
      setProperties(prev => prev.map(p =>
        p.id === property.id
          ? {
              ...p,
              alquilerEstimado: result.estimate,
              alquilerJustificacion: result.justificacion || null,
              alquilerConfianza: result.confianza || null
            }
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

    // Cargar datos de hipoteca si existen
    if (property.capitalPropio) setCapitalPropio(property.capitalPropio);
    if (property.plazoHipoteca) setPlazoHipoteca(property.plazoHipoteca);
    if (property.tipoInteres) setTipoInteres(property.tipoInteres);
    if (property.cuotaMensual) setCuotaMensual(property.cuotaMensual);
    if (property.tipoHipoteca) setTipoHipoteca(property.tipoHipoteca as 'fija' | 'variable');

    // Inicializar porcentajes basándose en los valores existentes
    // Mantenimiento: % del precio de la vivienda
    if (property.precio > 0 && property.mantenimiento) {
      const porcentajeCalc = (property.mantenimiento / property.precio) * 100;
      setPorcentajeMantenimiento(Math.round(porcentajeCalc * 100) / 100);
    } else {
      setPorcentajeMantenimiento(0.10);
    }

    // Seguro hogar: % del precio de la vivienda
    if (property.precio > 0 && property.seguroHogar) {
      const porcentajeCalc = (property.seguroHogar / property.precio) * 100;
      setPorcentajeSeguroHogar(Math.round(porcentajeCalc * 100) / 100);
    } else {
      setPorcentajeSeguroHogar(0.01);
    }

    // Periodos vacantes: % del precio de la vivienda
    if (property.precio > 0 && property.periodosVacantes) {
      const porcentajeCalc = (property.periodosVacantes / property.precio) * 100;
      setPorcentajePeriodosVacantes(Math.round(porcentajeCalc * 100) / 100);
    } else {
      setPorcentajePeriodosVacantes(0.03);
    }

    const rentaAnual = (property.alquilerMensual || 0) * 12;
    if (rentaAnual > 0) {
      if (property.seguroImpago !== null && property.seguroImpago !== undefined) {
        const porcentajeCalc = (property.seguroImpago / rentaAnual) * 100;
        setPorcentajeSeguroImpago(Math.round(porcentajeCalc * 10) / 10);
      } else {
        setPorcentajeSeguroImpago(5);
      }
    } else {
      setPorcentajeSeguroImpago(5);
    }

    // Seguro vida hipoteca: inicializar porcentaje según edad
    // (el valor en € se recalcula automáticamente en el useEffect sobre el importe de la hipoteca)
    const porcentajeVidaInit = calcularPorcentajeSeguroVida(edadAsegurado);
    setPorcentajeSeguroVida(Math.round(porcentajeVidaInit * 100) / 100);

    // IBI: detectar tipo de municipio automáticamente desde la dirección
    if (property.direccion) {
      const { tipo, porcentaje } = detectarTipoMunicipio(property.direccion);
      setTipoMunicipioIBI(tipo);
      setPorcentajeIBI(porcentaje);
    } else {
      setPorcentajeIBI(0.30);
      setTipoMunicipioIBI('ciudad_media');
    }

    // Obtener Euribor actualizado desde GPT
    await fetchEuribor();
  };

  // Función para calcular TODOS los gastos (de compra y de vivienda) automáticamente
  const handleCalculateAllExpenses = async () => {
    if (!selectedProperty) return;

    if (!selectedProperty.alquilerMensual || selectedProperty.alquilerMensual <= 0) {
      alert('⚠️ Debes rellenar el precio de alquiler mensual antes de usar el cálculo automático con GPT.');
      return;
    }

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

      // Calcular mantenimiento, seguro hogar y periodos vacantes (% del precio de la vivienda)
      const rentaAnual = (selectedProperty.alquilerMensual || 0) * 12;
      const mantenimiento = Math.round(selectedProperty.precio * 0.001); // 0.10% del precio
      const seguroHogar = Math.round(selectedProperty.precio * 0.0001); // 0.01% del precio
      const seguroImpago = Math.round(rentaAnual * 0.05); // 5% renta anual
      const periodosVacantes = Math.round(selectedProperty.precio * 0.0003); // 0.03% del precio
      // IBI: detectar automáticamente desde la dirección
      const ibiDetectado = detectarTipoMunicipio(selectedProperty.direccion || '');
      setTipoMunicipioIBI(ibiDetectado.tipo);
      setPorcentajeIBI(ibiDetectado.porcentaje);
      const ibiCalculado = Math.round(selectedProperty.precio * (ibiDetectado.porcentaje / 100));

      // Actualizar los porcentajes a los valores recomendados
      setPorcentajeMantenimiento(0.10);
      setPorcentajeSeguroHogar(0.01);
      setPorcentajeSeguroImpago(5);
      setPorcentajePeriodosVacantes(0.03);

      // Ocultar warnings ya que se están usando los porcentajes recomendados
      setShowSeguroImpagoWarning(false);

      // Calcular valores estimados para gastos de compra
      const notariaEstimada = Math.round(selectedProperty.precio * 0.003); // 0.3%
      const registroEstimado = Math.round(selectedProperty.precio * 0.00175); // 0.175%
      const comisionAgenciaEstimada = Math.round(selectedProperty.precio * 0.04 * 1.21); // 4% + 21% IVA

      // Seguro vida hipoteca: calculado según edad, sobre importe financiado
      const porcentajeVida = calcularPorcentajeSeguroVida(edadAsegurado);
      const importeHipotecaAutoFill = Math.max(0, calcularCostoTotal() - capitalPropio);
      const seguroVida = Math.round(importeHipotecaAutoFill * (porcentajeVida / 100));
      setPorcentajeSeguroVida(Math.round(porcentajeVida * 100) / 100);

      // 3. Actualizar TODOS los campos (gastos de compra + gastos de vivienda)
      setComunidadEstimadaIA(true); // Marcar que la comunidad fue estimada por IA
      setSelectedProperty({
        ...selectedProperty,
        ...purchaseResult.expenses,
        comunidadAutonoma: comunidad,
        esObraNueva: esNueva,
        itp: itpCalculado,
        iva: ivaCalculado,
        // Gastos de compra con valores estimados
        notariaCompra: notariaEstimada,
        registroCompra: registroEstimado,
        comisionAgencia: comisionAgenciaEstimada,
        // Gastos de vivienda (calculados inteligentemente por GPT o estimados)
        comunidadAnual: housingResult.expenses.comunidadAnual,
        seguroHogar: seguroHogar,
        seguroVidaHipoteca: seguroVida,
        ibi: ibiCalculado,
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

    // Actualizar la propiedad con todos los datos incluyendo hipoteca
    const propertyToSave = {
      ...selectedProperty,
      gastosAnuales: gastosAnualesCalculados,
      // Guardar datos de la hipoteca
      capitalPropio: capitalPropio,
      plazoHipoteca: plazoHipoteca,
      tipoInteres: tipoInteres,
      cuotaMensual: cuotaMensual,
      tipoHipoteca: tipoHipoteca,
    };

    // Actualizar la propiedad en el backend
    const result = await updateProperty(propertyToSave);
    
    if (result.success) {
      // Recargar propiedades para sincronizar con el backend
      await loadProperties();
    } else {
      console.error('Error al guardar detalles:', result.error);
      alert('Error al guardar los cambios: ' + result.error);
    }

    setShowDetailsModal(false);
    setLoading(false);
  };

  // Calcular coste total de la vivienda (precio + todos los gastos)
  // Calcular porcentaje de seguro de vida según edad (modelo exponencial)
  // Basado en datos reales: 60 años, 180.000€ hipoteca → 2.400€/año = 1.33%
  const calcularPorcentajeSeguroVida = (edad: number): number => {
    const edadClamped = Math.max(20, Math.min(70, edad));
    return Math.round(0.03 * Math.exp(0.0632 * edadClamped) * 100) / 100;
  };

  // Detectar tipo de municipio a partir de la dirección para calcular IBI
  const detectarTipoMunicipio = (direccion: string): { tipo: 'pueblo' | 'ciudad_media' | 'gran_ciudad' | 'capital', porcentaje: number } => {
    const dir = direccion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Capitales "caras" (> 500k hab o alto coste de vida)
    const capitalesCaras = ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao', 'san sebastian', 'donostia', 'palma de mallorca', 'palma'];
    for (const c of capitalesCaras) {
      if (dir.includes(c)) return { tipo: 'capital', porcentaje: 0.40 };
    }

    // Grandes ciudades (> 200k hab)
    const grandesCiudades = ['malaga', 'zaragoza', 'murcia', 'las palmas', 'alicante', 'cordoba', 'valladolid', 'vigo', 'gijon', 'hospitalet', 'vitoria', 'granada', 'elche', 'oviedo', 'santa cruz de tenerife', 'pamplona', 'santander', 'castellon', 'almeria', 'burgos', 'salamanca', 'albacete', 'logrono', 'badajoz', 'huelva', 'tarragona', 'leon', 'cadiz', 'lleida', 'jaen'];
    for (const c of grandesCiudades) {
      if (dir.includes(c)) return { tipo: 'gran_ciudad', porcentaje: 0.35 };
    }

    // Si tiene "calle", "avenida", "plaza" y parece urbano pero no se reconoce, asumir ciudad media
    const indicadoresUrbanos = ['calle', 'avenida', 'avda', 'paseo', 'plaza', 'ronda', 'gran via', 'boulevard'];
    for (const ind of indicadoresUrbanos) {
      if (dir.includes(ind)) return { tipo: 'ciudad_media', porcentaje: 0.30 };
    }

    // Por defecto: ciudad media
    return { tipo: 'ciudad_media', porcentaje: 0.30 };
  };

  const calcularCostoTotal = () => {
    if (!selectedProperty) return 0;
    return selectedProperty.precio +
      (selectedProperty.itp || 0) +
      (selectedProperty.iva || 0) +
      (selectedProperty.notariaCompra || 0) +
      (selectedProperty.registroCompra || 0) +
      (selectedProperty.comisionAgencia || 0) +
      (selectedProperty.gestoriaHipoteca || 0) +
      (selectedProperty.tasacion || 0) +
      (selectedProperty.comisionApertura || 0) +
      (selectedProperty.reforma || 0);
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
      const response = await fetch(`${API_URL}/api/estimate-rent`, {
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
    // Calcular el 30% del coste total para el capital propio
    if (!selectedProperty) return;
    const costoTotal =
      selectedProperty.precio +
      (selectedProperty.itp || 0) +
      (selectedProperty.iva || 0) +
      (selectedProperty.notariaCompra || 0) +
      (selectedProperty.registroCompra || 0) +
      (selectedProperty.comisionAgencia || 0) +
      (selectedProperty.gestoriaHipoteca || 0) +
      (selectedProperty.tasacion || 0) +
      (selectedProperty.comisionApertura || 0);
    
    const capitalPropio30 = Math.round(costoTotal * 0.30);
    setCapitalPropio(capitalPropio30);
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
    const costoTotal = calcularCostoTotal();
    if (valor > costoTotal && costoTotal > 0) {
      setCapitalPropio(costoTotal);
      setShowCapitalMaxWarning(true);
      setShowCapitalWarning(false);
      setTimeout(() => setShowCapitalMaxWarning(false), 4000);
      return;
    }
    setCapitalPropio(valor);
    setShowCapitalMaxWarning(false);
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
    <>
      {/* Botón de feedback (siempre visible) */}
      <FeedbackButton />

      {/* Modal de autenticación */}
      {!isAuthenticated && !checkingAuth && (
        <AuthModal onAuthenticated={() => setIsAuthenticated(true)} />
      )}

      {/* Contenido principal (solo visible si está autenticado) */}
      {isAuthenticated && (
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
                key={`${property.id}-${property.precio}-${property.alquilerMensual}-${property.gastosAnuales}-${property.capitalPropio}`}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:border-teal-500/50 relative"
              >
                {/* Botón eliminar - arriba a la derecha */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
                      handleDeleteProperty(property.id || '');
                    }
                  }}
                  className="absolute top-4 right-4 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                  title="Eliminar propiedad"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Área visual con gradiente dinámico e icono */}
                <div
                  onClick={() => handleOpenDetails(property)}
                  className="cursor-pointer relative"
                >
                  {/* Gradiente dinámico basado en ROI + Icono grande */}
                  <div className={`h-48 flex items-center justify-center relative overflow-hidden ${
                    (() => {
                      const roiData = calculateROI(property);
                      if (roiData.status === 'pending') {
                        return 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900';
                      }

                      const roi = roiData.value!;
                      if (roi < 5) {
                        return 'bg-gradient-to-br from-red-900 via-red-800 to-slate-900';
                      } else if (roi >= 5 && roi < 10) {
                        return 'bg-gradient-to-br from-green-900 via-green-800 to-slate-900';
                      } else if (roi >= 10 && roi < 15) {
                        return 'bg-gradient-to-br from-green-700 via-green-800 to-emerald-900';
                      } else {
                        return 'bg-gradient-to-br from-blue-700 via-cyan-800 to-teal-900';
                      }
                    })()
                  }`}>
                    {/* Icono grande de edificio/casa */}
                    <svg className="w-32 h-32 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>

                    {/* Badge ROI - Arriba izquierda */}
                    {(() => {
                      const roiData = calculateROI(property);
                      if (roiData.status === 'pending') {
                        return (
                          <div className="absolute top-3 left-3 px-3 py-2 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg shadow-lg">
                            <p className="text-gray-400 text-xs font-semibold">ROI</p>
                            <p className="text-white text-sm font-bold">Por calcular</p>
                          </div>
                        );
                      }

                      const roi = roiData.value!;
                      let bgColor = '';
                      let textColor = '';
                      let borderColor = '';
                      let extraClass = '';

                      if (roi < 5) {
                        bgColor = 'bg-red-900/90';
                        textColor = 'text-red-300';
                        borderColor = 'border-red-500';
                      } else if (roi >= 5 && roi < 10) {
                        bgColor = 'bg-green-900/90';
                        textColor = 'text-green-300';
                        borderColor = 'border-green-500';
                      } else if (roi >= 10 && roi < 15) {
                        bgColor = 'bg-green-900/90';
                        textColor = 'text-green-300';
                        borderColor = 'border-green-500';
                        extraClass = 'roi-particles';
                      } else {
                        bgColor = 'bg-blue-900/90';
                        textColor = 'text-blue-300';
                        borderColor = 'border-blue-500';
                        extraClass = 'roi-sparkle';
                      }

                      return (
                        <div className={`absolute top-3 left-3 px-3 py-2 backdrop-blur-sm border rounded-lg shadow-lg ${bgColor} ${borderColor} ${extraClass}`}>
                          <p className="text-xs font-semibold opacity-80">ROI</p>
                          <p className={`text-lg font-bold ${textColor}`}>{roi.toFixed(1)}%</p>
                        </div>
                      );
                    })()}

                    {/* Badge Alquiler - Abajo derecha */}
                    <div className="absolute bottom-3 right-3 px-3 py-2 bg-purple-900/90 backdrop-blur-sm border border-purple-500 rounded-lg shadow-lg">
                      <p className="text-purple-300 text-xs font-semibold">Alquiler</p>
                      {property.alquilerMensual ? (
                        <p className="text-white text-sm font-bold">{property.alquilerMensual}€/mes</p>
                      ) : (
                        <p className="text-gray-400 text-sm font-bold">Por añadir</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div 
                  onClick={() => handleOpenDetails(property)}
                  className="p-6 cursor-pointer"
                >
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
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-gray-400 text-xs">Alquiler estimado (IA + datos de mercado)</p>
                        {property.alquilerConfianza && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            property.alquilerConfianza === 'alta' ? 'bg-green-900/50 text-green-400' :
                            property.alquilerConfianza === 'media' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            Confianza {property.alquilerConfianza}
                          </span>
                        )}
                      </div>
                      <p className="text-purple-400 font-bold">{property.alquilerEstimado}</p>
                      {property.alquilerJustificacion && (
                        <p className="text-gray-500 text-xs mt-1">{property.alquilerJustificacion}</p>
                      )}
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
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[140px] justify-center"
                  >
                    {analyzingUrl ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Buscando...</span>
                      </>
                    ) : (
                      "Buscar"
                    )}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Pega el enlace para rellenar los datos automáticamente. También puedes introducir los datos manualmente.
                </p>
                {analyzingUrl && (
                  <div className="mt-2 flex items-center gap-2 text-orange-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>⏳ Este proceso puede tardar hasta 50 segundos...</span>
                  </div>
                )}
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

                <div className="md:col-span-2 bg-gradient-to-r from-teal-900/30 to-blue-900/30 p-4 rounded-lg border border-teal-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-white">Alquiler mensual (€)</label>
                    <button
                      type="button"
                      onClick={async () => {
                        setConsultingRent(true);
                        try {
                          const response = await fetch(`${API_URL}/api/estimate-rent`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(formData),
                          });

                          if (response.ok) {
                            const data = await response.json();
                            const match = data.estimate.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
                            if (match) {
                              const valorMedio = Math.round((parseFloat(match[1]) + parseFloat(match[2])) / 2);
                              setFormData({ ...formData, alquilerMensual: valorMedio });
                            } else {
                              const singleMatch = data.estimate.match(/(\d+(?:\.\d+)?)/);
                              if (singleMatch) {
                                setFormData({ ...formData, alquilerMensual: Math.round(parseFloat(singleMatch[1])) });
                              }
                            }
                          }
                        } catch (error) {
                          console.error('Error:', error);
                          alert('Error al estimar el alquiler');
                        } finally {
                          setConsultingRent(false);
                        }
                      }}
                      disabled={consultingRent}
                      className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs font-medium shadow-lg"
                    >
                      {consultingRent ? (
                        <>
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Calculando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Calcular con IA</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="number"
                    value={formData.alquilerMensual || ""}
                    onChange={(e) => setFormData({ ...formData, alquilerMensual: parseInt(e.target.value) || null })}
                    placeholder="850"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    💡 Usa IA para estimar según ubicación y características
                  </p>
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
                onClick={async () => {
                  // Guardar propiedad actualizada antes de navegar
                  if (selectedProperty && selectedProperty.id) {
                    setLoading(true);
                    
                    // Calcular gastosAnuales antes de guardar
                    const gastosAnualesCalculados =
                      (selectedProperty.comunidadAnual || 0) +
                      (selectedProperty.mantenimiento || 0) +
                      (selectedProperty.seguroHogar || 0) +
                      (selectedProperty.seguroVidaHipoteca || 0) +
                      (selectedProperty.seguroImpago || 0) +
                      (selectedProperty.ibi || 0) +
                      (selectedProperty.periodosVacantes || 0);
                    
                    // Actualizar la propiedad con todos los datos
                    const propertyToSave = {
                      ...selectedProperty,
                      gastosAnuales: gastosAnualesCalculados,
                      capitalPropio: capitalPropio,
                      plazoHipoteca: plazoHipoteca,
                      tipoInteres: tipoInteres,
                      cuotaMensual: cuotaMensual,
                      tipoHipoteca: tipoHipoteca,
                    };
                    
                    const result = await updateProperty(propertyToSave);
                    if (result.success) {
                      await loadProperties();
                      router.push(`/dashboard/${selectedProperty.id}`);
                    } else {
                      alert('Error al guardar los cambios: ' + result.error);
                    }
                    setLoading(false);
                  }
                }}
                disabled={loading || !todosLosDatosCompletos(selectedProperty)}
                className={`mt-4 w-full px-6 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all duration-500 ${
                  !todosLosDatosCompletos(selectedProperty)
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed shadow-inner translate-y-1 opacity-60 grayscale'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-[1.02] shadow-2xl financial-button-unlock'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>📈 Análisis Financiero Avanzado</span>
                {!todosLosDatosCompletos(selectedProperty) && (
                  <span className="text-xs bg-red-500/20 px-2 py-1 rounded">Completa todos los datos</span>
                )}
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
              {selectedProperty && (!selectedProperty.alquilerMensual || selectedProperty.alquilerMensual <= 0) && (
                <p className="mt-2 text-sm text-amber-400/80 flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Rellena el precio de alquiler mensual para poder usar esta función
                </p>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Grid para Precio y Alquiler - Siempre visible */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Precio de la Vivienda Base */}
                <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-500/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Precio de la vivienda + gastos</h3>
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

                {/* Alquiler Mensual - Siempre visible */}
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-bold text-white">Alquiler Mensual</h3>
                      {selectedProperty.alquilerMensual && selectedProperty.alquilerMensual > 0 && (
                        <span className="text-sm text-gray-400">({(selectedProperty.alquilerMensual * 12).toLocaleString()}€/año)</span>
                      )}
                    </div>
                    <button
                      onClick={estimarAlquiler}
                      disabled={consultingRent}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs font-medium shadow-lg"
                    >
                      {consultingRent ? (
                        <>
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Calculando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>IA</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="number"
                    value={selectedProperty.alquilerMensual || ''}
                    onChange={(e) => setSelectedProperty({ ...selectedProperty, alquilerMensual: parseInt(e.target.value) || null })}
                    placeholder="Ej: 850€"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl font-bold"
                  />
                </div>
              </div>

              {/* Contenedor con animación de deslizamiento */}
              <div className="relative overflow-hidden">
                  {/* Panel 1: Sección COSTES DE ADQUISICIÓN */}
                  <div className={`transition-all duration-500 ease-in-out ${
                    currentSection === 'gastos'
                      ? 'relative translate-x-0 opacity-100'
                      : 'absolute top-0 left-0 w-full -translate-x-full opacity-0 pointer-events-none'
                  }`}>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notaría (compraventa)
                      <span className="text-xs text-gray-400 ml-2">(entre 0,1% y 0,5% del precio)</span>
                    </label>
                    <input
                      type="number"
                      value={selectedProperty.notariaCompra || ''}
                      onChange={(e) => setSelectedProperty({ ...selectedProperty, notariaCompra: parseInt(e.target.value) || null })}
                      placeholder="600-900€"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Estimado (0,3%): {Math.round(selectedProperty.precio * 0.003).toLocaleString()}€
                    </p>
                  </div>

                  {/* Registro */}
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Registro (compraventa)
                      <span className="text-xs text-gray-400 ml-2">(entre 0,1% y 0,25% del precio)</span>
                    </label>
                    <input
                      type="number"
                      value={selectedProperty.registroCompra || ''}
                      onChange={(e) => setSelectedProperty({ ...selectedProperty, registroCompra: parseInt(e.target.value) || null })}
                      placeholder="400-600€"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Estimado (0,175%): {Math.round(selectedProperty.precio * 0.00175).toLocaleString()}€
                    </p>
                  </div>

                  {/* Comisión Agencia */}
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Comisión Agencia
                      <span className="text-xs text-gray-400 ml-2">(normalmente 3-5% + IVA)</span>
                    </label>
                    <input
                      type="number"
                      value={selectedProperty.comisionAgencia || ''}
                      onChange={(e) => setSelectedProperty({ ...selectedProperty, comisionAgencia: parseInt(e.target.value) || null })}
                      placeholder="0€"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Estimado (4% + 21% IVA): {Math.round(selectedProperty.precio * 0.04 * 1.21).toLocaleString()}€
                    </p>
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
                  <div className={`transition-all duration-500 ease-in-out ${
                    currentSection === 'hipoteca'
                      ? 'relative translate-x-0 opacity-100'
                      : currentSection === 'gastos'
                      ? 'absolute top-0 left-0 w-full translate-x-full opacity-0 pointer-events-none'
                      : 'absolute top-0 left-0 w-full -translate-x-full opacity-0 pointer-events-none'
                  }`}>
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
                            {/* Advertencia de capital mayor que precio + gastos */}
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                showCapitalMaxWarning ? 'max-h-16 opacity-100 mt-1.5' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className="flex items-center gap-1 px-2 py-1.5 bg-amber-900/20 border border-amber-500/30 rounded">
                                <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-[10px] text-amber-300 leading-tight">
                                  El capital no puede superar el precio + gastos: <span className="font-bold">{calcularCostoTotal().toLocaleString()}€</span>. Se ha ajustado al máximo.
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
                                ? Math.max(0, calcularCostoTotal() - capitalPropio).toLocaleString() + '€'
                                : '0€'
                              }
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">Precio + gastos - Capital propio</p>
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
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-300">Tipo de Interés (%)</label>
                            <button
                              type="button"
                              onClick={() => setShowTipoInteresTip(!showTipoInteresTip)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium shadow-lg"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span>{showTipoInteresTip ? 'Ocultar consejo' : 'Mejor tipo de interés'}</span>
                            </button>
                          </div>
                          <input
                            type="number"
                            value={tipoInteres || ''}
                            onChange={(e) => setTipoInteres(Number(e.target.value))}
                            step="0.01"
                            placeholder="3.5"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <p className="mt-2 text-xs text-gray-400">Puedes modificar este valor manualmente</p>

                          {/* Panel desplegable: Cómo conseguir mejor tipo de interés */}
                          <div
                            className={`overflow-hidden ${
                              showTipoInteresTip
                                ? 'max-h-[600px] opacity-100 mt-3 scale-100'
                                : 'max-h-0 opacity-0 mt-0 scale-[0.97]'
                            }`}
                            style={{
                              transformOrigin: 'top center',
                              transition: showTipoInteresTip
                                ? 'max-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out, margin 0.5s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                : 'max-height 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-in, margin 0.6s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            <div className="p-4 bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-yellow-900/30 border border-amber-500/40 rounded-xl">
                              <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Cómo conseguir un mejor tipo de interés
                              </h4>
                              <div className="space-y-2.5 text-xs text-gray-300 leading-relaxed">
                                <div className="flex gap-2">
                                  <span className="text-amber-400 font-bold mt-0.5">1.</span>
                                  <p><strong className="text-white">Compara entre varios bancos.</strong> No aceptes la primera oferta. Pide ofertas vinculantes en al menos 3-4 bancos y utiliza cada una como palanca de negociación con los demás.</p>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-amber-400 font-bold mt-0.5">2.</span>
                                  <p><strong className="text-white">Contrata un bróker hipotecario.</strong> Son gratuitos para ti (cobra el banco) y tienen acceso a ofertas mayoristas que no se publican. Pueden conseguir diferenciales 0.2-0.5% más bajos.</p>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-amber-400 font-bold mt-0.5">3.</span>
                                  <p><strong className="text-white">Mejora tu perfil financiero.</strong> Un contrato indefinido con antigüedad, ingresos estables, poco endeudamiento y un buen historial crediticio te dan poder de negociación.</p>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-amber-400 font-bold mt-0.5">4.</span>
                                  <p><strong className="text-white">Aporta más capital propio.</strong> Financiar el 70% o menos en vez del 80% mejora significativamente las condiciones, ya que el banco asume menos riesgo.</p>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-amber-400 font-bold mt-0.5">5.</span>
                                  <p><strong className="text-white">Vinculación inteligente.</strong> Domiciliar nómina, seguros y recibos puede rebajar el diferencial entre 0.3% y 1%. Valora si el ahorro compensa el coste de los productos vinculados.</p>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-amber-400 font-bold mt-0.5">6.</span>
                                  <p><strong className="text-white">Elige bien el momento.</strong> El Euribor fluctúa. Si está bajando, una hipoteca variable puede ser ventajosa a corto plazo; si está bajo y estable, fijar el tipo te protege de futuras subidas.</p>
                                </div>
                              </div>
                              <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between gap-3">
                                <p className="text-[11px] text-amber-400/80 italic">
                                  Recuerda: una diferencia de solo 0.5% en el tipo de interés puede suponer miles de euros de ahorro a lo largo de la vida de la hipoteca.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setShowTipoInteresTip(false)}
                                  className="flex-shrink-0 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 text-amber-300 rounded-lg transition-all duration-300 flex items-center gap-1.5 text-xs font-medium hover:scale-105 active:scale-95"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  <span>Cerrar</span>
                                </button>
                              </div>
                            </div>
                          </div>
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
                      {(() => {
                        const faltanDatos = !selectedProperty.alquilerMensual || selectedProperty.alquilerMensual <= 0 ||
                          capitalPropio <= 0 || plazoHipoteca <= 0 || tipoInteres <= 0;
                        return (
                          <div className="mt-6">
                            <div className="flex justify-end">
                              <button
                                onClick={() => !faltanDatos && setCurrentSection('gastosVivienda')}
                                disabled={faltanDatos}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                                  faltanDatos
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                              >
                                <span>Continuar a Gastos de la Vivienda</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </button>
                            </div>
                            {faltanDatos && (
                              <p className="text-xs text-yellow-400 text-right mt-2">
                                Completa todos los campos (alquiler, capital propio, plazo e interés) para continuar
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Panel 3: Sección GASTOS DE LA VIVIENDA */}
                  <div className={`transition-all duration-500 ease-in-out ${
                    currentSection === 'gastosVivienda'
                      ? 'relative translate-x-0 opacity-100'
                      : 'absolute top-0 left-0 w-full translate-x-full opacity-0 pointer-events-none'
                  }`}>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Comunidad Año */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Comunidad año</label>
                          <input
                            type="number"
                            value={selectedProperty.comunidadAnual || ''}
                            onChange={(e) => {
                              setComunidadEstimadaIA(false);
                              setSelectedProperty({ ...selectedProperty, comunidadAnual: parseInt(e.target.value) || null });
                            }}
                            placeholder="600€"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          {comunidadEstimadaIA && selectedProperty.comunidadAnual && selectedProperty.comunidadAnual > 0 && (
                            <p className="mt-2 text-xs text-amber-400/80">
                              Valor estimado por IA. Se recomienda consultar a la inmobiliaria para obtener el dato real.
                            </p>
                          )}
                        </div>

                        {/* Mantenimiento */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Mantenimiento (% del precio)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={porcentajeMantenimiento === 0 ? '' : porcentajeMantenimiento}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') {
                                setPorcentajeMantenimiento(0);
                                setSelectedProperty({ ...selectedProperty, mantenimiento: 0 });
                              } else {
                                const porcentaje = parseFloat(inputValue);
                                setPorcentajeMantenimiento(porcentaje);

                                // Calcular el valor en euros basado en el precio de la vivienda
                                const valorCalculado = Math.round(selectedProperty.precio * (porcentaje / 100));
                                setSelectedProperty({ ...selectedProperty, mantenimiento: valorCalculado });
                              }
                            }}
                            placeholder="0.10%"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <p className="mt-2 text-xs text-gray-400">
                            💡 Valor calculado: {selectedProperty.mantenimiento?.toLocaleString() || '0'}€ ({porcentajeMantenimiento}% del precio)
                          </p>
                        </div>

                        {/* Seguro Hogar */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Seguro Hogar (% del precio)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={porcentajeSeguroHogar === 0 ? '' : porcentajeSeguroHogar}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') {
                                setPorcentajeSeguroHogar(0);
                                setSelectedProperty({ ...selectedProperty, seguroHogar: 0 });
                              } else {
                                const porcentaje = parseFloat(inputValue);
                                setPorcentajeSeguroHogar(porcentaje);
                                const valorCalculado = Math.round(selectedProperty.precio * (porcentaje / 100));
                                setSelectedProperty({ ...selectedProperty, seguroHogar: valorCalculado });
                              }
                            }}
                            placeholder="0.01%"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <p className="mt-2 text-xs text-gray-400">
                            💡 Valor calculado: {selectedProperty.seguroHogar?.toLocaleString() || '0'}€ ({porcentajeSeguroHogar}% del precio)
                          </p>
                        </div>

                        {/* Seguro Vida Hipoteca - Con selector de edad */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-300">Seguro Vida Hipoteca</label>
                            <button
                              type="button"
                              onClick={() => setShowSeguroVidaInfo(!showSeguroVidaInfo)}
                              className="p-1.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center gap-1 text-xs font-medium"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>

                          {/* Selector de edad */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-gray-400">Edad del asegurado</span>
                              <span className="text-sm font-bold text-white bg-slate-600/50 px-2.5 py-0.5 rounded-full">{edadAsegurado} años</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="70"
                              value={edadAsegurado}
                              onChange={(e) => {
                                const edad = parseInt(e.target.value);
                                setEdadAsegurado(edad);
                                const nuevoPorcentaje = calcularPorcentajeSeguroVida(edad);
                                const porcentajeRedondeado = Math.round(nuevoPorcentaje * 100) / 100;
                                setPorcentajeSeguroVida(porcentajeRedondeado);
                                if (selectedProperty) {
                                  const importeHip = Math.max(0, calcularCostoTotal() - capitalPropio);
                                  const valorCalculado = Math.round(importeHip * (porcentajeRedondeado / 100));
                                  setSelectedProperty({ ...selectedProperty, seguroVidaHipoteca: valorCalculado });
                                }
                              }}
                              className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-teal-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                              <span>20</span>
                              <span>30</span>
                              <span>40</span>
                              <span>50</span>
                              <span>60</span>
                              <span>70</span>
                            </div>
                          </div>

                          {/* Porcentaje y valor calculado */}
                          <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-2.5">
                            <div className="flex-1">
                              <span className="text-xs text-gray-400">Tarifa</span>
                              <p className="text-lg font-bold text-blue-400">{porcentajeSeguroVida}%</p>
                            </div>
                            <div className="w-px h-8 bg-slate-600"></div>
                            <div className="flex-1">
                              <span className="text-xs text-gray-400">Coste anual</span>
                              <p className="text-lg font-bold text-white">{selectedProperty.seguroVidaHipoteca?.toLocaleString() || '0'}€</p>
                            </div>
                          </div>
                          <p className="mt-1.5 text-[10px] text-gray-500">
                            Calculado sobre el importe financiado: {Math.max(0, calcularCostoTotal() - capitalPropio).toLocaleString()}€
                          </p>

                          {/* Panel informativo desplegable */}
                          <div
                            className={`overflow-hidden ${
                              showSeguroVidaInfo
                                ? 'max-h-[300px] opacity-100 mt-3 scale-100'
                                : 'max-h-0 opacity-0 mt-0 scale-[0.97]'
                            }`}
                            style={{
                              transformOrigin: 'top center',
                              transition: showSeguroVidaInfo
                                ? 'max-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out, margin 0.5s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                : 'max-height 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-in, margin 0.6s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            <div className="p-3 bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-blue-900/30 border border-blue-500/30 rounded-xl">
                              <h4 className="text-xs font-bold text-blue-300 mb-2 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Modelo de estimación
                              </h4>
                              <p className="text-[11px] text-gray-300 leading-relaxed">
                                El modelo empleado constituye una aproximación basada en tarifas medias de mercado, no sustituyendo el cálculo actuarial completo utilizado por las entidades aseguradoras, pero resultando adecuado para simulaciones de rentabilidad inmobiliaria y análisis comparativo de inversiones.
                              </p>
                              <div className="mt-2.5 pt-2 border-t border-blue-500/20 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowSeguroVidaInfo(false)}
                                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all duration-300 flex items-center gap-1.5 text-xs font-medium hover:scale-105 active:scale-95"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  <span>Cerrar</span>
                                </button>
                              </div>
                            </div>
                          </div>
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
                          <label className="block text-sm font-medium text-gray-300 mb-1">IBI (% del precio)</label>
                          <p className="text-[10px] text-gray-500 mb-2">Detectado automáticamente desde la dirección. Puedes cambiarlo.</p>
                          {/* Selector de tipo de municipio */}
                          <div className="grid grid-cols-2 gap-1.5 mb-3">
                            {([
                              { key: 'pueblo' as const, label: 'Pueblo', pct: 0.20 },
                              { key: 'ciudad_media' as const, label: 'Ciudad media', pct: 0.30 },
                              { key: 'gran_ciudad' as const, label: 'Gran ciudad', pct: 0.35 },
                              { key: 'capital' as const, label: 'Capital cara', pct: 0.40 },
                            ]).map(({ key, label, pct }) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setTipoMunicipioIBI(key);
                                  setPorcentajeIBI(pct);
                                  const valorCalculado = Math.round(selectedProperty.precio * (pct / 100));
                                  setSelectedProperty({ ...selectedProperty, ibi: valorCalculado });
                                }}
                                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                  tipoMunicipioIBI === key
                                    ? 'bg-teal-500/30 border border-teal-500/60 text-teal-300'
                                    : 'bg-slate-700/50 border border-slate-600 text-gray-400 hover:bg-slate-700 hover:text-gray-300'
                                }`}
                              >
                                {label} ({pct}%)
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-2.5">
                            <div className="flex-1">
                              <span className="text-xs text-gray-400">Tarifa</span>
                              <p className="text-lg font-bold text-teal-400">{porcentajeIBI}%</p>
                            </div>
                            <div className="w-px h-8 bg-slate-600"></div>
                            <div className="flex-1">
                              <span className="text-xs text-gray-400">IBI anual</span>
                              <p className="text-lg font-bold text-white">{selectedProperty.ibi?.toLocaleString() || '0'}€</p>
                            </div>
                          </div>
                        </div>

                        {/* Periodos Vacantes */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Periodos Vacantes (% del precio)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={porcentajePeriodosVacantes === 0 ? '' : porcentajePeriodosVacantes}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') {
                                setPorcentajePeriodosVacantes(0);
                                setSelectedProperty({ ...selectedProperty, periodosVacantes: 0 });
                              } else {
                                const porcentaje = parseFloat(inputValue);
                                setPorcentajePeriodosVacantes(porcentaje);

                                // Calcular el valor en euros basado en el precio
                                const valorCalculado = Math.round(selectedProperty.precio * (porcentaje / 100));
                                setSelectedProperty({ ...selectedProperty, periodosVacantes: valorCalculado });
                              }
                            }}
                            placeholder="0.03%"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <p className="mt-2 text-xs text-gray-400">
                            💡 Valor calculado: {selectedProperty.periodosVacantes?.toLocaleString() || '0'}€ ({porcentajePeriodosVacantes}% del precio)
                          </p>
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
      )}
    </>
  );
}

