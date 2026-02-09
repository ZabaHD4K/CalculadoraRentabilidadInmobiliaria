interface FinancingScenario {
  inversion: number;
  cashFlowAnual: number;
  roi: number;
  rentabilidadNeta: number;
}

interface FinancingComparisonProps {
  comparativa: {
    conFinanciacion: FinancingScenario;
    sinFinanciacion: FinancingScenario;
  };
  roi: number;
}

export default function FinancingComparison({ comparativa, roi }: FinancingComparisonProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Comparativa: Con vs Sin Financiación</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Con Financiación */}
        <div className="bg-gradient-to-br from-teal-900/30 to-teal-800/30 border border-teal-500/50 rounded-lg p-6">
          <h4 className="text-lg font-bold text-teal-400 mb-4">Con Financiación (Apalancamiento)</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Inversión inicial:</span>
              <span className="text-white font-semibold">{comparativa.conFinanciacion.inversion.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Cash Flow anual:</span>
              <span className={`font-semibold ${comparativa.conFinanciacion.cashFlowAnual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {comparativa.conFinanciacion.cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">ROI:</span>
              <span className="text-teal-400 font-semibold">{comparativa.conFinanciacion.roi.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Rentabilidad Neta:</span>
              <span className="text-teal-400 font-semibold">{comparativa.conFinanciacion.rentabilidadNeta.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Sin Financiación */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-500/50 rounded-lg p-6">
          <h4 className="text-lg font-bold text-purple-400 mb-4">Sin Financiación (Contado)</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Inversión inicial:</span>
              <span className="text-white font-semibold">{comparativa.sinFinanciacion.inversion.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Cash Flow anual:</span>
              <span className="text-green-400 font-semibold">{comparativa.sinFinanciacion.cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">ROI:</span>
              <span className="text-purple-400 font-semibold">{comparativa.sinFinanciacion.roi.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Rentabilidad Neta:</span>
              <span className="text-purple-400 font-semibold">{comparativa.sinFinanciacion.rentabilidadNeta.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-300">
          📊 <strong>Efecto del apalancamiento:</strong>
          {roi > comparativa.sinFinanciacion.roi
            ? ` La financiación mejora tu ROI en ${(roi - comparativa.sinFinanciacion.roi).toFixed(2)}% puntos porcentuales`
            : ` Pagar al contado es más rentable en ${(comparativa.sinFinanciacion.roi - roi).toFixed(2)}% puntos`
          }
        </p>
      </div>
    </div>
  );
}
