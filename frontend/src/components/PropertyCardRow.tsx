"use client";

import { useState } from "react";
import { PropertyData } from "@/services/api";

interface ROIData {
  value: number | null;
  status: 'pending' | 'calculated';
}

interface PropertyCardRowProps {
  property: PropertyData;
  calculateROI: (property: PropertyData) => ROIData;
  onOpenDetails: (property: PropertyData) => void;
  onDelete: (id: string) => void;
}

export default function PropertyCardRow({ property, calculateROI, onOpenDetails, onDelete }: PropertyCardRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const roiData = calculateROI(property);

  const roiStyle = roiData.status === 'pending'
    ? { bar: 'bg-gray-600', text: 'text-gray-400', label: '—', bg: 'bg-gray-800/40' }
    : roiData.value! < 5
    ? { bar: 'bg-red-500', text: 'text-red-400', label: `${roiData.value!.toFixed(1)}%`, bg: 'bg-red-950/20' }
    : roiData.value! < 10
    ? { bar: 'bg-green-500', text: 'text-green-400', label: `${roiData.value!.toFixed(1)}%`, bg: 'bg-green-950/20' }
    : roiData.value! < 15
    ? { bar: 'bg-emerald-400', text: 'text-emerald-400', label: `${roiData.value!.toFixed(1)}%`, bg: 'bg-emerald-950/20' }
    : { bar: 'bg-cyan-400', text: 'text-cyan-300', label: `${roiData.value!.toFixed(1)}%`, bg: 'bg-cyan-950/20' };

  return (
    <>
      <div className="group relative flex items-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-teal-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200">
        {/* Barra lateral ROI */}
        <div className={`w-1 self-stretch flex-shrink-0 ${roiStyle.bar} transition-all`} />

        {/* Icono edificio */}
        <div
          onClick={() => onOpenDetails(property)}
          className="flex-shrink-0 ml-4 w-10 h-10 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-center justify-center cursor-pointer"
        >
          <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        {/* Nombre + dirección + badges */}
        <div
          onClick={() => onOpenDetails(property)}
          className="flex-1 min-w-0 ml-4 py-3.5 cursor-pointer"
        >
          <h3 className="text-sm font-bold text-white truncate leading-snug">{property.nombre}</h3>
          <p className="text-gray-400 text-xs truncate mt-0.5">{property.direccion}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {property.pisoOcupado && (
              <span className="px-1.5 py-0.5 bg-orange-900/30 border border-orange-500/30 text-orange-400 text-[10px] rounded-full">Ocupado</span>
            )}
            {property.pisoAlquilado && (
              <span className="px-1.5 py-0.5 bg-blue-900/30 border border-blue-500/30 text-blue-400 text-[10px] rounded-full">Alquilado</span>
            )}
            {!property.pisoOcupado && !property.pisoAlquilado && (
              <span className="px-1.5 py-0.5 bg-green-900/30 border border-green-500/30 text-green-400 text-[10px] rounded-full">{property.estado}</span>
            )}
            <span className="px-1.5 py-0.5 bg-slate-700/50 border border-slate-600/30 text-slate-400 text-[10px] rounded-full">
              {property.superficie}m² · {property.habitaciones}h · {property.banos}b
            </span>
          </div>
        </div>

        {/* Stats: Precio | Alquiler | ROI */}
        <div
          onClick={() => onOpenDetails(property)}
          className="hidden sm:flex items-center gap-6 px-6 cursor-pointer flex-shrink-0"
        >
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Precio</p>
            <p className="text-sm font-bold text-teal-400">{property.precio.toLocaleString('es-ES')}€</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Alquiler</p>
            <p className="text-sm font-bold text-purple-400">
              {property.alquilerMensual ? `${property.alquilerMensual}€/mes` : <span className="text-gray-600">—</span>}
            </p>
          </div>
          <div className={`text-right min-w-[58px] px-2 py-1 rounded-lg ${roiStyle.bg}`}>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">ROI</p>
            <p className={`text-sm font-bold ${roiStyle.text}`}>{roiStyle.label}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 pr-4 flex-shrink-0">
          <button
            onClick={() => onOpenDetails(property)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-teal-600/10 hover:bg-teal-600/30 border border-teal-500/20 hover:border-teal-500/50 text-teal-400 text-xs font-medium rounded-lg transition-all duration-200"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Ver detalles
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]"
          onClick={() => { if (!deleting) setShowDeleteConfirm(false); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-gradient-to-br from-slate-800 via-slate-800 to-red-900/20 border border-red-500/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-500/10 animate-[popIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {deleteSuccess ? (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/30">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Propiedad eliminada</h3>
                <p className="text-gray-400 text-sm mb-6">Se ha eliminado correctamente</p>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteSuccess(false); }}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
                >
                  Cerrar
                </button>
              </div>
            ) : (
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
                    Se va a eliminar <span className="text-red-400 font-semibold">{property.nombre}</span> permanentemente, incluyendo todos sus datos.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      await new Promise(r => setTimeout(r, 900));
                      onDelete(property.id || '');
                      setDeleting(false);
                      setDeleteSuccess(true);
                    }}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {deleting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Eliminando...</span></>
                    ) : (
                      'Sí, eliminar'
                    )}
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
      )}
    </>
  );
}
