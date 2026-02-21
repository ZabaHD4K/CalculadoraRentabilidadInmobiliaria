"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TRAMOS_IRPF, TramoIRPF } from '@/services/api';

interface ExpenseEditorProps {
  mostrarEditarGastos: boolean;
  setMostrarEditarGastos: (show: boolean) => void;
  comunidadAnual: number;
  setComunidadAnual: (val: number) => void;
  mantenimiento: number;
  setMantenimiento: (val: number) => void;
  seguroHogar: number;
  setSeguroHogar: (val: number) => void;
  seguroImpago: number;
  setSeguroImpago: (val: number) => void;
  porcentajeIBI: number;
  setPorcentajeIBI: (val: number) => void;
  periodosVacantesPct: number;
  setPeriodosVacantesPct: (val: number) => void;
  porcentajeSeguroVida: number;
  setPorcentajeSeguroVida: (val: number) => void;
  edadAsegurado: number;
  setEdadAsegurado: (edad: number) => void;
  tipoMunicipioIBI: 'pueblo' | 'ciudad_media' | 'gran_ciudad' | 'capital';
  setTipoMunicipioIBI: (val: 'pueblo' | 'ciudad_media' | 'gran_ciudad' | 'capital') => void;
  precioInmueble: number;
  rentaAnual: number;
  periodosVacantes: number;
  ibi: number;
  seguroVidaHipoteca: number;
  importeFinanciado: number;
  gastosAnuales: number;
  datosGastos: Array<{ name: string; value: number; color: string }>;
  calcularPorcentajeSeguroVida: (edad: number) => number;
  tramoIRPF: TramoIRPF;
  setTramoIRPF: (val: TramoIRPF) => void;
  irpf: number;
}

