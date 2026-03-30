'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StatusBadge from '@/components/registros/StatusBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RegistroStatus } from '@/types';
import Link from 'next/link';
const tabs = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendientes', value: 'pre_aprobado' },
  { label: 'Aprobados', value: 'aprobado' },
  { label: 'Rechazados', value: 'rechazado' },
];

export default function AllRegistrosPage() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'todos';
  const [registros, setRegistros] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/registros${currentStatus !== 'todos' ? `?status=${currentStatus}` : ''}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setRegistros(res.data || []);
      })
      .catch(() => {});
  }, [currentStatus]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Todos los Registros</h1>
        <p className="text-sm mt-1" style={{ color: '#8b949e' }}>{registros.length} registros encontrados</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-full mb-5" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
        {tabs.map(tab => (
          <Link
            key={tab.value}
            href={`/auditor/registros?status=${tab.value}`}
            className="flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentStatus === tab.value ? '#21262d' : 'transparent',
              color: currentStatus === tab.value ? 'white' : '#8b949e',
            }}
          >
            {tab.label}
          </Link>
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
              <div key={r._id.toString()} className="rounded-xl px-4 py-3" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: '#8b949e' }}>
                    {format(new Date(r.fecha), 'dd MMM yyyy', { locale: es })}
                  </span>
                  {r.status === 'pre_aprobado' ? (
                    <Link href={`/auditor/aprobaciones/${r._id}`}><StatusBadge status={r.status as RegistroStatus} /></Link>
                  ) : (
                    <StatusBadge status={r.status as RegistroStatus} />
                  )}
                </div>
                <p className="text-sm font-semibold text-white truncate">{r.proyectoNombre || '—'}</p>
                <p className="text-xs mb-2" style={{ color: '#8b949e' }}>{r.clienteNombre || '—'}</p>
                <div className="flex flex-wrap gap-2">
                  {r.encargadoNombre && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#21262d', color: '#8b949e' }}>{r.encargadoNombre}</span>}
                  {r.tipoProyecto && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#21262d', color: '#8b949e' }}>{r.tipoProyecto}</span>}
                  {r.horasTotalesDec ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#21262d', color: 'white' }}>{r.horasTotalesDec}h</span> : null}
                  {r.kmRecorridos ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#21262d', color: '#8b949e' }}>{r.kmRecorridos} km</span> : null}
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP: tabla */}
          <div className="hidden sm:block rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #21262d' }}>
                    {['Fecha', 'Proyecto', 'Cliente', 'Tipo', 'Encargado', 'HH', 'KM', 'Estado'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: '#8b949e' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#21262d' }}>
                  {registros.map((r: any) => (
                    <tr key={r._id.toString()} className="hover:bg-[#1c2128] transition-colors">
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{format(new Date(r.fecha), 'dd/MM/yy', { locale: es })}</td>
                      <td className="px-4 py-3 text-sm text-white max-w-[180px] truncate">{r.proyectoNombre || '—'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8b949e' }}>{r.clienteNombre || '—'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8b949e' }}>{r.tipoProyecto || '—'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8b949e' }}>{r.encargadoNombre || '—'}</td>
                      <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{r.horasTotalesDec ? `${r.horasTotalesDec}h` : '—'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: '#8b949e' }}>{r.kmRecorridos || '—'}</td>
                      <td className="px-4 py-3">
                        {r.status === 'pre_aprobado' ? (
                          <Link href={`/auditor/aprobaciones/${r._id}`}><StatusBadge status={r.status as RegistroStatus} /></Link>
                        ) : (
                          <StatusBadge status={r.status as RegistroStatus} />
                        )}
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
