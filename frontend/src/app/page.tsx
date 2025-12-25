"use client";

import { useState } from "react";
import { sendQueryToGPT } from "@/services/api";

export default function Home() {
  const [url, setUrl] = useState("");
  const [propertyData, setPropertyData] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    const prompt = `Analiza este enlace de inmueble y extrae toda la información relevante en formato JSON. Incluye: precio, ubicación, metros cuadrados, habitaciones, baños, características, descripción, etc. Enlace: ${url}`;

    const result = await sendQueryToGPT(prompt);

    if (result.success) {
      setPropertyData(result.response || "Sin datos");
    } else {
      setPropertyData(`Error: ${result.error}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-8">
      {/* Header */}
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
          <span className="text-white">Calcula la </span>
          <span className="text-teal-400">rentabilidad</span>
          <br />
          <span className="text-white">de tu inversión</span>
        </h1>

        <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto">
          Analiza métricas financieras avanzadas, simula escenarios y toma
          decisiones de inversión inteligentes con datos en tiempo real.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Pega aquí el enlace del inmueble (ej: https://www.idealista.com/...)"
                className="flex-grow px-6 py-4 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-teal-500/50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analizando...
                  </span>
                ) : (
                  "Analizar"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {propertyData && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-semibold text-white">Datos del Inmueble</h2>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-700/30">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                {propertyData}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
