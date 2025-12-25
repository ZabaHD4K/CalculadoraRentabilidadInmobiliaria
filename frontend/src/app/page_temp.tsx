"use client";

import { useState } from "react";

export default function PageTemp() {
  // Estado para la propiedad seleccionada
  const [selectedProperty, setSelectedProperty] = useState<{
    precio?: number;
    itp?: number;
    iva?: number;
    notariaCompra?: number;
    registroCompra?: number;
    reforma?: number;
    comisionAgencia?: number;
    gestoriaHipoteca?: number;
    tasacion?: number;
    comisionApertura?: number;
  } | null>(null);

  // Estado para la sección visible
  const [currentSection, setCurrentSection] = useState<'gastos' | 'hipoteca'>('gastos');

  return (
    <div className="p-6 space-y-6">
      {/* Precio de Entrada Total */}
      <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-500/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-2">Precio entrada total</h3>
        {selectedProperty ? (
          <p className="text-4xl font-bold text-teal-400">
            {(
              (selectedProperty.precio || 0) +
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
        ) : (
          <p className="text-gray-500">Selecciona una propiedad</p>
        )}
      </div>

      {/* Contenedor con animación de deslizamiento */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: currentSection === 'gastos' ? 'translateX(0%)' : 'translateX(-100%)' }}
        >
          {/* Panel 1: Sección GASTOS */}
          <div className="min-w-full flex-shrink-0 space-y-6">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">Vivienda</h3>
              {/* AQUÍ VA TODO EL CONTENIDO DE VIVIENDA */}
            </div>

            <div className="flex justify-end">
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

          {/* Panel 2: Sección HIPOTECA */}
          <div className="min-w-full flex-shrink-0 space-y-6">
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
                  <span>Volver a Gastos</span>
                </button>
              </div>
              {/* AQUÍ VA TODO EL CONTENIDO DE HIPOTECA */}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 pt-4 border-t border-slate-700">
        {/* BOTONES */}
      </div>
    </div>
  );
}
