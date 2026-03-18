'use client';
import { useState, useEffect } from 'react';
import KPICard from '@/components/dashboard/KPICard';
import StatusBadge from '@/components/registros/StatusBadge';
import { Clock, CheckCircle, XCircle, Activity, Truck, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RegistroStatus } from '@/types';
import { mockRegistros, mockKPIs } from '@/lib/mock-data';
import { getMockStatus } from '@/lib/mock-status';

export default function AuditorDashboard() {
  const [data, setData] = useState({
    pendientes: mockKPIs.pendientes,
    aprobados: mockKPIs.aprobados,
    rechazados: mockKPIs.rechazados,
    hhTotales: mockKPIs.hhTotales,
    hhCampo: mockKPIs.hhCampo,
    kmTotales: mockKPIs.kmTotales,
    ultimosPendientes: mockRegistros.filter(r => r.status === 'pre_aprobado') as any[],
  });

  useEffect(() => {
    const mockStatus = getMockStatus();

    // Aplicar overrides de localStorage sobre datos mock
    const withOverrides = mockRegistros.map(r => {
      const override = mockStatus[r._id];
      return override ? { ...r, status: override.status } : r;
    });

    const pendientes = withOverrides.filter(r => r.status === 'pre_aprobado').length;
    const aprobados = withOverrides.filter(r => r.status === 'aprobado').length;
    const rechazados = withOverrides.filter(r => r.status === 'rechazado').length;
    const aprobadosData = withOverrides.filter(r => r.status === 'aprobado');
    const hhTotales = aprobadosData.reduce((s, r) => s + r.horasTotalesDec, 0);
    const hhCampo = aprobadosData.reduce((s, r) => s + r.horasSitioDec, 0);
    const kmTotales = aprobadosData.reduce((s, r) => s + r.kmRecorridos, 0);
    const ultimosPendientes = withOverrides.filter(r => r.status === 'pre_aprobado').slice(0, 6);

    // Intentar obtener datos reales de la API
    fetch('/api/metricas')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setData({
            pendientes: res.data.pendientes ?? pendientes,
            aprobados: res.data.aprobados ?? aprobados,
            rechazados: res.data.rechazados ?? rechazados,
            hhTotales: res.data.hhTotales ?? hhTotales,
            hhCampo: res.data.hhCampo ?? hhCampo,
            kmTotales: res.data.kmTotales ?? kmTotales,
            ultimosPendientes,
          });
        } else {
          setData({ pendientes, aprobados, rechazados, hhTotales, hhCampo, kmTotales, ultimosPendientes });
        }
      })
      .catch(() => {
        setData({ pendientes, aprobados, rechazados, hhTotales, hhCampo, kmTotales, ultimosPendientes });
      });
  }, []);

  const productividad = data.hhTotales > 0 ? Math.round((data.hhCampo / data.hhTotales) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Panel de control operativo</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard icon={Clock} title="Pendientes de aprobación" value={data.pendientes} color="#9e6a03" subtitle="Requieren revisión" />
        <KPICard icon={CheckCircle} title="Aprobados" value={data.aprobados} color="#238636" />
        <KPICard icon={XCircle} title="Rechazados" value={data.rechazados} color="#da3633" />
        <KPICard icon={Activity} title="Productividad" value={`${productividad}%`} color="#1d6fb8" subtitle="HH campo / HH totales" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <KPICard icon={Users} title="HH Totales aprobadas" value={Math.round(data.hhTotales * 10) / 10} unit="h" color="#1d6fb8" />
        <KPICard icon={TrendingUp} title="HH en Campo" value={Math.round(data.hhCampo * 10) / 10} unit="h" color="#238636" />
        <KPICard icon={Truck} title="KM Totales" value={Math.round(data.kmTotales).toLocaleString('es-AR')} unit="km" color="#8b949e" />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #21262d' }}>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white">Pendientes de aprobación</h2>
            {data.pendientes > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#9e6a03', color: 'white' }}>{data.pendientes}</span>
            )}
          </div>
          <Link href="/auditor/aprobaciones" className="text-sm" style={{ color: '#1d6fb8' }}>Ver todos →</Link>
        </div>
        {data.ultimosPendientes.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: '#238636' }} />
            <p className="text-white font-medium">Todo al día</p>
            <p className="text-sm" style={{ color: '#8b949e' }}>No hay registros pendientes de aprobación</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#21262d' }}>
            {data.ultimosPendientes.map((r: any) => (
              <Link
                key={r._id.toString()}
                href={`/auditor/aprobaciones/${r._id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#1c2128] transition-colors block"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {r.proyectoNombre || '—'} — {r.clienteNombre || '—'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
                    {format(new Date(r.fecha), 'dd/MM/yyyy', { locale: es })} · {r.encargadoNombre || '—'} · {r.tipoProyecto || r.estadoActividad}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <StatusBadge status={r.status as RegistroStatus} />
                  <span style={{ color: '#8b949e', fontSize: 18 }}>›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
