interface FloatingSaveButtonProps {
  onSave: () => void;
  guardando: boolean;
  cambiosGuardados: boolean;
}

export default function FloatingSaveButton({ onSave, guardando, cambiosGuardados }: FloatingSaveButtonProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={onSave}
        disabled={guardando}
        className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 flex items-center gap-3 ${
          cambiosGuardados
            ? 'bg-green-500 hover:bg-green-600 scale-110'
            : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 hover:scale-105'
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {guardando ? (
          <>
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Guardando...</span>
          </>
        ) : cambiosGuardados ? (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>¡Guardado!</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>💾 Guardar Cambios</span>
          </>
        )}
      </button>
    </div>
  );
}
