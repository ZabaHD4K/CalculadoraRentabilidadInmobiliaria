interface AddPropertyButtonProps {
  onClick: () => void;
}

export default function AddPropertyButton({ onClick }: AddPropertyButtonProps) {
  return (
    <div className="max-w-6xl mx-auto mb-8 flex justify-center">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-teal-500/50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Añadir Propiedad
      </button>
    </div>
  );
}
