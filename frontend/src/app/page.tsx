"use client";

import { useState, useEffect } from "react";
import { PropertyData, analyzeProperty, saveProperty, getProperties, deleteProperty, estimateRent } from "@/services/api";

export default function Home() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [estimatingRent, setEstimatingRent] = useState<string | null>(null);

  // Formulario
  const [formData, setFormData] = useState<PropertyData>({
    nombre: "",
    direccion: "",
    precio: 0,
    superficie: 0,
    habitaciones: 0,
    banos: 0,
    alquilerMensual: null,
    gastosAnuales: null,
    descripcion: "",
    caracteristicas: [],
    imagenes: [],
    estado: "disponible",
    tipoPropiedad: "piso",
    pisoOcupado: false,
    pisoAlquilado: false,
    notasAdicionales: "",
    urlImagen: "",
  });

  const [idealistaUrl, setIdealistaUrl] = useState("");

  // Cargar propiedades al iniciar
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const result = await getProperties();
    if (result.success && result.properties) {
      setProperties(result.properties);
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!idealistaUrl.trim()) return;

    setAnalyzingUrl(true);
    const result = await analyzeProperty(idealistaUrl);

    if (result.success && result.data) {
      // Si viene con alquilerMensual, marcar automáticamente como alquilado
      const isRented = !!(result.data.alquilerMensual && result.data.alquilerMensual > 0);

      setFormData({
        ...result.data,
        pisoOcupado: false,
        pisoAlquilado: isRented,
        notasAdicionales: "",
        urlImagen: result.data.imagenes && result.data.imagenes.length > 0 ? result.data.imagenes[0] : "",
      });
    } else {
      alert(`Error: ${result.error}`);
    }

    setAnalyzingUrl(false);
  };

  const handleSaveProperty = async () => {
    setLoading(true);
    const result = await saveProperty(formData);

    if (result.success) {
      await loadProperties();
      setShowModal(false);
      resetForm();
    } else {
      alert(`Error: ${result.error}`);
    }

    setLoading(false);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return;

    const result = await deleteProperty(id);
    if (result.success) {
      await loadProperties();
    }
  };

  const handleEstimateRent = async (property: PropertyData) => {
    if (!property.id) return;

    setEstimatingRent(property.id);
    const result = await estimateRent(property);

    if (result.success && result.estimate) {
      // Actualizar la propiedad con el alquiler estimado
      setProperties(prev => prev.map(p =>
        p.id === property.id
          ? { ...p, alquilerEstimado: result.estimate }
          : p
      ));
    } else {
      alert(`Error: ${result.error}`);
    }

    setEstimatingRent(null);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      direccion: "",
      precio: 0,
      superficie: 0,
      habitaciones: 0,
      banos: 0,
      alquilerMensual: null,
      gastosAnuales: null,
      descripcion: "",
      caracteristicas: [],
      imagenes: [],
      estado: "disponible",
      tipoPropiedad: "piso",
      pisoOcupado: false,
      pisoAlquilado: false,
      notasAdicionales: "",
      urlImagen: "",
    });
    setIdealistaUrl("");
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
          <span className="text-white">Gestiona tus </span>
          <span className="text-teal-400">inversiones</span>
        </h1>

        <p className="text-gray-400 text-center text-lg max-w-3xl mx-auto">
          Añade propiedades de Idealista, analiza su rentabilidad y toma decisiones de inversión inteligentes.
        </p>
      </div>

      {/* Botón Añadir Propiedad */}
      <div className="max-w-6xl mx-auto mb-8 flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-teal-500/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir Propiedad
        </button>
      </div>

      {/* Lista de Propiedades */}
      <div className="max-w-6xl mx-auto">
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No hay propiedades añadidas</h3>
            <p className="text-gray-400">
              Añade tu primera propiedad para empezar a analizar su rentabilidad. Puedes pegar un enlace de Idealista como referencia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                {/* Imagen */}
                {property.urlImagen && (
                  <div className="h-48 bg-slate-900">
                    <img
                      src={property.urlImagen}
                      alt={property.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{property.nombre}</h3>
                  <p className="text-gray-400 text-sm mb-4">{property.direccion}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Precio</p>
                      <p className="text-teal-400 font-bold">{property.precio.toLocaleString()}€</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Superficie</p>
                      <p className="text-white font-semibold">{property.superficie}m²</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Habitaciones</p>
                      <p className="text-white font-semibold">{property.habitaciones}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Baños</p>
                      <p className="text-white font-semibold">{property.banos}</p>
                    </div>
                  </div>

                  {property.alquilerEstimado && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-4">
                      <p className="text-gray-400 text-xs mb-1">Alquiler estimado (GPT)</p>
                      <p className="text-purple-400 font-bold">{property.alquilerEstimado}</p>
                    </div>
                  )}

                  {/* Estado */}
                  <div className="flex gap-2 mb-4">
                    {property.pisoOcupado && (
                      <span className="px-2 py-1 bg-orange-900/30 border border-orange-500/30 text-orange-400 text-xs rounded-full">
                        Ocupado
                      </span>
                    )}
                    {property.pisoAlquilado && (
                      <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs rounded-full">
                        Alquilado{property.alquilerMensual ? ` (${property.alquilerMensual}€/mes)` : ''}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-green-900/30 border border-green-500/30 text-green-400 text-xs rounded-full">
                      {property.estado}
                    </span>
                  </div>

                  {/* Botones */}
                  <div className="space-y-2">
                    {!property.alquilerEstimado && (
                      <button
                        onClick={() => handleEstimateRent(property)}
                        disabled={estimatingRent === property.id}
                        className="w-full px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-400 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {estimatingRent === property.id ? "Calculando..." : "Calcular alquiler estimado"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProperty(property.id!)}
                      className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 rounded-lg text-sm transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h2 className="text-2xl font-bold text-white">Añadir nueva propiedad</h2>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-6">
              {/* Enlace de Idealista */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Enlace de Idealista (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={idealistaUrl}
                    onChange={(e) => setIdealistaUrl(e.target.value)}
                    placeholder="https://www.idealista.com/inmueble/..."
                    className="flex-grow px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleAnalyzeUrl}
                    disabled={analyzingUrl || !idealistaUrl.trim()}
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {analyzingUrl ? "Buscando..." : "Buscar"}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Pega el enlace para rellenar los datos automáticamente.Tambien puedes introducir los datos manualmente.
                </p>
              </div>

              {/* Campos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del inmueble</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Piso en Calle Gran Vía"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Ej: Calle Gran Vía 45, Madrid"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio compra (€)</label>
                  <input
                    type="number"
                    value={formData.precio || ""}
                    onChange={(e) => setFormData({ ...formData, precio: parseInt(e.target.value) || 0 })}
                    placeholder="150000"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Superficie (m²)</label>
                  <input
                    type="number"
                    value={formData.superficie || ""}
                    onChange={(e) => setFormData({ ...formData, superficie: parseInt(e.target.value) || 0 })}
                    placeholder="80"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Habitaciones</label>
                  <input
                    type="number"
                    value={formData.habitaciones || ""}
                    onChange={(e) => setFormData({ ...formData, habitaciones: parseInt(e.target.value) || 0 })}
                    placeholder="2"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Baños</label>
                  <input
                    type="number"
                    value={formData.banos || ""}
                    onChange={(e) => setFormData({ ...formData, banos: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Gastos anuales (€)</label>
                  <input
                    type="number"
                    value={formData.gastosAnuales || ""}
                    onChange={(e) => setFormData({ ...formData, gastosAnuales: parseInt(e.target.value) || null })}
                    placeholder="1500"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL de imagen (opcional)</label>
                  <input
                    type="url"
                    value={formData.urlImagen || ""}
                    onChange={(e) => setFormData({ ...formData, urlImagen: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Datos adicionales */}
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Datos adicionales</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pisoOcupado || false}
                        onChange={(e) => setFormData({ ...formData, pisoOcupado: e.target.checked })}
                        className="w-4 h-4 text-teal-500 bg-slate-800 border-slate-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-gray-300">Piso ocupado</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pisoAlquilado || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          pisoAlquilado: e.target.checked,
                          alquilerMensual: e.target.checked ? formData.alquilerMensual : null
                        })}
                        className="w-4 h-4 text-teal-500 bg-slate-800 border-slate-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-gray-300">Piso alquilado</span>
                    </label>
                  </div>

                  {/* Campo de alquiler mensual - solo visible si está alquilado */}
                  {formData.pisoAlquilado && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Alquiler mensual actual (€)</label>
                      <input
                        type="number"
                        value={formData.alquilerMensual || ""}
                        onChange={(e) => setFormData({ ...formData, alquilerMensual: parseInt(e.target.value) || null })}
                        placeholder="800"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notas adicionales</label>
                    <textarea
                      value={formData.notasAdicionales || ""}
                      onChange={(e) => setFormData({ ...formData, notasAdicionales: e.target.value })}
                      placeholder="Añade cualquier información relevante sobre la propiedad..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProperty}
                  disabled={loading || !formData.nombre || !formData.direccion}
                  className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
