"use client";

import { useState } from 'react';
import { signIn, signUp } from '@/services/api';

interface AuthModalProps {
  onAuthenticated: () => void;
}

type Mode = 'login' | 'register';

// Partículas pre-calculadas para la explosión de éxito
const BURST_PARTICLES = [
  { x: 90, y: 0 },   { x: 64, y: 64 },  { x: 0, y: 90 },   { x: -64, y: 64 },
  { x: -90, y: 0 },  { x: -64, y: -64 }, { x: 0, y: -90 },  { x: 64, y: -64 },
  { x: 130, y: 30 }, { x: -130, y: 30 }, { x: 30, y: 130 }, { x: -30, y: -130 },
  { x: 110, y: -70 },{ x: -110, y: -70 },{ x: 70, y: 110 }, { x: -70, y: 110 },
];

export default function AuthModal({ onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const result = await signUp(email, password);
        if (!result.success) {
          setError(result.error || 'Error al registrar');
          shakeForm();
        } else {
          // Registro exitoso → mostrar mensaje y cambiar a login
          setSuccessMsg('¡Cuenta creada! Revisa tu correo y confírmala antes de iniciar sesión.');
          setTimeout(() => { setMode('login'); setSuccessMsg(''); }, 4000);
        }
      } else {
        const result = await signIn(email, password);
        if (!result.success) {
          setError(result.error || 'Error al iniciar sesión');
          shakeForm();
        } else {
          setLoginSuccess(true);
          setTimeout(() => {
            setIsClosing(true);
            setTimeout(() => onAuthenticated(), 700);
          }, 2000);
        }
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const shakeForm = () => {
    const form = document.getElementById('auth-form');
    form?.classList.add('shake');
    setTimeout(() => form?.classList.remove('shake'), 500);
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setSuccessMsg('');
  };

  // ── Pantalla de éxito de login ──
  if (loginSuccess) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-700 ${isClosing ? 'opacity-0 scale-110' : ''}`}>
        {/* Fondo con gradiente explosivo */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900" style={{ animation: 'bgPulse 0.6s ease-out both' }} />

        {/* Anillos expansivos */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-teal-400/40"
              style={{
                animation: `ringExpand 1.8s ease-out ${i * 0.18}s both`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
              }}
            />
          ))}
        </div>

        {/* Partículas disparadas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {BURST_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                background: i % 3 === 0 ? '#2dd4bf' : i % 3 === 1 ? '#06b6d4' : '#a78bfa',
                top: '50%',
                left: '50%',
                animation: `burstOut 1.2s ease-out ${i * 0.04}s both`,
                ['--bx' as string]: `${p.x}px`,
                ['--by' as string]: `${p.y}px`,
              }}
            />
          ))}
        </div>

        {/* Contenido central */}
        <div className="relative flex flex-col items-center text-center px-8" style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
          {/* Check animado */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-teal-500 rounded-full blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/40">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeDasharray="33"
                strokeDashoffset="33"
                style={{ animation: 'drawCheck 0.5s ease-out 0.4s forwards' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1
            className="text-5xl font-bold text-white mb-3"
            style={{ animation: 'slideUp 0.5s ease-out 0.3s both' }}
          >
            ¡Bienvenido!
          </h1>
          <p
            className="text-teal-300 text-lg mb-2"
            style={{ animation: 'slideUp 0.5s ease-out 0.45s both' }}
          >
            {email}
          </p>
          <p
            className="text-slate-400 text-sm"
            style={{ animation: 'slideUp 0.5s ease-out 0.55s both' }}
          >
            Cargando tu cartera inmobiliaria...
          </p>

          {/* Barra de progreso */}
          <div
            className="mt-6 w-48 h-1 bg-slate-700 rounded-full overflow-hidden"
            style={{ animation: 'slideUp 0.5s ease-out 0.6s both' }}
          >
            <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" style={{ animation: 'loadBar 1.8s ease-in-out forwards' }} />
          </div>
        </div>

      </div>
    );
  }

  // ── Pantalla normal de login/registro ──
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 transition-all duration-700 ${isClosing ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-teal-400 rounded-full opacity-20"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animation: `float ${5 + (i % 5) * 2}s linear infinite`,
              animationDelay: `${(i * 0.7) % 5}s`,
            }}
          />
        ))}
      </div>

      {/* Card principal */}
      <div
        className={`relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-teal-500/30 max-w-md w-full mx-4 transition-all duration-700 ${isClosing ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ animation: isClosing ? 'none' : 'modalEnter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Brillo de fondo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl opacity-20 blur-xl animate-pulse" />

        <div className="relative">
          {/* Icono */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-full">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Formulario ── */}
          <>
              <h2 className="text-3xl font-bold text-center mb-1 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {mode === 'login' ? 'Bienvenido' : 'Crear cuenta'}
              </h2>
              <p className="text-slate-400 text-center text-sm mb-7">
                {mode === 'login' ? 'Accede a tu cartera inmobiliaria' : 'Empieza a gestionar tus propiedades'}
              </p>

              <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5 ml-1">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-9 pr-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5 ml-1">Contraseña</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-center text-sm bg-red-500/10 border border-red-500/30 rounded-xl py-2.5 px-4">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="text-teal-400 text-center text-sm bg-teal-500/10 border border-teal-500/30 rounded-xl py-2.5 px-4">
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || password.length < 6}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {mode === 'login' ? 'Entrando...' : 'Creando cuenta...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode === 'login' ? 'M13 10V3L4 14h7v7l9-11h-7z' : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'} />
                      </svg>
                      {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                  {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  {' '}
                  <button
                    onClick={switchMode}
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors underline underline-offset-2"
                  >
                    {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </p>
              </div>
          </>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-xs">RealEstateAI · Tu cartera inmobiliaria</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalEnter {
          0%   { opacity: 0; transform: scale(0.5) translateY(-30px); }
          60%  { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-25px) translateX(8px); }
          66% { transform: translateY(-12px) translateX(-8px); }
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
