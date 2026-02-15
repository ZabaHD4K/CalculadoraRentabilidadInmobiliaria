"use client";

import { useState } from "react";
import { PropertyData, calculateITP, calculateIVA, ITP_BY_COMUNIDAD } from "@/services/api";

interface DetailsModalProps {
  selectedProperty: PropertyData;
  setSelectedProperty: React.Dispatch<React.SetStateAction<PropertyData | null>>;
  currentSection: 'gastos' | 'hipoteca' | 'gastosVivienda';
  setCurrentSection: (section: 'gastos' | 'hipoteca' | 'gastosVivienda') => void;
  loading: boolean;
  calculatingExpenses: boolean;
  consultingRent: boolean;
  consultingEuribor: boolean;
  capitalPropio: number;
  showCapitalWarning: boolean;
  showCapitalMaxWarning: boolean;
  plazoHipoteca: number;
  setPlazoHipoteca: (val: number) => void;
  tipoInteres: number;
  setTipoInteres: (val: number) => void;
  cuotaMensual: number;
  tipoHipoteca: 'fija' | 'variable';
  euriborActual: number;
  setEuriborActual: (val: number) => void;
  showTipoInteresTip: boolean;
  setShowTipoInteresTip: (show: boolean) => void;
  showSeguroImpagoWarning: boolean;
  setShowSeguroImpagoWarning: (show: boolean) => void;
  showSeguroVidaInfo: boolean;
  setShowSeguroVidaInfo: (show: boolean) => void;
  comunidadFilter: string;
  setComunidadFilter: (val: string) => void;
  showComunidadDropdown: boolean;
  setShowComunidadDropdown: (show: boolean) => void;
  // mantenimiento, seguroHogar, seguroImpago se editan en € directo via selectedProperty
  porcentajePeriodosVacantes: number;
  setPorcentajePeriodosVacantes: (val: number) => void;
  porcentajeSeguroVida: number;
  setPorcentajeSeguroVida: (val: number) => void;
  porcentajeIBI: number;
  setPorcentajeIBI: (val: number) => void;
  edadAsegurado: number;
  setEdadAsegurado: (val: number) => void;
  tipoMunicipioIBI: 'pueblo' | 'ciudad_media' | 'gran_ciudad' | 'capital';
  setTipoMunicipioIBI: (val: 'pueblo' | 'ciudad_media' | 'gran_ciudad' | 'capital') => void;
  comunidadEstimadaIA: boolean;
  setComunidadEstimadaIA: (val: boolean) => void;
  todosLosDatosCompletos: (property: PropertyData) => boolean;
  calcularCostoTotal: () => number;
  calcularCapitalMinimo: () => number;
  calcularTipoInteres: (tipo: 'fija' | 'variable') => number;
  calcularPorcentajeSeguroVida: (edad: number) => number;
  onClose: () => void;
  onNavigateToDashboard: () => void;
  onCalculateAllExpenses: () => void;
  onEstimateRent: () => void;
  onConsultarEuribor: () => void;
  onCapitalPropioChange: (valor: number) => void;
  onTipoHipotecaChange: (tipo: 'fija' | 'variable') => void;
  onCalcularCuota: () => void;
  onSaveDetails: () => void;
  onDeleteProperty: (id: string) => void;
  onDuplicateProperty: () => Promise<void>;
}

