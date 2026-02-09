interface DashboardHeaderProps {
  propertyName: string;
  propertyAddress: string;
  onBack: () => void;
}

export default function DashboardHeader({ propertyName, propertyAddress, onBack }: DashboardHeaderProps) {
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
      <h1 className="text-4xl font-bold text-white mb-2">📈 Análisis Financiero Avanzado</h1>
      <p className="text-xl text-gray-400">{propertyName}</p>
      <p className="text-gray-500">{propertyAddress}</p>
    </div>
  );
}
