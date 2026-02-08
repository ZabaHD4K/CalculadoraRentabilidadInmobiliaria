"use client";

import { useState } from 'react';
import { sendFeedback } from '@/services/api';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<'bug' | 'sugerencia'>('bug');
  const [mensaje, setMensaje] = useState('');
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    setEnviando(true);
    setError('');

    const result = await sendFeedback({ tipo, mensaje, email: email || undefined });

    if (result.success) {
      setEnviado(true);
      setTimeout(() => {
        setOpen(false);
        setEnviado(false);
        setMensaje('');
        setEmail('');
        setTipo('bug');
      }, 2000);
    } else {
      setError(result.error || 'Error al enviar');
    }

    setEnviando(false);
  };

  return (
    <>
      {/* Botón flotante arriba a la derecha */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-gray-300 hover:text-white rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 text-sm shadow-lg"
        title="Reportar error o sugerencia"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Feedback
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !enviando && setOpen(false)} />

          {/* Modal */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {/* Cerrar */}
            <button
              onClick={() => setOpen(false)}
              disabled={enviando}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Enviar feedback</h3>
            <p className="text-gray-400 text-sm mb-5">Reporta un error o sugiere una mejora</p>

            {enviado ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">&#10003;</div>
                <p className="text-green-400 font-semibold text-lg">Enviado correctamente</p>
                <p className="text-gray-400 text-sm mt-1">Gracias por tu feedback</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo('bug')}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all text-sm ${
                      tipo === 'bug'
                        ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                        : 'bg-slate-800 border-2 border-slate-700 text-gray-400 hover:border-slate-600'
                    }`}
                  >
                    Error / Bug
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('sugerencia')}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all text-sm ${
                      tipo === 'sugerencia'
                        ? 'bg-teal-500/20 border-2 border-teal-500 text-teal-400'
                        : 'bg-slate-800 border-2 border-slate-700 text-gray-400 hover:border-slate-600'
                    }`}
                  >
                    Sugerencia
                  </button>
                </div>

                {/* Mensaje */}
                <div>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder={tipo === 'bug' ? 'Describe el error que has encontrado...' : 'Describe tu sugerencia...'}
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-sm"
                  />
                </div>

                {/* Email opcional */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email de contacto (opcional)"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={enviando || !mensaje.trim()}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-gray-500 text-white rounded-lg font-semibold transition-all text-sm"
                >
                  {enviando ? 'Enviando...' : 'Enviar feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
