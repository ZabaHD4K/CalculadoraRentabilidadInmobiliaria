import { PropertyData } from "@/services/api";

interface SimulationSlidersProps {
  capitalPropio: number;
  plazoHipoteca: number;
  tipoInteres: number;
  precioInmueble: number;
  precioTotal: number;
  gastosAdquisicion: number;
  alquilerMensualSimulado: number;
  incrementoAlquiler: number;
  property: PropertyData;
  onCapitalPropioChange: (val: number) => void;
  onPlazoChange: (val: number) => void;
  onTipoInteresChange: (val: number) => void;
  onPrecioInmuebleChange: (val: number) => void;
  onAlquilerChange: (val: number) => void;
  onIncrementoAlquilerChange: (val: number) => void;
}

export default function SimulationSliders({
  capitalPropio,
  plazoHipoteca,
  tipoInteres,
  precioInmueble,
  precioTotal,
  gastosAdquisicion,
  alquilerMensualSimulado,
  incrementoAlquiler,
  property,
  onCapitalPropioChange,
  onPlazoChange,
  onTipoInteresChange,
  onPrecioInmuebleChange,
  onAlquilerChange,
  onIncrementoAlquilerChange,
}: SimulationSlidersProps) {
  return (
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
            <span className="text-gray-400 text-xs ml-2">({((capitalPropio / precioTotal) * 100).toFixed(0)}%)</span>
          </label>
          <input
            type="range"
            min={precioTotal * 0.1}
            max={precioTotal}
            step={1000}
            value={capitalPropio}
            onChange={(e) => onCapitalPropioChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
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
            onChange={(e) => onPlazoChange(Number(e.target.value))}
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
            onChange={(e) => onTipoInteresChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1%</span>
            <span>8%</span>
          </div>
        </div>

        {/* Precio del Inmueble */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Precio Inmueble (Negociable): <span className="text-orange-400 font-bold">{precioInmueble.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
          </label>
          <input
            type="range"
            min={property.precio * 0.8}
            max={property.precio * 1.2}
            step={1000}
            value={precioInmueble}
            onChange={(e) => onPrecioInmuebleChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{(property.precio * 0.8).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            <span>{(property.precio * 1.2).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Precio total: {precioTotal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ (Inmueble + {gastosAdquisicion.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€ costes de adquisición)
          </p>
        </div>

        {/* Precio de Alquiler */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Precio Alquiler Mensual: <span className="text-green-400 font-bold">{alquilerMensualSimulado.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
          </label>
          <input
            type="range"
            min={Math.max(100, (property.alquilerMensual || 500) * 0.5)}
            max={(property.alquilerMensual || 500) * 1.5}
            step={10}
            value={alquilerMensualSimulado}
            onChange={(e) => onAlquilerChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Math.max(100, (property.alquilerMensual || 500) * 0.5).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            <span>{((property.alquilerMensual || 500) * 1.5).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Anual: {(alquilerMensualSimulado * 12).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
          </p>
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
            onChange={(e) => onIncrementoAlquilerChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>10%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 Ajusta los sliders para simular diferentes escenarios y ver cómo afectan a la rentabilidad de tu inversión
        </p>
      </div>
    </div>
  );
}
