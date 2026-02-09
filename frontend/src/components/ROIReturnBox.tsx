interface ROIReturnBoxProps {
  capitalPropio: number;
  gananciaTotal: number;
  roi: number;
  cashFlowAnual: number;
  amortizacionAnual: number;
  revalorizacionAnual: number;
  inflacion: number;
}

export default function ROIReturnBox({
  capitalPropio,
  gananciaTotal,
  roi,
  cashFlowAnual,
  amortizacionAnual,
  revalorizacionAnual,
  inflacion,
}: ROIReturnBoxProps) {
  return (
    <div className="mt-6 bg-gradient-to-br from-emerald-900/40 to-green-800/40 border-2 border-emerald-500/60 rounded-xl p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h4 className="text-2xl font-bold text-emerald-300">💰 Retorno del Capital Empleado Anual</h4>
        </div>
        <div className="text-right">
          <p className="text-sm text-emerald-300">Capital Invertido</p>
          <p className="text-xl font-bold text-white">{capitalPropio.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-950/50 rounded-lg p-6 border border-emerald-500/30">
          <p className="text-sm text-emerald-300 mb-2">Retorno Total Anual</p>
          <p className="text-4xl font-bold text-emerald-400 mb-2">
            {gananciaTotal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Cash Flow + Amortización + Revalorización</span>
          </div>
        </div>

        <div className="bg-emerald-950/50 rounded-lg p-6 border border-emerald-500/30">
          <p className="text-sm text-emerald-300 mb-2">ROI (Rentabilidad)</p>
          <p className={`text-4xl font-bold mb-2 ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {roi.toFixed(2)}%
          </p>
          <div className="mt-3 pt-3 border-t border-emerald-500/20">
            <p className="text-xs text-gray-300">Recuperación total:</p>
            <p className="text-lg font-bold text-emerald-300">
              {gananciaTotal > 0 ? (capitalPropio / gananciaTotal).toFixed(1) : '∞'} años
            </p>
          </div>
        </div>

        <div className="bg-emerald-950/50 rounded-lg p-6 border border-emerald-500/30">
          <p className="text-sm text-emerald-300 mb-2">Ganancia Total Anual</p>
          <p className="text-4xl font-bold text-emerald-400 mb-2">
            {gananciaTotal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
          </p>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>💵 Cash Flow:</span>
              <span className="font-semibold">{cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>🏦 Amortización:</span>
              <span className="font-semibold">{amortizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>📈 Revalorización:</span>
              <span className="font-semibold">{revalorizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explicación detallada */}
      <div className="mt-6 bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-emerald-300 mb-3">📊 ¿Qué incluye la Ganancia Total Anual?</h5>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex gap-3">
            <span className="text-emerald-400 font-bold">💵</span>
            <div>
              <strong className="text-emerald-300">Cash Flow ({cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/año):</strong>
              <span className="text-gray-400"> Dinero líquido que entra en tu cuenta cada año después de pagar todos los gastos y la hipoteca.</span>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-400 font-bold">🏦</span>
            <div>
              <strong className="text-blue-300">Amortización ({amortizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/año):</strong>
              <span className="text-gray-400"> Parte de las cuotas hipotecarias que reduce tu deuda y aumenta tu patrimonio (equity) en el inmueble.</span>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 font-bold">📈</span>
            <div>
              <strong className="text-purple-300">Revalorización ({revalorizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/año):</strong>
              <span className="text-gray-400"> Incremento del valor del inmueble anual basado en la tasa de inflación ({inflacion}%).</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-500/20">
            <p className="text-emerald-300 font-semibold">
              💰 Total: {gananciaTotal.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€/año
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Esto representa un retorno del {roi.toFixed(2)}% anual sobre tu capital invertido de {capitalPropio.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
