export default function PageHeader() {
  return (
    <div className="max-w-6xl mx-auto mb-12">
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-900/50 border border-teal-500/30 rounded-full">
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-teal-400 text-sm font-medium">Herramienta de inversión inmobiliaria</span>
        </div>
      </div>

      <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
        <span className="text-white">Gestiona tus </span>
        <span className="text-teal-400">inversiones</span>
      </h1>

      <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto">
        Añade propiedades de Idealista, analiza su rentabilidad y toma decisiones de inversión inteligentes.
      </p>
    </div>
  );
}
