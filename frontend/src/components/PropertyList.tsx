import { PropertyData } from "@/services/api";
import PropertyCard from "./PropertyCard";

interface ROIData {
  value: number | null;
  status: 'pending' | 'calculated';
}

interface PropertyListProps {
  properties: PropertyData[];
  calculateROI: (property: PropertyData) => ROIData;
  onOpenDetails: (property: PropertyData) => void;
  onDeleteProperty: (id: string) => void;
}

export default function PropertyList({ properties, calculateROI, onOpenDetails, onDeleteProperty }: PropertyListProps) {
  return (
    <div className="max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property) => (
            <PropertyCard
              key={`${property.id}-${property.precio}-${property.alquilerMensual}-${property.gastosAnuales}-${property.capitalPropio}`}
              property={property}
              calculateROI={calculateROI}
              onOpenDetails={onOpenDetails}
              onDelete={onDeleteProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
}
