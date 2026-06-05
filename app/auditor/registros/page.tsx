'use client';
import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '@/components/registros/StatusBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RegistroStatus } from '@/types';
import Link from 'next/link';
import { Filter, X } from 'lucide-react';

const tabs = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendientes', value: 'pre_aprobado' },
  { label: 'Aprobados', value: 'aprobado' },
  { label: 'Rechazados', value: 'rechazado' },
];

type CatalogData = {
  clientes: { _id: string; nombre: string }[];
  personal: { _id: string; nombre: string }[];
  tiposProyecto: string[];
};

const inputStyle = {
  backgroundColor: '#21262d',
  border: '1px solid #30363d',
  borderRadius: 8,
  color: 'white',
  padding: '7px 10px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
} as const;

export default function AllRegistrosPage() {
  const [currentStatus, setCurrentStatus] = useState('todos');
  const [registros, setRegistros] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cliente: '',
    encargado: '',
    tipoProyecto: '',
    proyectoNombre: '',
    fechaDesde: '',
    fechaHasta: '',
  });

  useEffect(() => {
    const cached = localStorage.getItem('elite_catalog');
    if (cached) {
      const parsed = JSON.parse(cached);
      setCatalog(parsed);
    } else {
      fetch('/api/catalogo').then(r => r.json()).then(res => {
        if (res.success) setCatalog(res.data);
      });
    }
  }, []);

  const loadRegistros = useCallback(() => {
    const params = new URLSearchParams();
    if (currentStatus !== 'todos') params.set('status', currentStatus);
    if (filters.cliente) params.set('cliente', filters.cliente);
    if (filters.encargado) params.set('encargado', filters.encargado);
    if (filters.tipoProyecto) params.set('tipoProyecto', filters.tipoProyecto);
    if (filters.proyectoNombre) params.set('proyectoNombre', filters.proyectoNombre);
    if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta);
    params.set('limit', '100');

    fetch(`/api/registros?${params.toString()}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setRegistros(res.data || []);
      })
      .catch(() => {});
  }, [currentStatus, filters]);

  useEffect(() => { loadRegistros(); }, [loadRegistros]);

  function clearFilters() {
    setFilters({ cliente: '', encargado: '', tipoProyecto: '', proyectoNombre: '', fechaDesde: '', fechaHasta: '' });
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Todos los Registros</h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>{registros.length} registros encontrados</p>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: showFilters || hasActiveFilters ? 'rgba(29,111,184,0.15)' : '#21262d',
            color: showFilters || hasActiveFilters ? '#58a6ff' : '#8b949e',
            border: `1px solid ${showFilters || hasActiveFilters ? 'rgba(29,111,184,0.4)' : '#30363d'}`,
          }}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#1d6fb8', color: 'white' }}>
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-5 p-4 rounded-xl space-y-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-white">Filtros</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs" style={{ color: '#8b949e' }}>
                <X className="w-3 h-3" /> Limpiar todo
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Cliente</label>
              <select
                value={filters.cliente}
                onChange={e => setFilters(f => ({ ...f, cliente: e.target.value }))}
                style={{ ...inputStyle, appearance: 'none' }}
              >
                <option value="">Todos</option>
                {catalog?.clientes.map(c => <option key={c._id} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Encargado</label>
              <select
                value={filters.encargado}
                onChange={e => setFilters(f => ({ ...f, encargado: e.target.value }))}
                style={{ ...inputStyle, appearance: 'none' }}
              >
                <option value="">Todos</option>
                {catalog?.personal.map(p => <option key={p._id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Tipo de tarea</label>
              <select
                value={filters.tipoProyecto}
                onChange={e => setFilters(f => ({ ...f, tipoProyecto: e.target.value }))}
                style={{ ...inputStyle, appearance: 'none' }}
              >
                <option value="">Todos</option>
                {catalog?.tiposProyecto.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Proyecto / Mástil</label>
              <input
                value={filters.proyectoNombre}
                onChange={e => setFilters(f => ({ ...f, proyectoNombre: e.target.value }))}
                placeholder="Buscar proyecto..."
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Fecha desde</label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={e => setFilters(f => ({ ...f, fechaDesde: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Fecha hasta</label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={e => setFilters(f => ({ ...f, fechaHasta: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-full mb-5" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setCurrentStatus(tab.value)}
            className="flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentStatus === tab.value ? '#21262d' : 'transparent',
              color: currentStatus === tab.value ? 'white' : '#8b949e',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {registros.length === 0 ? (
        <div className="rounded-xl py-16 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #21262d', color: '#8b949e' }}>
          Sin registros para este filtro
        </div>
      ) : (
        <>
          {/* MOBILE: cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {registros.map((r: any) => (
              <Link
                key={r._id.toString()}
                href={`/auditor/aprobaciones/${r._id}`}
                className="block rounded-xl px-4 py-3 hover:bg-[#1c2128] transition-colors"
                style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: '#8b949e' }}>
                    {format(new Date(r.fecha), 'dd MMM yyyy', { locale: es })}
                  </span>
                  <StatusBadge status={r.status as RegistroStatus} />
                </div>
                <p className="text-sm font-semibold text-white truncate">{r.proyectoNombre || r.tipoProyecto || '—'}</p>
                <p className="text-xs mb-2" style={{ color: '#8b949e' }}>{r.clienteNombre || (r.trabajoRealizadoEn === 'taller' ? 'Taller' : '—')}</p>
                <div className="flex flex-wrap gap-2">
                  {r.encargadoNombre && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#21262d', color: '#8b949e' }}>{r.encargadoNombre}</span>}
                  {r.tipoProyecto && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#21262d', color: '#8b949e' }}>{r.tipoProyecto}</span>}
                  {r.horasTotalesDec ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#21262d', color: 'white' }}>{r.horasTotalesDec}h</span> : null}
                  {r.kmRecorridos ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#21262d', color: '#8b949e' }}>{r.kmRecorridos} km</span> : null}
                </div>
              </Link>
            ))}
          </div>

          {/* DESKTOP: tabla */}
          <div className="hidden sm:block rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #21262d' }}>
                    {['Fecha', 'Proyecto', 'Cliente', 'Tipo', 'Encargado', 'HH', 'KM', 'Estado', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#8b949e' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#21262d' }}>
                  {registros.map((r: any) => (
                    <tr key={r._id.toString()} className="hover:bg-[#1c2128] transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{format(new Date(r.fecha), 'dd/MM/yy', { locale: es })}</td>
                      <td className="px-4 py-3 text-sm text-white max-w-[180px] truncate">{r.proyectoNombre || r.tipoProyecto || '—'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8b949e' }}>{r.clienteNombre || (r.trabajoRealizadoEn === 'taller' ? 'Taller' : '—')}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8b949e' }}>{r.tipoProyecto || '—'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8b949e' }}>{r.encargadoNombre || '—'}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{r.horasTotalesDec ? `${r.horasTotalesDec}h` : '—'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8b949e' }}>{r.kmRecorridos || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status as RegistroStatus} /></td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/auditor/aprobaciones/${r._id}`}
                          className="text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          style={{ backgroundColor: '#21262d', color: '#8b949e' }}
                        >
                          Ver detalle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
