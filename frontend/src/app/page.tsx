"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyData, analyzeProperty, saveProperty, updateProperty, getProperties, deleteProperty, estimateRent, calculateExpenses, calculateHousingExpenses, calculateITP, calculateIVA, ITP_BY_COMUNIDAD, getEuribor, getAuthToken, signOut } from "@/services/api";
import AuthModal from "@/components/AuthModal";
import FeedbackButton from "@/components/FeedbackButton";
import PageHeader from "@/components/PageHeader";
import AddPropertyButton from "@/components/AddPropertyButton";
import PropertyList from "@/components/PropertyList";
import AddPropertyModal from "@/components/AddPropertyModal";
import DetailsModal from "@/components/DetailsModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  // mantenimiento, seguroHogar, seguroImpago se editan en € directo (via selectedProperty)
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

  // Verificar autenticación al cargar (JWT en localStorage)
  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
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

  // Recalcular valores basados en porcentaje (solo los que siguen siendo %)
  useEffect(() => {
    if (selectedProperty) {
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
    }
  }, [selectedProperty?.alquilerMensual, selectedProperty?.precio, capitalPropio, porcentajeSeguroVida, porcentajeIBI, porcentajePeriodosVacantes]);

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
          // Actualizar porcentajes de gastos que siguen en %
          if (updated.precio > 0) {
            if (updated.periodosVacantes) setPorcentajePeriodosVacantes(Math.round((updated.periodosVacantes / updated.precio) * 10000) / 100);
            if (updated.ibi) setPorcentajeIBI(Math.round((updated.ibi / updated.precio) * 10000) / 100);
          }
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

  const handleDuplicateProperty = async () => {
    if (!selectedProperty) return;
    const duplicate: PropertyData = {
      ...selectedProperty,
      id: undefined,
      nombre: `${selectedProperty.nombre} (copia)`,
    };
    const result = await saveProperty(duplicate);
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

    // Inicializar porcentajes para campos que siguen en %
    // Periodos vacantes: % del precio de la vivienda
    if (property.precio > 0 && property.periodosVacantes) {
      const porcentajeCalc = (property.periodosVacantes / property.precio) * 100;
      setPorcentajePeriodosVacantes(Math.round(porcentajeCalc * 100) / 100);
    } else {
      setPorcentajePeriodosVacantes(0.03);
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

      // Actualizar porcentajes que siguen en %
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
      <FeedbackButton />

      {isLoggingOut && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm"
          style={{ animation: 'bgPulse 0.35s ease-out both' }}
        >
          <div
            className="flex flex-col items-center gap-5"
            style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.05s both' }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <p className="text-white text-xl font-semibold" style={{ animation: 'slideUp 0.35s ease-out 0.15s both' }}>
              Hasta pronto
            </p>
            <p className="text-slate-400 text-sm" style={{ animation: 'slideUp 0.35s ease-out 0.25s both' }}>
              Cerrando sesión...
            </p>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <button
          onClick={async () => {
            setIsLoggingOut(true);
            await new Promise(r => setTimeout(r, 1000));
            signOut();
            setIsAuthenticated(false);
            setProperties([]);
            setIsLoggingOut(false);
          }}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-red-900/60 border border-slate-600/60 hover:border-red-500/50 text-slate-400 hover:text-red-400 rounded-xl backdrop-blur-sm transition-all text-xs font-medium shadow-lg group"
          title="Cerrar sesión"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      )}

      {!isAuthenticated && !checkingAuth && (
        <AuthModal onAuthenticated={() => setIsAuthenticated(true)} />
      )}

      {isAuthenticated && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-8">
          <PageHeader />
          <AddPropertyButton onClick={() => setShowModal(true)} />
          <PropertyList
            properties={properties}
            calculateROI={calculateROI}
            onOpenDetails={handleOpenDetails}
            onDeleteProperty={handleDeleteProperty}
          />

          {showModal && (
            <AddPropertyModal
              formData={formData}
              setFormData={setFormData}
              idealistaUrl={idealistaUrl}
              setIdealistaUrl={setIdealistaUrl}
              analyzingUrl={analyzingUrl}
              consultingRent={consultingRent}
              loading={loading}
              onAnalyzeUrl={handleAnalyzeUrl}
              onEstimateRent={() => handleEstimateRent(formData)}
              onSave={handleSaveProperty}
              onClose={() => { setShowModal(false); resetForm(); }}
            />
          )}

          {showDetailsModal && selectedProperty && (
            <DetailsModal
              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}
              currentSection={currentSection}
              setCurrentSection={setCurrentSection}
              loading={loading}
              calculatingExpenses={calculatingExpenses}
              consultingRent={consultingRent}
              consultingEuribor={consultingEuribor}
              capitalPropio={capitalPropio}
              showCapitalWarning={showCapitalWarning}
              showCapitalMaxWarning={showCapitalMaxWarning}
              plazoHipoteca={plazoHipoteca}
              setPlazoHipoteca={setPlazoHipoteca}
              tipoInteres={tipoInteres}
              setTipoInteres={setTipoInteres}
              cuotaMensual={cuotaMensual}
              tipoHipoteca={tipoHipoteca}
              euriborActual={euriborActual}
              setEuriborActual={setEuriborActual}
              showTipoInteresTip={showTipoInteresTip}
              setShowTipoInteresTip={setShowTipoInteresTip}
              showSeguroImpagoWarning={showSeguroImpagoWarning}
              setShowSeguroImpagoWarning={setShowSeguroImpagoWarning}
              showSeguroVidaInfo={showSeguroVidaInfo}
              setShowSeguroVidaInfo={setShowSeguroVidaInfo}
              comunidadFilter={comunidadFilter}
              setComunidadFilter={setComunidadFilter}
              showComunidadDropdown={showComunidadDropdown}
              setShowComunidadDropdown={setShowComunidadDropdown}
              porcentajePeriodosVacantes={porcentajePeriodosVacantes}
              setPorcentajePeriodosVacantes={setPorcentajePeriodosVacantes}
              porcentajeSeguroVida={porcentajeSeguroVida}
              setPorcentajeSeguroVida={setPorcentajeSeguroVida}
              porcentajeIBI={porcentajeIBI}
              setPorcentajeIBI={setPorcentajeIBI}
              edadAsegurado={edadAsegurado}
              setEdadAsegurado={setEdadAsegurado}
              tipoMunicipioIBI={tipoMunicipioIBI}
              setTipoMunicipioIBI={setTipoMunicipioIBI}
              comunidadEstimadaIA={comunidadEstimadaIA}
              setComunidadEstimadaIA={setComunidadEstimadaIA}
              todosLosDatosCompletos={todosLosDatosCompletos}
              calcularCostoTotal={calcularCostoTotal}
              calcularCapitalMinimo={calcularCapitalMinimo}
              calcularTipoInteres={calcularTipoInteres}
              calcularPorcentajeSeguroVida={calcularPorcentajeSeguroVida}
              onClose={() => setShowDetailsModal(false)}
              onNavigateToDashboard={() => {
                if (selectedProperty?.id) {
                  router.push(`/dashboard/${selectedProperty.id}`);
                }
              }}
              onCalculateAllExpenses={handleCalculateAllExpenses}
              onEstimateRent={estimarAlquiler}
              onConsultarEuribor={consultarEuriborBCE}
              onCapitalPropioChange={handleCapitalPropioChange}
              onTipoHipotecaChange={handleTipoHipotecaChange}
              onCalcularCuota={calcularCuotaHipoteca}
              onSaveDetails={handleSaveDetails}
              onDeleteProperty={handleDeleteProperty}
              onDuplicateProperty={handleDuplicateProperty}
            />
          )}
        </div>
      )}
    </>
  );
}

