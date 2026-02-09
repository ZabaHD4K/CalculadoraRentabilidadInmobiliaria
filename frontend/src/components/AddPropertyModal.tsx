"use client";

import React from "react";
import { PropertyData } from "@/services/api";

interface AddPropertyModalProps {
  formData: PropertyData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyData>>;
  idealistaUrl: string;
  setIdealistaUrl: (url: string) => void;
  analyzingUrl: boolean;
  consultingRent: boolean;
  loading: boolean;
  onAnalyzeUrl: () => void;
  onEstimateRent: () => void;
  onSave: () => void;
  onClose: () => void;
}

export default function AddPropertyModal({
  formData,
  setFormData,
  idealistaUrl,
  setIdealistaUrl,
  analyzingUrl,
  consultingRent,
  loading,
  onAnalyzeUrl,
  onEstimateRent,
  onSave,
  onClose,
}: AddPropertyModalProps) {
  return (
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
            onClick={onClose}
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
                onClick={onAnalyzeUrl}
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
                  onClick={onEstimateRent}
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
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={loading || !formData.nombre || !formData.direccion}
              className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
