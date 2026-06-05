'use client';
import { useState, useEffect } from 'react';
import StatusBadge from '@/components/registros/StatusBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RegistroStatus } from '@/types';
import { ClipboardList, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MisRegistrosPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/registros?limit=50')
      .then(r => r.json())
      .then(res => { if (res.success) setRegistros(res.data || []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Registros</h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
            {loading ? 'Cargando...' : `${registros.length} jornadas cargadas`}
          </p>
        </div>
        <Link
          href="/jefe/nueva-jornada"
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#1d6fb8' }}
        >
          + Nueva Jornada
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1d6fb8' }} />
        </div>
      ) : registros.length === 0 ? (
        <div className="rounded-xl py-16 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: '#8b949e' }} />
          <p className="text-white font-medium">Sin registros</p>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Cargá tu primera jornada</p>
        </div>
      ) : (
        <>
          {/* MOBILE: cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {registros.map((r: any) => (
              <Link
                key={r._id.toString()}
                href={`/jefe/registros/${r._id}`}
                className="block rounded-xl px-4 py-3 hover:bg-[#1c2128] transition-colors"
                style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: '#8b949e' }}>
                    {format(new Date(r.fecha), 'dd MMM yyyy', { locale: es })}
                  </span>
                  <StatusBadge status={r.status as RegistroStatus} />
                </div>
                <p className="text-sm font-semibold text-white">{r.proyectoNombre || r.tipoProyecto || 'Taller'}</p>
                <p className="text-xs" style={{ color: '#8b949e' }}>{r.clienteNombre || r.trabajoRealizadoEn || '—'}</p>
                {r.rechazadoMotivo && r.status === 'rechazado' && (
                  <p className="text-xs mt-1 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(218,54,51,0.1)', color: '#f85149' }}>
                    Motivo: {r.rechazadoMotivo}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {/* DESKTOP: tabla */}
          <div className="hidden sm:block rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #21262d' }}>
                  {['Fecha', 'Proyecto / Cliente', 'Tipo', 'Encargado', 'HH', 'Estado', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#21262d' }}>
                {registros.map((r: any) => (
                  <tr key={r._id.toString()} className="hover:bg-[#1c2128] transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
                      {format(new Date(r.fecha), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{r.proyectoNombre || r.tipoProyecto || 'Taller'}</p>
                      <p className="text-xs" style={{ color: '#8b949e' }}>{r.clienteNombre || r.trabajoRealizadoEn || '—'}</p>
                      {r.rechazadoMotivo && r.status === 'rechazado' && (
                        <p className="text-xs mt-0.5" style={{ color: '#f85149' }}>
                          Motivo: {r.rechazadoMotivo}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8b949e' }}>{r.tipoProyecto || r.estadoActividad || '—'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8b949e' }}>{r.encargadoNombre || '—'}</td>
                    <td className="px-4 py-3 text-sm text-white">{r.horasTotalesDec ? `${r.horasTotalesDec}h` : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status as RegistroStatus} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/jefe/registros/${r._id}`} className="flex items-center justify-center">
                        <ChevronRight className="w-4 h-4" style={{ color: '#8b949e' }} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
