interface BenefitsCardsProps {
  cashFlowAnual: number;
  capitalPropio: number;
  revalorizacionAnual: number;
  inflacion: number;
}

export default function BenefitsCards({ cashFlowAnual, capitalPropio, revalorizacionAnual, inflacion }: BenefitsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
        <p className="text-sm text-gray-400 mb-1">Cash Flow Anual</p>
        <p className={`text-2xl font-bold ${cashFlowAnual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {cashFlowAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
        </p>
        <p className="text-xs text-gray-500 mt-1">Dinero líquido después de gastos e hipoteca</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
        <p className="text-sm text-gray-400 mb-1">Tiempo para Recuperar Inversión</p>
        <p className="text-2xl font-bold text-blue-400">
          {cashFlowAnual > 0 ? (capitalPropio / cashFlowAnual).toFixed(1) : '∞'} años
        </p>
        <p className="text-xs text-gray-500 mt-1">Basado solo en cash flow</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
        <p className="text-sm text-gray-400 mb-1">Revalorización Anual</p>
        <p className="text-2xl font-bold text-purple-400">
          {revalorizacionAnual.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
        </p>
        <p className="text-xs text-gray-500 mt-1">{inflacion}% sobre precio inmueble</p>
      </div>
    </div>
  );
}
