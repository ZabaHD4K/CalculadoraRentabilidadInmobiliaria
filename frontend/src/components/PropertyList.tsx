"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { PropertyData } from "@/services/api";
import PropertyCard from "./PropertyCard";
import PropertyCardRow from "./PropertyCardRow";

interface ROIData {
  value: number | null;
  status: 'pending' | 'calculated';
}

interface PropertyListProps {
  readonly properties: PropertyData[];
  readonly calculateROI: (property: PropertyData) => ROIData;
  readonly onOpenDetails: (property: PropertyData) => void;
  readonly onDeleteProperty: (id: string) => void;
}

type SortField = 'none' | 'nombre' | 'rentabilidad' | 'alquiler';
type ViewMode = 'grid' | 'list';
type SortOrder = 'asc' | 'desc';

const SORT_FIELDS = ['nombre', 'rentabilidad', 'alquiler'] as const;
const SORT_LABELS: Record<Exclude<SortField, 'none'>, string> = {
  nombre: 'Nombre',
  rentabilidad: 'Rentabilidad',
  alquiler: 'Alquiler',
};

type FlipMove = { el: HTMLDivElement; dx: number; dy: number; dist: number; duration: number; delay: number };

function playFlipMove({ el, duration, delay }: FlipMove): void {
  setTimeout(() => {
    el.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
    el.style.transform = '';
    setTimeout(() => { el.style.transition = ''; el.style.zIndex = ''; }, duration + 50);
  }, delay);
}

function getContainerClass(exiting: boolean, view: ViewMode): string {
  if (exiting) return 'view-exit';
  if (view === 'grid') return 'view-enter-grid card-stagger';
  return 'view-enter-list row-stagger';
}

function sortProperties(
  list: PropertyData[],
  sortBy: SortField,
  sortOrder: SortOrder,
  calculateROI: (p: PropertyData) => ROIData,
): PropertyData[] {
  if (sortBy === 'none') return list;
  const dir = sortOrder === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre, 'es') * dir;
    if (sortBy === 'alquiler') return ((a.alquilerMensual || 0) - (b.alquilerMensual || 0)) * dir;
    const roiA = calculateROI(a).value ?? -Infinity;
    const roiB = calculateROI(b).value ?? -Infinity;
    return (roiA - roiB) * dir;
  });
}

/* ── Sub-componente: panel del desplegable ─────────────────────────────── */
interface DropdownPanelProps {
  readonly isOpen: boolean;
  readonly sortBy: SortField;
  readonly sortOrder: SortOrder;
  readonly viewMode: ViewMode;
  readonly onSort: (field: Exclude<SortField, 'none'>) => void;
  readonly onClearSort: () => void;
  readonly onSwitchView: (mode: ViewMode) => void;
}

