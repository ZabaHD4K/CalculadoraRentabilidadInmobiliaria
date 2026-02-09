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
  return (
    <div
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:border-teal-500/50 relative"
    >
      {/* Botón eliminar - arriba a la derecha */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
            onDelete(property.id || '');
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
        onClick={() => onOpenDetails(property)}
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
        onClick={() => onOpenDetails(property)}
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
  );
}