export default function DetailsModal(props: DetailsModalProps) {
  const {
    selectedProperty, setSelectedProperty,
    currentSection, setCurrentSection,
    loading, calculatingExpenses, consultingRent, consultingEuribor,
    capitalPropio, showCapitalWarning, showCapitalMaxWarning,
    plazoHipoteca, setPlazoHipoteca,
    tipoInteres, setTipoInteres,
    cuotaMensual, tipoHipoteca,
    euriborActual, setEuriborActual,
    showTipoInteresTip, setShowTipoInteresTip,
    showSeguroImpagoWarning, setShowSeguroImpagoWarning,
    showSeguroVidaInfo, setShowSeguroVidaInfo,
    comunidadFilter, setComunidadFilter,
    showComunidadDropdown, setShowComunidadDropdown,
    // mantenimiento, seguroHogar, seguroImpago se editan directo en € via selectedProperty
    porcentajePeriodosVacantes, setPorcentajePeriodosVacantes,
    porcentajeSeguroVida, setPorcentajeSeguroVida,
    porcentajeIBI, setPorcentajeIBI,
    edadAsegurado, setEdadAsegurado,
    tipoMunicipioIBI, setTipoMunicipioIBI,
    comunidadEstimadaIA, setComunidadEstimadaIA,
    todosLosDatosCompletos, calcularCostoTotal, calcularCapitalMinimo,
    calcularTipoInteres: calcularTipoInteresFn, calcularPorcentajeSeguroVida,
    onClose, onNavigateToDashboard, onCalculateAllExpenses,
    onEstimateRent, onConsultarEuribor,
    onCapitalPropioChange, onTipoHipotecaChange, onCalcularCuota,
    onSaveDetails, onDeleteProperty, onDuplicateProperty,
  } = props;

  const [editingNombre, setEditingNombre] = useState(false);
  const [editingPrecio, setEditingPrecio] = useState(false);

  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [duplicateSuccess, setDuplicateSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 z-10">
          <div className="flex justify-between items-start">
            <div>
              {editingNombre ? (
                <input
                  autoFocus
                  type="text"
                  value={selectedProperty.nombre}
                  onChange={(e) => setSelectedProperty({ ...selectedProperty, nombre: e.target.value })}
                  onBlur={() => setEditingNombre(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditingNombre(false); }}
                  className="text-3xl font-bold text-white mb-2 bg-slate-700/80 border border-teal-500/60 rounded-lg px-3 py-1 focus:outline-none focus:border-teal-400 w-full max-w-lg"
                />
              ) : (
                <h2
                  className="text-3xl font-bold text-white mb-2 cursor-pointer hover:text-teal-300 transition-colors group flex items-center gap-2"
                  onDoubleClick={() => setEditingNombre(true)}
                  title="Doble click para editar"
                >
                  {selectedProperty.nombre}
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </h2>
              )}
              <p className="text-gray-400">{selectedProperty.direccion}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Botón Análisis Financiero */}
          <button
            onClick={onNavigateToDashboard}
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

          {/* Botón GPT auto-fill */}
          <button
            onClick={onCalculateAllExpenses}
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
          {(!selectedProperty.alquilerMensual || selectedProperty.alquilerMensual <= 0) && (
            <p className="mt-2 text-sm text-amber-400/80 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Rellena el precio de alquiler mensual para poder usar esta función
            </p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Grid Precio y Alquiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-500/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Precio de la vivienda + gastos</h3>
              <p className="text-4xl font-bold text-teal-400">
                {(
                  selectedProperty.precio +
                  (selectedProperty.itp || 0) + (selectedProperty.iva || 0) +
                  (selectedProperty.notariaCompra || 0) + (selectedProperty.registroCompra || 0) +
                  (selectedProperty.reforma || 0) + (selectedProperty.comisionAgencia || 0) +
                  (selectedProperty.gestoriaHipoteca || 0) + (selectedProperty.tasacion || 0) +
                  (selectedProperty.comisionApertura || 0)
                ).toLocaleString()}€
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-white">Alquiler Mensual</h3>
                  {selectedProperty.alquilerMensual && selectedProperty.alquilerMensual > 0 && (
                    <span className="text-sm text-gray-400">({(selectedProperty.alquilerMensual * 12).toLocaleString()}€/año)</span>
                  )}
                </div>
                <button
                  onClick={onEstimateRent}
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
            {/* Panel 1: COSTES DE ADQUISICIÓN */}
            <div className={`transition-all duration-500 ease-in-out ${
              currentSection === 'gastos'
                ? 'relative translate-x-0 opacity-100'
                : 'absolute top-0 left-0 w-full -translate-x-full opacity-0 pointer-events-none'
            }`}>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6">Costes de Adquisición</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Compraventa</label>
                    {editingPrecio ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          type="number"
                          min={0}
                          step={1000}
                          value={selectedProperty.precio}
                          onChange={(e) => setSelectedProperty({ ...selectedProperty, precio: parseInt(e.target.value) || 0 })}
                          onBlur={() => setEditingPrecio(false)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditingPrecio(false); }}
                          className="text-2xl font-bold text-white bg-slate-700/80 border border-teal-500/60 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-400 w-full"
                        />
                        <span className="text-2xl font-bold text-white">€</span>
                      </div>
                    ) : (
                      <div
                        className="text-3xl font-bold text-white cursor-pointer hover:text-teal-300 transition-colors group flex items-center gap-2"
                        onDoubleClick={() => setEditingPrecio(true)}
                        title="Doble click para editar"
                      >
                        {selectedProperty.precio.toLocaleString()}€
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Precio de compra · doble click para editar</p>
                  </div>

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

                  {selectedProperty.esObraNueva ? (
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                      <label className="block text-sm font-medium text-gray-300 mb-2">IVA (10%)</label>
                      <input type="number" value={selectedProperty.iva || ''} onChange={(e) => setSelectedProperty({ ...selectedProperty, iva: parseInt(e.target.value) || null })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      <p className="text-xs text-gray-500 mt-1">Calculado: {calculateIVA(selectedProperty.precio).toLocaleString()}€</p>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 space-y-3">
                      <label className="block text-sm font-medium text-gray-300">ITP (Impuesto de Transmisiones Patrimoniales)</label>
                      <div className="relative">
                        <input type="text" value={comunidadFilter} onChange={(e) => { setComunidadFilter(e.target.value); setShowComunidadDropdown(true); }} onFocus={() => setShowComunidadDropdown(true)} placeholder="Escribe la Comunidad Autónoma (ej: Madrid, Cataluña...)" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        {showComunidadDropdown && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowComunidadDropdown(false)} />
                            <div className="absolute z-20 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                              {Object.keys(ITP_BY_COMUNIDAD).filter(comunidad => comunidad.toLowerCase().includes(comunidadFilter.toLowerCase())).map((comunidad) => (
                                <button key={comunidad} type="button" onClick={() => { setSelectedProperty({ ...selectedProperty, comunidadAutonoma: comunidad, itp: calculateITP(selectedProperty.precio, comunidad) }); setComunidadFilter(comunidad); setShowComunidadDropdown(false); }} className="w-full px-4 py-3 text-left hover:bg-slate-600 transition-colors flex justify-between items-center group">
                                  <span className="text-white group-hover:text-teal-400 transition-colors">{comunidad}</span>
                                  <span className="text-xs text-gray-400 group-hover:text-teal-300 font-semibold">ITP: {ITP_BY_COMUNIDAD[comunidad]}%</span>
                                </button>
                              ))}
                              {Object.keys(ITP_BY_COMUNIDAD).filter(comunidad => comunidad.toLowerCase().includes(comunidadFilter.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-gray-500 text-sm">No se encontraron coincidencias</div>
                              )}
                            </div>
                          </>
                        )}
                        {selectedProperty.comunidadAutonoma && ITP_BY_COMUNIDAD[selectedProperty.comunidadAutonoma] && (
                          <p className="text-xs text-teal-400 mt-1 font-semibold">✓ ITP en {selectedProperty.comunidadAutonoma}: {ITP_BY_COMUNIDAD[selectedProperty.comunidadAutonoma]}%</p>
                        )}
                      </div>
                      <div>
                        <input type="number" value={selectedProperty.itp || ''} onChange={(e) => setSelectedProperty({ ...selectedProperty, itp: parseInt(e.target.value) || null })} placeholder="Monto del ITP en €" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        {selectedProperty.comunidadAutonoma && ITP_BY_COMUNIDAD[selectedProperty.comunidadAutonoma] && (
                          <p className="text-xs text-gray-500 mt-1">Calculado automáticamente: {calculateITP(selectedProperty.precio, selectedProperty.comunidadAutonoma).toLocaleString()}€</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notaría (compraventa)<span className="text-xs text-gray-400 ml-2">(entre 0,1% y 0,5% del precio)</span></label>
                    <input type="number" value={selectedProperty.notariaCompra || ''} onChange={(e) => setSelectedProperty({ ...selectedProperty, notariaCompra: parseInt(e.target.value) || null })} placeholder="600-900€" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <p className="text-xs text-gray-500 mt-1">Estimado (0,3%): {Math.round(selectedProperty.precio * 0.003).toLocaleString()}€</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Registro (compraventa)<span className="text-xs text-gray-400 ml-2">(entre 0,1% y 0,25% del precio)</span></label>
                    <input type="number" value={selectedProperty.registroCompra || ''} onChange={(e) => setSelectedProperty({ ...selectedProperty, registroCompra: parseInt(e.target.value) || null })} placeholder="400-600€" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <p className="text-xs text-gray-500 mt-1">Estimado (0,175%): {Math.round(selectedProperty.precio * 0.00175).toLocaleString()}€</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Comisión Agencia<span className="text-xs text-gray-400 ml-2">(normalmente 3-5% + IVA)</span></label>
                    <input type="number" value={selectedProperty.comisionAgencia || ''} onChange={(e) => setSelectedProperty({ ...selectedProperty, comisionAgencia: parseInt(e.target.value) || null })} placeholder="0€" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <p className="text-xs text-gray-500 mt-1">Estimado (4% + 21% IVA): {Math.round(selectedProperty.precio * 0.04 * 1.21).toLocaleString()}€</p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button onClick={() => setCurrentSection('hipoteca')} className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg">
                    <span>Continuar a Hipoteca</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Panel 2: HIPOTECA */}
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
                  <button onClick={() => setCurrentSection('gastos')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                    <span>Volver a Costes de Adquisición</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Capital Propio (€)</label>
                    <div className="relative">
                      <input type="number" value={capitalPropio || ''} onChange={(e) => onCapitalPropioChange(Number(e.target.value))} placeholder="Capital de entrada" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showCapitalWarning ? 'max-h-12 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-900/20 border border-red-500/30 rounded">
                          <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <p className="text-[10px] text-red-300 leading-tight">Mínimo: <span className="font-bold">{calcularCapitalMinimo().toLocaleString()}€</span> (20%)</p>
                        </div>
                      </div>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showCapitalMaxWarning ? 'max-h-16 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                        <div className="flex items-center gap-1 px-2 py-1.5 bg-amber-900/20 border border-amber-500/30 rounded">
                          <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <p className="text-[10px] text-amber-300 leading-tight">El capital no puede superar el precio + gastos: <span className="font-bold">{calcularCostoTotal().toLocaleString()}€</span>. Se ha ajustado al máximo.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Plazo (años)</label>
                      <input type="number" value={plazoHipoteca || ''} onChange={(e) => setPlazoHipoteca(Number(e.target.value))} placeholder="20, 25, 30..." className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      {plazoHipoteca > 35 && <p className="mt-2 text-xs text-red-400 font-medium">⚠️ Un plazo mayor a 35 años es muy poco común. Lo normal es un máximo de 30 años.</p>}
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Euribor a 12 meses (%)</label>
                      <div className="flex gap-2">
                        <input type="number" value={euriborActual || ''} onChange={(e) => { const nuevoEuribor = Number(e.target.value); setEuriborActual(nuevoEuribor); const interesCalculado = calcularTipoInteresFn(tipoHipoteca); setTipoInteres(interesCalculado); }} step="0.01" placeholder="2.50" className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        <button onClick={onConsultarEuribor} disabled={consultingEuribor} title="Consultar Euribor del día en el BCE" className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                          {consultingEuribor ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          )}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">Consulta el dato oficial del BCE o intróduce manualmente</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Importe de la Hipoteca</label>
                    <div className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white flex items-center">
                      <span className="text-lg font-semibold text-teal-400">{selectedProperty?.precio && capitalPropio ? Math.max(0, calcularCostoTotal() - capitalPropio).toLocaleString() + '€' : '0€'}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Precio + gastos - Capital propio</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-3">Tipo de Hipoteca</label>
                    <div className="relative inline-flex w-full bg-slate-700 rounded-lg p-1">
                      <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-teal-500/30 border border-teal-500/50 rounded-md transition-all duration-300 ease-in-out ${tipoHipoteca === 'fija' ? 'left-1' : 'left-[calc(50%+4px-1px)]'}`} />
                      <button type="button" onClick={() => onTipoHipotecaChange('fija')} className={`relative flex-1 px-6 py-3 rounded-md font-semibold transition-colors duration-300 ${tipoHipoteca === 'fija' ? 'text-teal-400' : 'text-gray-400 hover:text-gray-300'}`}>Fija</button>
                      <button type="button" onClick={() => onTipoHipotecaChange('variable')} className={`relative flex-1 px-6 py-3 rounded-md font-semibold transition-colors duration-300 ${tipoHipoteca === 'variable' ? 'text-teal-400' : 'text-gray-400 hover:text-gray-300'}`}>Variable</button>
                    </div>
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
                      <button type="button" onClick={() => setShowTipoInteresTip(!showTipoInteresTip)} className="px-3 py-1.5 bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium shadow-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        <span>{showTipoInteresTip ? 'Ocultar consejo' : 'Mejor tipo de interés'}</span>
                      </button>
                    </div>
                    <input type="number" value={tipoInteres || ''} onChange={(e) => setTipoInteres(Number(e.target.value))} step="0.01" placeholder="3.5" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <p className="mt-2 text-xs text-gray-400">Puedes modificar este valor manualmente</p>

                    <div className={`overflow-hidden ${showTipoInteresTip ? 'max-h-[600px] opacity-100 mt-3 scale-100' : 'max-h-0 opacity-0 mt-0 scale-[0.97]'}`} style={{ transformOrigin: 'top center', transition: showTipoInteresTip ? 'max-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out, margin 0.5s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'max-height 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-in, margin 0.6s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      <div className="p-4 bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-yellow-900/30 border border-amber-500/40 rounded-xl">
                        <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                          Cómo conseguir un mejor tipo de interés
                        </h4>
                        <div className="space-y-2.5 text-xs text-gray-300 leading-relaxed">
                          <div className="flex gap-2"><span className="text-amber-400 font-bold mt-0.5">1.</span><p><strong className="text-white">Compara entre varios bancos.</strong> No aceptes la primera oferta. Pide ofertas vinculantes en al menos 3-4 bancos y utiliza cada una como palanca de negociación con los demás.</p></div>
                          <div className="flex gap-2"><span className="text-amber-400 font-bold mt-0.5">2.</span><p><strong className="text-white">Contrata un bróker hipotecario.</strong> Son gratuitos para ti (cobra el banco) y tienen acceso a ofertas mayoristas que no se publican. Pueden conseguir diferenciales 0.2-0.5% más bajos.</p></div>
                          <div className="flex gap-2"><span className="text-amber-400 font-bold mt-0.5">3.</span><p><strong className="text-white">Mejora tu perfil financiero.</strong> Un contrato indefinido con antigüedad, ingresos estables, poco endeudamiento y un buen historial crediticio te dan poder de negociación.</p></div>
                          <div className="flex gap-2"><span className="text-amber-400 font-bold mt-0.5">4.</span><p><strong className="text-white">Aporta más capital propio.</strong> Financiar el 70% o menos en vez del 80% mejora significativamente las condiciones, ya que el banco asume menos riesgo.</p></div>
                          <div className="flex gap-2"><span className="text-amber-400 font-bold mt-0.5">5.</span><p><strong className="text-white">Vinculación inteligente.</strong> Domiciliar nómina, seguros y recibos puede rebajar el diferencial entre 0.3% y 1%. Valora si el ahorro compensa el coste de los productos vinculados.</p></div>
                          <div className="flex gap-2"><span className="text-amber-400 font-bold mt-0.5">6.</span><p><strong className="text-white">Elige bien el momento.</strong> El Euribor fluctúa. Si está bajando, una hipoteca variable puede ser ventajosa a corto plazo; si está bajo y estable, fijar el tipo te protege de futuras subidas.</p></div>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between gap-3">
                          <p className="text-[11px] text-amber-400/80 italic">Recuerda: una diferencia de solo 0.5% en el tipo de interés puede suponer miles de euros de ahorro a lo largo de la vida de la hipoteca.</p>
                          <button type="button" onClick={() => setShowTipoInteresTip(false)} className="flex-shrink-0 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 text-amber-300 rounded-lg transition-all duration-300 flex items-center gap-1.5 text-xs font-medium hover:scale-105 active:scale-95">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            <span>Cerrar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={onCalcularCuota} className="mt-4 w-full px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  <span>Calcular cuota de hipoteca</span>
                </button>

                {cuotaMensual > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-500/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Cuota Mensual</h4>
                    <p className="text-3xl font-bold text-teal-400">{cuotaMensual.toLocaleString()}€</p>
                  </div>
                )}

                {(() => {
                  const faltanDatos = !selectedProperty.alquilerMensual || selectedProperty.alquilerMensual <= 0 || capitalPropio <= 0 || plazoHipoteca <= 0 || tipoInteres <= 0;
                  return (
                    <div className="mt-6">
                      <div className="flex justify-end">
                        <button onClick={() => !faltanDatos && setCurrentSection('gastosVivienda')} disabled={faltanDatos} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${faltanDatos ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                          <span>Continuar a Gastos de la Vivienda</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </button>
                      </div>
                      {faltanDatos && <p className="text-xs text-yellow-400 text-right mt-2">Completa todos los campos (alquiler, capital propio, plazo e interés) para continuar</p>}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Panel 3: GASTOS DE LA VIVIENDA */}
            <div className={`transition-all duration-500 ease-in-out ${
              currentSection === 'gastosVivienda'
                ? 'relative translate-x-0 opacity-100'
                : 'absolute top-0 left-0 w-full translate-x-full opacity-0 pointer-events-none'
            }`}>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Gastos de la Vivienda</h3>
                  <button onClick={() => setCurrentSection('hipoteca')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                    <span>Volver a Hipoteca</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Comunidad (€/año)</label>
                    <input type="number" value={selectedProperty.comunidadAnual || ''} onChange={(e) => { setComunidadEstimadaIA(false); setSelectedProperty({ ...selectedProperty, comunidadAnual: parseInt(e.target.value) || null }); }} placeholder="600€" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    {comunidadEstimadaIA && selectedProperty.comunidadAnual && selectedProperty.comunidadAnual > 0 && <p className="mt-2 text-xs text-amber-400/80">Valor estimado por IA. Se recomienda consultar a la inmobiliaria para obtener el dato real.</p>}
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mantenimiento anual (€/año)</label>
                    <input type="number" step="10" min="0" value={selectedProperty.mantenimiento || ''} onChange={(e) => { const val = parseInt(e.target.value) || 0; setSelectedProperty({ ...selectedProperty, mantenimiento: val }); }} placeholder="150€" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <p className="mt-2 text-xs text-gray-400">💡 Por defecto ~0.10% del precio ({Math.round(selectedProperty.precio * 0.001).toLocaleString()}€/año)</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Seguro Hogar anual (€/año)</label>
                    <input type="number" step="5" min="0" value={selectedProperty.seguroHogar || ''} onChange={(e) => { const val = parseInt(e.target.value) || 0; setSelectedProperty({ ...selectedProperty, seguroHogar: val }); }} placeholder="15€" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <p className="mt-2 text-xs text-gray-400">💡 Por defecto ~0.01% del precio ({Math.round(selectedProperty.precio * 0.0001).toLocaleString()}€/año)</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">Seguro Vida Hipoteca (€/año)</label>
                      <button type="button" onClick={() => setShowSeguroVidaInfo(!showSeguroVidaInfo)} className="p-1.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center gap-1 text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">Edad del asegurado</span>
                        <span className="text-sm font-bold text-white bg-slate-600/50 px-2.5 py-0.5 rounded-full">{edadAsegurado} años</span>
                      </div>
                      <input type="range" min="20" max="70" value={edadAsegurado} onChange={(e) => { const edad = parseInt(e.target.value); setEdadAsegurado(edad); const nuevoPorcentaje = calcularPorcentajeSeguroVida(edad); const porcentajeRedondeado = Math.round(nuevoPorcentaje * 100) / 100; setPorcentajeSeguroVida(porcentajeRedondeado); if (selectedProperty) { const importeHip = Math.max(0, calcularCostoTotal() - capitalPropio); const valorCalculado = Math.round(importeHip * (porcentajeRedondeado / 100)); setSelectedProperty({ ...selectedProperty, seguroVidaHipoteca: valorCalculado }); } }} className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-teal-500" />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>20</span><span>30</span><span>40</span><span>50</span><span>60</span><span>70</span></div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-2.5">
                      <div className="flex-1"><span className="text-xs text-gray-400">Tarifa</span><p className="text-lg font-bold text-blue-400">{porcentajeSeguroVida}%</p></div>
                      <div className="w-px h-8 bg-slate-600"></div>
                      <div className="flex-1"><span className="text-xs text-gray-400">Coste anual</span><p className="text-lg font-bold text-white">{selectedProperty.seguroVidaHipoteca?.toLocaleString() || '0'}€/año</p></div>
                    </div>
                    <p className="mt-1.5 text-[10px] text-gray-500">Calculado sobre el importe financiado: {Math.max(0, calcularCostoTotal() - capitalPropio).toLocaleString()}€</p>
                    <div className={`overflow-hidden ${showSeguroVidaInfo ? 'max-h-[300px] opacity-100 mt-3 scale-100' : 'max-h-0 opacity-0 mt-0 scale-[0.97]'}`} style={{ transformOrigin: 'top center', transition: showSeguroVidaInfo ? 'max-height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out, margin 0.5s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'max-height 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-in, margin 0.6s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                      <div className="p-3 bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-blue-900/30 border border-blue-500/30 rounded-xl">
                        <h4 className="text-xs font-bold text-blue-300 mb-2 flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Modelo de estimación</h4>
                        <p className="text-[11px] text-gray-300 leading-relaxed">El modelo empleado constituye una aproximación basada en tarifas medias de mercado, no sustituyendo el cálculo actuarial completo utilizado por las entidades aseguradoras, pero resultando adecuado para simulaciones de rentabilidad inmobiliaria y análisis comparativo de inversiones.</p>
                        <div className="mt-2.5 pt-2 border-t border-blue-500/20 flex justify-end">
                          <button type="button" onClick={() => setShowSeguroVidaInfo(false)} className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 rounded-lg transition-all duration-300 flex items-center gap-1.5 text-xs font-medium hover:scale-105 active:scale-95">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg><span>Cerrar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Seguro Impago anual (€/año)</label>
                    <input type="number" step="5" min="0" value={selectedProperty.seguroImpago || ''} onChange={(e) => { const val = parseInt(e.target.value) || 0; setSelectedProperty({ ...selectedProperty, seguroImpago: val }); const rentaAnual = (selectedProperty.alquilerMensual || 0) * 12; setShowSeguroImpagoWarning(val > 0 && rentaAnual > 0 && (val / rentaAnual) < 0.05); }} placeholder={`${Math.round((selectedProperty.alquilerMensual || 0) * 12 * 0.05)}€`} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    {selectedProperty.alquilerMensual ? (
                      <>
                        <p className="mt-2 text-xs text-gray-400">💡 Por defecto ~5% de la renta anual ({Math.round(selectedProperty.alquilerMensual * 12 * 0.05).toLocaleString()}€/año)</p>
                      </>
                    ) : (
                      <p className="mt-2 text-xs text-yellow-400">⚠️ Primero debes establecer el Alquiler Mensual para calcular el valor recomendado</p>
                    )}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showSeguroImpagoWarning ? 'max-h-12 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-900/20 border border-red-500/30 rounded">
                        <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-[10px] text-red-300 leading-tight">⚠️ Muy recomendado contratar seguro de impago (mínimo ~{Math.round((selectedProperty.alquilerMensual || 0) * 12 * 0.05).toLocaleString()}€)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-1">IBI anual (% del precio)</label>
                    <p className="text-[10px] text-gray-500 mb-2">Detectado automáticamente desde la dirección. Puedes cambiarlo.</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {([
                        { key: 'pueblo' as const, label: 'Pueblo', pct: 0.20 },
                        { key: 'ciudad_media' as const, label: 'Ciudad media', pct: 0.30 },
                        { key: 'gran_ciudad' as const, label: 'Gran ciudad', pct: 0.35 },
                        { key: 'capital' as const, label: 'Capital cara', pct: 0.40 },
                      ]).map(({ key, label, pct }) => (
                        <button key={key} type="button" onClick={() => { setTipoMunicipioIBI(key); setPorcentajeIBI(pct); const valorCalculado = Math.round(selectedProperty.precio * (pct / 100)); setSelectedProperty({ ...selectedProperty, ibi: valorCalculado }); }} className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${tipoMunicipioIBI === key ? 'bg-teal-500/30 border border-teal-500/60 text-teal-300' : 'bg-slate-700/50 border border-slate-600 text-gray-400 hover:bg-slate-700 hover:text-gray-300'}`}>{label} ({pct}%)</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-2.5">
                      <div className="flex-1"><span className="text-xs text-gray-400">Tarifa</span><p className="text-lg font-bold text-teal-400">{porcentajeIBI}%</p></div>
                      <div className="w-px h-8 bg-slate-600"></div>
                      <div className="flex-1"><span className="text-xs text-gray-400">IBI anual</span><p className="text-lg font-bold text-white">{selectedProperty.ibi?.toLocaleString() || '0'}€/año</p></div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Periodos Vacantes anual (% del precio)</label>
                    <input type="number" step="0.01" min="0" max="100" value={porcentajePeriodosVacantes === 0 ? '' : porcentajePeriodosVacantes} onChange={(e) => { const inputValue = e.target.value; if (inputValue === '') { setPorcentajePeriodosVacantes(0); setSelectedProperty({ ...selectedProperty, periodosVacantes: 0 }); } else { const porcentaje = parseFloat(inputValue); setPorcentajePeriodosVacantes(porcentaje); const valorCalculado = Math.round(selectedProperty.precio * (porcentaje / 100)); setSelectedProperty({ ...selectedProperty, periodosVacantes: valorCalculado }); } }} placeholder="0.03%" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <p className="mt-2 text-xs text-gray-400">💡 Valor anual: {selectedProperty.periodosVacantes?.toLocaleString() || '0'}€/año ({porcentajePeriodosVacantes}% del precio)</p>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-2">Total Gastos Anuales</h4>
                  <p className="text-3xl font-bold text-orange-400">
                    {((selectedProperty.comunidadAnual || 0) + (selectedProperty.mantenimiento || 0) + (selectedProperty.seguroHogar || 0) + (selectedProperty.seguroVidaHipoteca || 0) + (selectedProperty.seguroImpago || 0) + (selectedProperty.ibi || 0) + (selectedProperty.periodosVacantes || 0)).toLocaleString()}€/año
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Equivalente mensual: {Math.round(((selectedProperty.comunidadAnual || 0) + (selectedProperty.mantenimiento || 0) + (selectedProperty.seguroHogar || 0) + (selectedProperty.seguroVidaHipoteca || 0) + (selectedProperty.seguroImpago || 0) + (selectedProperty.ibi || 0) + (selectedProperty.periodosVacantes || 0)) / 12).toLocaleString()}€/mes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
            <button onClick={onSaveDetails} disabled={loading} className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={() => setShowDuplicateConfirm(true)}
              disabled={duplicating || duplicateSuccess}
              className="px-6 py-3 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Duplicar
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting || deleteSuccess}
              className="px-6 py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
            <button onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Overlay de confirmación de duplicado */}
      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center transition-all duration-300 ${
          showDuplicateConfirm ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => { if (!duplicating) setShowDuplicateConfirm(false); }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className={`relative bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-900/30 border border-indigo-500/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-indigo-500/10 transition-all duration-500 ${
            showDuplicateConfirm ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Estado: Éxito */}
          {duplicateSuccess ? (
            <div className="flex flex-col items-center text-center">
              {/* Animación de check */}
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-[bounceIn_0.5s_ease-out]">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeDasharray: 30, strokeDashoffset: 0, animation: 'draw 0.6s ease-out forwards' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Propiedad duplicada</h3>
              <p className="text-gray-400 text-sm mb-6">La copia se ha creado correctamente</p>
              <button
                onClick={() => { setShowDuplicateConfirm(false); setDuplicateSuccess(false); onClose(); }}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
              >
                Perfecto
              </button>
            </div>
          ) : duplicating ? (
            /* Estado: Duplicando */
            <div className="flex flex-col items-center text-center py-4">
              {/* Animación de duplicación: dos tarjetas */}
              <div className="relative w-32 h-24 mb-6">
                {/* Tarjeta original */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 bg-slate-700 border border-slate-500 rounded-lg shadow-lg flex items-center justify-center animate-[slideLeft_0.8s_ease-out_forwards]">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                {/* Tarjeta duplicada */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 bg-indigo-900/60 border border-indigo-400/50 rounded-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center animate-[slideRight_0.8s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                {/* Partículas */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0"
                      style={{
                        animation: `particle 1s ease-out ${0.5 + i * 0.08}s forwards`,
                        transform: `rotate(${deg}deg) translateY(0px)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Duplicando propiedad...</h3>
              <p className="text-gray-400 text-sm">Creando una copia exacta</p>
            </div>
          ) : (
            /* Estado: Confirmación */
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Duplicar propiedad</h3>
                  <p className="text-sm text-gray-400">Se creará una copia con todos los datos</p>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-300">
                  Se va a duplicar <span className="text-indigo-400 font-semibold">{selectedProperty.nombre}</span> con todos sus datos de adquisición, hipoteca y gastos de vivienda.
                </p>
                <p className="text-xs text-gray-500 mt-2">La copia se creará con el nombre &quot;{selectedProperty.nombre} (copia)&quot;</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setDuplicating(true);
                    await new Promise(r => setTimeout(r, 1200));
                    await onDuplicateProperty();
                    setDuplicating(false);
                    setDuplicateSuccess(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Confirmar duplicado
                </button>
                <button
                  onClick={() => setShowDuplicateConfirm(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay de confirmación de eliminación */}
      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center transition-all duration-300 ${
          showDeleteConfirm ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => { if (!deleting) setShowDeleteConfirm(false); }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className={`relative bg-gradient-to-br from-slate-800 via-slate-800 to-red-900/20 border border-red-500/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-500/10 transition-all duration-500 ${
            showDeleteConfirm ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Estado: Éxito */}
          {deleteSuccess ? (
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-[bounceIn_0.5s_ease-out]">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeDasharray: 30, strokeDashoffset: 0, animation: 'draw 0.6s ease-out forwards' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Propiedad eliminada</h3>
              <p className="text-gray-400 text-sm mb-6">Se ha eliminado correctamente</p>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteSuccess(false); onClose(); }}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
              >
                Cerrar
              </button>
            </div>
          ) : deleting ? (
            /* Estado: Eliminando */
            <div className="flex flex-col items-center text-center py-4">
              <div className="relative w-28 h-24 mb-6">
                {/* Tarjeta que se desintegra */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 bg-slate-700 border border-red-500/40 rounded-lg shadow-lg flex items-center justify-center animate-[shrinkAway_1s_ease-in_forwards]">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                {/* Partículas rojas que se dispersan */}
                {[
                  { x: 35, y: 0 }, { x: 25, y: 25 }, { x: 0, y: 35 }, { x: -25, y: 25 },
                  { x: -35, y: 0 }, { x: -25, y: -25 }, { x: 0, y: -35 }, { x: 25, y: -25 },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                    style={{
                      background: i % 2 === 0 ? '#ef4444' : '#f97316',
                      animation: `explode-${i} 0.9s ease-out ${0.4 + i * 0.05}s forwards`,
                      opacity: 0,
                      ['--tx' as string]: `${pos.x}px`,
                      ['--ty' as string]: `${pos.y}px`,
                    }}
                  />
                ))}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Eliminando propiedad...</h3>
              <p className="text-gray-400 text-sm">Borrando todos los datos</p>
            </div>
          ) : (
            /* Estado: Confirmación */
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Eliminar propiedad</h3>
                  <p className="text-sm text-red-400/80">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-300">
                  Se va a eliminar <span className="text-red-400 font-semibold">{selectedProperty.nombre}</span> permanentemente, incluyendo todos sus datos de adquisición, hipoteca y gastos.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setDeleting(true);
                    await new Promise(r => setTimeout(r, 1100));
                    onDeleteProperty(selectedProperty.id!);
                    setDeleting(false);
                    setDeleteSuccess(true);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideLeft {
          from { transform: translate(-50%, -50%) translateX(0); }
          to { transform: translate(-50%, -50%) translateX(-14px); }
        }
        @keyframes slideRight {
          from { transform: translate(-50%, -50%) translateX(0); opacity: 0; }
          to { transform: translate(-50%, -50%) translateX(14px); opacity: 1; }
        }
        @keyframes particle {
          0% { opacity: 1; transform: rotate(var(--deg)) translateY(0px) scale(1); }
          100% { opacity: 0; transform: rotate(var(--deg)) translateY(-30px) scale(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes draw {
          from { stroke-dashoffset: 30; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes shrinkAway {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
          40% { transform: translate(-50%, -50%) scale(1.05) rotate(-2deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0) rotate(8deg); opacity: 0; }
        }
        @keyframes explode-0 { 0% { transform: translate(-50%,-50%) scale(1); opacity:1; } 100% { transform: translate(calc(-50% + 35px), -50%) scale(0); opacity:0; } }
        @keyframes explode-1 { 0% { transform: translate(-50%,-50%) scale(1); opacity:1; } 100% { transform: translate(calc(-50% + 25px), calc(-50% + 25px)) scale(0); opacity:0; } }
        @keyframes explode-2 { 0% { transform: translate(-50%,-50%) scale(1); opacity:1; } 100% { transform: translate(-50%, calc(-50% + 35px)) scale(0); opacity:0; } }
        @keyframes explode-3 { 0% { transform: translate(-50%,-50%) scale(1); opacity:1; } 100% { transform: translate(calc(-50% - 25px), calc(-50% + 25px)) scale(0); opacity:0; } }
        @keyframes explode-4 { 0% { transform: translate(-50%,-50%) scale(1); opacity:1; } 100% { transform: translate(calc(-50% - 35px), -50%) scale(0); opacity:0; } }
        @keyframes explode-5 { 0% { transform: translate(-50%,-50%) scale(1); opacity:1; } 100% { transform: translate(calc(-50% - 25px), calc(-50% - 25px)) scale(0); opacity:0; } }
        @keyframes explode-6 { 0% { transform: translate(-50%,-50%) scale(1); opacity:1; } 100% { transform: translate(-50%, calc(-50% - 35px)) scale(0); opacity:0; } }
        @keyframes explode-7 { 0% { transform: translate(-50%,-50%) scale(1); opacity:1; } 100% { transform: translate(calc(-50% + 25px), calc(-50% - 25px)) scale(0); opacity:0; } }
      `}</style>
    </div>
  );
}
