interface AmortizationRow {
  año: number;
  cuota: number;
  intereses: number;
  amortizacion: number;
  saldoPendiente: number;
}

interface AmortizationTableProps {
  data: AmortizationRow[];
}

export default function AmortizationTable({ data }: AmortizationTableProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Tabla de Amortización (Primeros 5 años)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="pb-3 text-gray-300 font-semibold">Año</th>
              <th className="pb-3 text-gray-300 font-semibold">Cuota Anual</th>
              <th className="pb-3 text-gray-300 font-semibold">Intereses</th>
              <th className="pb-3 text-gray-300 font-semibold">Amortización</th>
              <th className="pb-3 text-gray-300 font-semibold">Saldo Pendiente</th>
            </tr>
          </thead>
          <tbody>
            {data.map((fila) => (
              <tr key={fila.año} className="border-b border-slate-700/50">
                <td className="py-3 text-white">Año {fila.año}</td>
                <td className="py-3 text-teal-400">{fila.cuota.toLocaleString('es-ES')}€</td>
                <td className="py-3 text-red-400">{fila.intereses.toLocaleString('es-ES')}€</td>
                <td className="py-3 text-green-400">{fila.amortizacion.toLocaleString('es-ES')}€</td>
                <td className="py-3 text-gray-300">{fila.saldoPendiente.toLocaleString('es-ES')}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
