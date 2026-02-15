interface DashboardHeaderProps {
  propertyName: string;
  propertyAddress: string;
  onBack: () => void;
  onExportPDF?: () => void;
}

export default function DashboardHeader({ propertyName, propertyAddress, onBack, onExportPDF }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white mb-2">📈 Análisis Financiero Avanzado</h1>
        {onExportPDF && (
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar PDF
          </button>
        )}
      </div>
      <p className="text-xl text-gray-400">{propertyName}</p>
      <p className="text-gray-500">{propertyAddress}</p>
    </div>
  );
}
