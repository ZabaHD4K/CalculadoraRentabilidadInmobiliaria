"use client";

import { useState } from "react";
import { PropertyData } from "@/services/api";

interface ROIData {
  value: number | null;
  status: 'pending' | 'calculated';
}

interface PropertyCardProps {
  property: PropertyData;
  calculateROI: (property: PropertyData) => ROIData;
  onOpenDetails: (property: PropertyData) => void;
  onDelete: (id: string) => void;
}

export default function PropertyCard({ property, calculateROI, onOpenDetails, onDelete }: PropertyCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  return (
    <>
      <div
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:border-teal-500/50 relative"
      >
        {/* Botón eliminar - arriba a la derecha */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all shadow-lg hover:shadow-xl"
          title="Eliminar propiedad"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Área visual con gradiente dinámico e icono */}
        <div
          onClick={() => onOpenDetails(property)}
          className="cursor-pointer relative"
        >
          {/* Gradiente dinámico basado en ROI + Icono grande */}
          <div className={`h-36 flex items-center justify-center relative overflow-hidden ${
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
            <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>

            {/* Badge ROI - Arriba izquierda */}
            {(() => {
              const roiData = calculateROI(property);
              if (roiData.status === 'pending') {
                return (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-md shadow-lg">
                    <p className="text-gray-400 text-[10px] font-semibold">ROI</p>
                    <p className="text-white text-xs font-bold">Por calcular</p>
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
                <div className={`absolute top-2 left-2 px-2 py-1 backdrop-blur-sm border rounded-md shadow-lg ${bgColor} ${borderColor} ${extraClass}`}>
                  <p className="text-[10px] font-semibold opacity-80">ROI</p>
                  <p className={`text-sm font-bold ${textColor}`}>{roi.toFixed(1)}%</p>
                </div>
              );
            })()}

            {/* Badge Alquiler - Abajo derecha */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-purple-900/90 backdrop-blur-sm border border-purple-500 rounded-md shadow-lg">
              <p className="text-purple-300 text-[10px] font-semibold">Alquiler</p>
              {property.alquilerMensual ? (
                <p className="text-white text-xs font-bold">{property.alquilerMensual}€/mes</p>
              ) : (
                <p className="text-gray-400 text-xs font-bold">Por añadir</p>
              )}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div
          onClick={() => onOpenDetails(property)}
          className="p-4 cursor-pointer"
        >
          <h3 className="text-sm font-bold text-white mb-1 truncate">{property.nombre}</h3>
          <p className="text-gray-400 text-xs mb-2 truncate">{property.direccion}</p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-900/50 rounded-md p-2">
              <p className="text-gray-500 text-[10px] mb-0.5">Precio</p>
              <p className="text-teal-400 text-xs font-bold">{property.precio.toLocaleString()}€</p>
            </div>
            <div className="bg-slate-900/50 rounded-md p-2">
              <p className="text-gray-500 text-[10px] mb-0.5">Superficie</p>
              <p className="text-white text-xs font-semibold">{property.superficie}m²</p>
            </div>
            <div className="bg-slate-900/50 rounded-md p-2">
              <p className="text-gray-500 text-[10px] mb-0.5">Habitaciones</p>
              <p className="text-white text-xs font-semibold">{property.habitaciones}</p>
            </div>
            <div className="bg-slate-900/50 rounded-md p-2">
              <p className="text-gray-500 text-[10px] mb-0.5">Baños</p>
              <p className="text-white text-xs font-semibold">{property.banos}</p>
            </div>
          </div>

          {property.alquilerEstimado && (
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-md p-2 mb-2">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-gray-400 text-[10px]">Alquiler estimado (IA)</p>
                {property.alquilerConfianza && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    property.alquilerConfianza === 'alta' ? 'bg-green-900/50 text-green-400' :
                    property.alquilerConfianza === 'media' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {property.alquilerConfianza}
                  </span>
                )}
              </div>
              <p className="text-purple-400 text-xs font-bold">{property.alquilerEstimado}</p>
            </div>
          )}

          {/* Estado */}
          <div className="flex gap-1.5 mb-1">
            {property.pisoOcupado && (
              <span className="px-1.5 py-0.5 bg-orange-900/30 border border-orange-500/30 text-orange-400 text-[10px] rounded-full">
                Ocupado
              </span>
            )}
            {property.pisoAlquilado && (
              <span className="px-1.5 py-0.5 bg-blue-900/30 border border-blue-500/30 text-blue-400 text-[10px] rounded-full">
                Alquilado{property.alquilerMensual ? ` (${property.alquilerMensual}€/mes)` : ''}
              </span>
            )}
            {!property.pisoOcupado && !property.pisoAlquilado && (
              <span className="px-1.5 py-0.5 bg-green-900/30 border border-green-500/30 text-green-400 text-[10px] rounded-full">
                {property.estado}
              </span>
            )}
          </div>

          {/* Indicador para click */}
          <div className="text-center">
            <span className="text-[10px] text-gray-500">Click para ver detalles</span>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]"
          onClick={() => { if (!deleting) setShowDeleteConfirm(false); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className={`relative bg-gradient-to-br from-slate-800 via-slate-800 to-red-900/20 border border-red-500/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-500/10 transition-all duration-500 ${
              deleteSuccess ? 'scale-100' : deleting ? 'scale-100' : 'scale-100 animate-[popIn_0.3s_ease-out]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {deleteSuccess ? (
              /* Éxito */
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-4">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-[bounceIn_0.5s_ease-out]">
                      <svg className="w-10 h-10 text-white animate-[drawCheck_0.6s_ease-out_forwards]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeDasharray="30" strokeDashoffset="30">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Propiedad eliminada</h3>
                <p className="text-gray-400 text-sm mb-6">Se ha eliminado correctamente</p>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteSuccess(false); }}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  Cerrar
                </button>
              </div>
            ) : deleting ? (
              /* Eliminando */
              <div className="flex flex-col items-center text-center py-4">
                <div className="relative w-28 h-24 mb-6">
                  {/* Tarjeta que se desintegra */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 bg-slate-700 border border-red-500/40 rounded-lg shadow-lg flex items-center justify-center animate-[shrinkAway_1s_ease-in_forwards]">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  {/* Partículas */}
                  {[
                    { x: 30, y: 0 }, { x: 21, y: 21 }, { x: 0, y: 30 }, { x: -21, y: 21 },
                    { x: -30, y: 0 }, { x: -21, y: -21 }, { x: 0, y: -30 }, { x: 21, y: -21 },
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full opacity-0"
                      style={{
                        background: i % 2 === 0 ? '#ef4444' : '#f97316',
                        animation: `pExplode 0.8s ease-out ${0.4 + i * 0.04}s forwards`,
                        ['--px' as string]: `${pos.x}px`,
                        ['--py' as string]: `${pos.y}px`,
                      }}
                    />
                  ))}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Eliminando propiedad...</h3>
                <p className="text-gray-400 text-sm">Borrando todos los datos</p>
              </div>
            ) : (
              /* Confirmación */
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
                      await new Promise(r => setTimeout(r, 1100));
                      onDelete(property.id || '');
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

          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes popIn {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.03); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes bounceIn {
              0% { transform: scale(0); }
              50% { transform: scale(1.15); }
              100% { transform: scale(1); }
            }
            @keyframes drawCheck {
              from { stroke-dashoffset: 30; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes shrinkAway {
              0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
              40% { transform: translate(-50%, -50%) scale(1.05) rotate(-2deg); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(0) rotate(8deg); opacity: 0; }
            }
            @keyframes pExplode {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              100% { transform: translate(calc(-50% + var(--px)), calc(-50% + var(--py))) scale(0); opacity: 0; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
