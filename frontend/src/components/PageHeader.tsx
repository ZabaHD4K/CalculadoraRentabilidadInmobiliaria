interface PageHeaderProps {
  onSignOut?: () => void;
  userEmail?: string | null;
}

export default function PageHeader({ onSignOut, userEmail }: PageHeaderProps) {
  return (
    <div className="mb-12">
      {/* Barra superior con badge y botón de sesión */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 mb-6">
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-slate-400 text-xs truncate max-w-[200px]" title={userEmail}>
              {userEmail}
            </span>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-lg text-xs font-medium transition-all"
              title="Cerrar sesión"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          <span className="text-white">Gestiona tus </span>
          <span className="text-teal-400">inversiones</span>
        </h1>

        <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto">
          Añade propiedades de Idealista, analiza su rentabilidad y toma decisiones de inversión inteligentes.
        </p>
      </div>
    </div>
  );
}