export default function ExpenseEditor({
  mostrarEditarGastos,
  setMostrarEditarGastos,
  comunidadAnual,
  setComunidadAnual,
  mantenimiento,
  setMantenimiento,
  seguroHogar,
  setSeguroHogar,
  seguroImpago,
  setSeguroImpago,
  porcentajeIBI,
  setPorcentajeIBI,
  periodosVacantesPct,
  setPeriodosVacantesPct,
  porcentajeSeguroVida,
  setPorcentajeSeguroVida,
  edadAsegurado,
  setEdadAsegurado,
  tipoMunicipioIBI,
  setTipoMunicipioIBI,
  precioInmueble,
  rentaAnual,
  periodosVacantes,
  ibi,
  seguroVidaHipoteca,
  importeFinanciado,
  gastosAnuales,
  datosGastos,
  calcularPorcentajeSeguroVida,
  tramoIRPF,
  setTramoIRPF,
  irpf,
}: ExpenseEditorProps) {
  // Calcular % equivalente para referencia visual
  const mantenimientoPctRef = precioInmueble > 0 ? (mantenimiento / precioInmueble) * 100 : 0;
  const seguroHogarPctRef = precioInmueble > 0 ? (seguroHogar / precioInmueble) * 100 : 0;
  const seguroImpagoPctRef = rentaAnual > 0 ? (seguroImpago / rentaAnual) * 100 : 0;

  // Rangos máximos en € (basados en los antiguos % máximos)
  const maxMantenimiento = Math.max(Math.round(precioInmueble * 0.01), 2000); // ~1% del precio
  const maxSeguroHogar = Math.max(Math.round(precioInmueble * 0.001), 500);   // ~0.1% del precio
  const maxSeguroImpago = Math.max(Math.round(rentaAnual * 0.10), 1000);       // ~10% de renta

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Distribución de Gastos Anuales</h3>
        <button
          onClick={() => setMostrarEditarGastos(!mostrarEditarGastos)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-lg font-semibold transition-all shadow-lg text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {mostrarEditarGastos ? 'Cerrar' : 'Editar Gastos'}
        </button>
      </div>

      {/* Desplegable animado para editar gastos */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          mostrarEditarGastos ? 'max-h-[900px] opacity-100 mb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-900/50 rounded-lg p-6 border border-teal-500/30">
          <h4 className="text-lg font-bold text-teal-400 mb-4">Ajustar Gastos Anuales</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comunidad Anual */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Comunidad Anual: <span className="text-teal-400 font-bold">{comunidadAnual.toLocaleString('es-ES')}€</span>
              </label>
              <span className="text-xs text-gray-400">Promedio: ~100€/mes (1.200€/año)</span>
              <input
                type="range"
                min={0}
                max={3000}
                step={50}
                value={comunidadAnual}
                onChange={(e) => setComunidadAnual(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-teal-500 mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0€</span>
                <span>3.000€</span>
              </div>
            </div>

            {/* Mantenimiento (€ directo) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Mantenimiento anual: <span className="text-teal-400 font-bold">{Math.round(mantenimiento).toLocaleString('es-ES')}€</span>
                <span className="text-gray-400 text-xs ml-2">({mantenimientoPctRef.toFixed(2)}% del precio)</span>
              </label>
              <span className="text-xs text-gray-400">Por defecto ~0.10% del precio del inmueble</span>
              <input
                type="range"
                min={0}
                max={maxMantenimiento}
                step={10}
                value={mantenimiento}
                onChange={(e) => setMantenimiento(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-teal-500 mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0€</span>
                <span>{maxMantenimiento.toLocaleString('es-ES')}€</span>
              </div>
            </div>

            {/* Seguro Hogar (€ directo) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Seguro Hogar anual: <span className="text-teal-400 font-bold">{Math.round(seguroHogar).toLocaleString('es-ES')}€</span>
                <span className="text-gray-400 text-xs ml-2">({seguroHogarPctRef.toFixed(2)}% del precio)</span>
              </label>
              <span className="text-xs text-gray-400">Por defecto ~0.01% del precio del inmueble</span>
              <input
                type="range"
                min={0}
                max={maxSeguroHogar}
                step={5}
                value={seguroHogar}
                onChange={(e) => setSeguroHogar(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-teal-500 mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0€</span>
                <span>{maxSeguroHogar.toLocaleString('es-ES')}€</span>
              </div>
            </div>

            {/* Seguro Impago (€ directo) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Seguro Impago anual: <span className="text-teal-400 font-bold">{Math.round(seguroImpago).toLocaleString('es-ES')}€</span>
                <span className="text-gray-400 text-xs ml-2">({seguroImpagoPctRef.toFixed(1)}% de renta)</span>
              </label>
              <span className="text-xs text-gray-400">Por defecto ~5% de la renta anual</span>
              {seguroImpago === 0 && (
                <div className="mb-2 p-2 bg-red-900/30 border border-red-500/50 rounded mt-1">
                  <p className="text-xs text-red-400 font-semibold">
                    Debido a la situacion actual, es MUY RECOMENDABLE tener seguro de impago
                  </p>
                </div>
              )}
              <input
                type="range"
                min={0}
                max={maxSeguroImpago}
                step={5}
                value={seguroImpago}
                onChange={(e) => setSeguroImpago(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-teal-500 mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0€</span>
                <span>{maxSeguroImpago.toLocaleString('es-ES')}€</span>
              </div>
            </div>

            {/* IBI (% del precio según municipio) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                IBI: <span className="text-teal-400 font-bold">{porcentajeIBI.toFixed(2)}%</span>
                <span className="text-gray-400 text-xs ml-2">({Math.round(ibi).toLocaleString('es-ES')}€)</span>
              </label>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {[
                  { tipo: 'pueblo' as const, label: 'Pueblo', pct: 0.20 },
                  { tipo: 'ciudad_media' as const, label: 'Ciudad media', pct: 0.30 },
                  { tipo: 'gran_ciudad' as const, label: 'Gran ciudad', pct: 0.35 },
                  { tipo: 'capital' as const, label: 'Capital cara', pct: 0.40 },
                ].map(({ tipo, label, pct }) => (
                  <button
                    key={tipo}
                    onClick={() => { setTipoMunicipioIBI(tipo); setPorcentajeIBI(pct); }}
                    className={`px-1 py-1.5 rounded text-[10px] font-semibold transition-all ${
                      tipoMunicipioIBI === tipo
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">% del precio del inmueble</span>
            </div>

            {/* Periodos Vacantes (% del precio) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Periodos Vacantes: <span className="text-teal-400 font-bold">{periodosVacantesPct.toFixed(2)}%</span>
                <span className="text-gray-400 text-xs ml-2">({Math.round(periodosVacantes).toLocaleString('es-ES')}€)</span>
              </label>
              <span className="text-xs text-gray-400">% del precio del inmueble</span>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.01}
                value={periodosVacantesPct}
                onChange={(e) => setPeriodosVacantesPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-teal-500 mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0% del precio</span>
                <span>0.5% del precio</span>
              </div>
            </div>

            {/* Seguro de Vida Hipoteca (basado en edad) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Seguro de Vida: <span className="text-teal-400 font-bold">{porcentajeSeguroVida.toFixed(2)}%</span>
                <span className="text-gray-400 text-xs ml-2">({seguroVidaHipoteca.toLocaleString('es-ES')}€)</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Edad del asegurado</span>
                    <span className="text-sm font-bold text-white bg-slate-600/50 px-2 py-0.5 rounded-full">{edadAsegurado} años</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={70}
                    value={edadAsegurado}
                    onChange={(e) => {
                      const edad = parseInt(e.target.value);
                      setEdadAsegurado(edad);
                      const nuevoPct = calcularPorcentajeSeguroVida(edad);
                      setPorcentajeSeguroVida(Math.round(nuevoPct * 100) / 100);
                    }}
                    className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>20</span><span>30</span><span>40</span><span>50</span><span>60</span><span>70</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Calculado sobre el importe financiado: {importeFinanciado.toLocaleString('es-ES')}€</p>
            </div>
            {/* IRPF - Tramo del contribuyente */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                IRPF (Tramo marginal): <span className="text-teal-400 font-bold">{TRAMOS_IRPF.find(t => t.id === tramoIRPF)?.tipo ?? 30}%</span>
                <span className="text-gray-400 text-xs ml-2">({irpf.toLocaleString('es-ES')}€/año)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TRAMOS_IRPF.map((tramo) => (
                  <button
                    key={tramo.id}
                    onClick={() => setTramoIRPF(tramo.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      tramoIRPF === tramo.id
                        ? 'bg-teal-600 text-white ring-2 ring-teal-400'
                        : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }`}
                  >
                    <div>{tramo.rango}</div>
                    <div className="text-[10px] mt-0.5 opacity-75">{tramo.tipo}%</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                El IRPF grava el rendimiento neto del alquiler (ingresos menos gastos deducibles).
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              ⚠️ <strong>Valores aproximados:</strong> La Comunidad Anual y el IBI son estimaciones. Para datos exactos, consulta con la inmobiliaria o el propietario actual.
            </p>
          </div>
          <div className="mt-2 p-3 bg-teal-900/20 border border-teal-500/30 rounded-lg">
            <p className="text-sm text-teal-300">
              📊 Total gastos anuales: <strong>{gastosAnuales.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</strong>
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={datosGastos}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {datosGastos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            formatter={(value: any) => `${value.toLocaleString('es-ES')}€`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