function DropdownPanel({ isOpen, sortBy, sortOrder, viewMode, onSort, onClearSort, onSwitchView }: DropdownPanelProps) {
  return (
    <div
      className={`absolute top-full right-0 mt-2 w-64 bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden transition-all duration-200 origin-top-right z-50 ${
        isOpen
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
      }`}
    >
      <div className="p-4 border-b border-slate-700/40">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-semibold">Ordenar por</p>
        <div className="flex flex-col gap-1.5">
          {SORT_FIELDS.map((field) => (
            <button
              key={field}
              onClick={() => onSort(field)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                sortBy === field
                  ? 'bg-teal-600/20 border border-teal-500/30 text-teal-300'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>{SORT_LABELS[field]}</span>
              {sortBy === field && (
                <span className="text-teal-400 text-xs font-bold">
                  {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                </span>
              )}
            </button>
          ))}
          {sortBy !== 'none' && (
            <button
              onClick={onClearSort}
              className="text-xs text-slate-500 hover:text-slate-400 mt-1 text-left px-3 py-1 transition-colors"
            >
              Quitar orden
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-semibold">Vista</p>
        <div className="relative flex items-center bg-slate-800/60 border border-slate-700/40 rounded-lg p-0.5">
          <div
            className="absolute top-0.5 bottom-0.5 rounded-md bg-slate-700/80 border border-slate-600/40 shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ width: 'calc(50% - 2px)', left: viewMode === 'grid' ? '2px' : 'calc(50%)' }}
          />
          <button
            onClick={() => onSwitchView('grid')}
            className={`relative z-10 flex items-center gap-2 flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 justify-center ${
              viewMode === 'grid' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Cuadrícula
          </button>
          <button
            onClick={() => onSwitchView('list')}
            className={`relative z-10 flex items-center gap-2 flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 justify-center ${
              viewMode === 'list' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Lista
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ──────────────────────────────────────────────── */
export default function PropertyList({ properties, calculateROI, onOpenDetails, onDeleteProperty }: PropertyListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isExiting, setIsExiting] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('grid');
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // FLIP animation refs
  const flipPrev = useRef<Map<string, { x: number; y: number }>>(new Map());
  const wrapperRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const flipPending = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('propertyViewMode') as ViewMode | null;
    if (saved) { setViewMode(saved); setActiveView(saved); }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Capture positions before sort (called synchronously before setState)
  const captureFlip = () => {
    flipPrev.current.clear();
    wrapperRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      flipPrev.current.set(id, { x: r.left, y: r.top });
    });
    flipPending.current = true;
  };

  // After React re-renders with new sorted order: apply FLIP
  useLayoutEffect(() => {
    if (!flipPending.current || flipPrev.current.size === 0) return;
    flipPending.current = false;

    const moves: FlipMove[] = [];

    wrapperRefs.current.forEach((el, id) => {
      const prev = flipPrev.current.get(id);
      if (!prev) return;
      const r = el.getBoundingClientRect();
      const dx = prev.x - r.left;
      const dy = prev.y - r.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      moves.push({ el, dx, dy, dist: Math.abs(dx) + Math.abs(dy), duration: 0, delay: 0 });
    });

    if (moves.length === 0) return;

    const maxDist = Math.max(...moves.map(m => m.dist));

    // Compute timing and snap to old position
    moves.forEach((m) => {
      m.delay = (m.dist / maxDist) * 55;
      m.duration = 420 + (m.dist / maxDist) * 80;
      m.el.style.transition = 'none';
      m.el.style.transform = `translate(${m.dx}px, ${m.dy}px)`;
      m.el.style.zIndex = String(Math.round((m.dist / maxDist) * 9) + 1);
    });

    // Force reflow
    moves[0].el.getBoundingClientRect();

    // Play: animate to final position
    requestAnimationFrame(() => { moves.forEach(playFlipMove); });

    flipPrev.current.clear();
  });

  const switchView = (newMode: ViewMode) => {
    if (newMode === viewMode || isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setViewMode(newMode);
      setActiveView(newMode);
      localStorage.setItem('propertyViewMode', newMode);
      setIsExiting(false);
    }, 180);
  };

  const handleSort = (field: Exclude<SortField, 'none'>) => {
    captureFlip();
    if (sortBy === field) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleClearSort = () => {
    captureFlip();
    setSortBy('none');
  };

  const sortedProperties = sortProperties(properties, sortBy, sortOrder, calculateROI);
  const hasSort = sortBy !== 'none';
  const sortArrow = sortOrder === 'asc' ? '↑' : '↓';
  const sortLabel = sortBy === 'none' ? '' : SORT_LABELS[sortBy];
  const triggerLabel = hasSort ? `${sortLabel} ${sortArrow}` : 'Ordenar';

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
        <>
          {/* Barra superior */}
          <div className="flex justify-end mb-4">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsOpen(o => !o)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 ${
                  isOpen || hasSort
                    ? 'bg-teal-600/15 border-teal-500/40 text-teal-400 shadow-lg shadow-teal-500/5'
                    : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-slate-300 hover:border-slate-600/60'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <span>{triggerLabel}</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <DropdownPanel
                isOpen={isOpen}
                sortBy={sortBy}
                sortOrder={sortOrder}
                viewMode={viewMode}
                onSort={handleSort}
                onClearSort={handleClearSort}
                onSwitchView={switchView}
              />
            </div>
          </div>

          {/* Tarjetas */}
          <div key={activeView} className={getContainerClass(isExiting, activeView)}>
            {activeView === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedProperties.map((property) => (
                  <div
                    key={property.id}
                    ref={(el) => {
                      if (el) wrapperRefs.current.set(property.id || '', el);
                      else wrapperRefs.current.delete(property.id || '');
                    }}
                    className="relative"
                  >
                    <PropertyCard
                      property={property}
                      calculateROI={calculateROI}
                      onOpenDetails={onOpenDetails}
                      onDelete={onDeleteProperty}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedProperties.map((property) => (
                  <div
                    key={property.id}
                    ref={(el) => {
                      if (el) wrapperRefs.current.set(property.id || '', el);
                      else wrapperRefs.current.delete(property.id || '');
                    }}
                    className="relative"
                  >
                    <PropertyCardRow
                      property={property}
                      calculateROI={calculateROI}
                      onOpenDetails={onOpenDetails}
                      onDelete={onDeleteProperty}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
