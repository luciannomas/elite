import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Registro from '@/models/Registro';
import KPICard from '@/components/dashboard/KPICard';
import StatusBadge from '@/components/registros/StatusBadge';
import { Clock, CheckCircle, XCircle, Activity, MapPin, Truck, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RegistroStatus } from '@/types';

export default async function AuditorDashboard() {
  await getServerSession(authOptions);

  let pendientes = 0, aprobados = 0, rechazados = 0;
  let ultimosPendientes: any[] = [];
  let k = { hhTotales: 0, hhCampo: 0, kmTotales: 0, total: 0 };

  try {
    await connectDB();
    const [p, a, r, u, kpis] = await Promise.all([
      Registro.countDocuments({ status: 'pre_aprobado' }),
      Registro.countDocuments({ status: 'aprobado' }),
      Registro.countDocuments({ status: 'rechazado' }),
      Registro.find({ status: 'pre_aprobado' }).sort({ createdAt: -1 }).limit(6).lean(),
      Registro.aggregate([
        { $match: { status: 'aprobado', excluirDeMetricas: { $ne: true } } },
        { $group: { _id: null, hhTotales: { $sum: '$horasTotalesDec' }, hhCampo: { $sum: '$horasSitioDec' }, kmTotales: { $sum: '$kmRecorridos' }, total: { $sum: 1 } } },
      ]),
    ]);
    pendientes = p; aprobados = a; rechazados = r; ultimosPendientes = u;
    k = kpis[0] || k;
  } catch { /* sin DB — muestra ceros */ }

  const productividad = k.hhTotales > 0 ? Math.round((k.hhCampo / k.hhTotales) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Panel de control operativo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard icon={Clock} title="Pendientes de aprobación" value={pendientes} color="#9e6a03" subtitle="Requieren revisión" />
        <KPICard icon={CheckCircle} title="Aprobados" value={aprobados} color="#238636" />
        <KPICard icon={XCircle} title="Rechazados" value={rechazados} color="#da3633" />
        <KPICard icon={Activity} title="Productividad" value={`${productividad}%`} color="#1d6fb8" subtitle="HH campo / HH totales" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <KPICard icon={Users} title="HH Totales aprobadas" value={Math.round(k.hhTotales * 10) / 10} unit="h" color="#1d6fb8" />
        <KPICard icon={TrendingUp} title="HH en Campo" value={Math.round(k.hhCampo * 10) / 10} unit="h" color="#238636" />
        <KPICard icon={Truck} title="KM Totales" value={Math.round(k.kmTotales).toLocaleString('es-AR')} unit="km" color="#8b949e" />
      </div>

      {/* Pendientes */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #21262d' }}>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white">Pendientes de aprobación</h2>
            {pendientes > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#9e6a03', color: 'white' }}>{pendientes}</span>
            )}
          </div>
          <Link href="/auditor/aprobaciones" className="text-sm" style={{ color: '#1d6fb8' }}>Ver todos →</Link>
        </div>
        {ultimosPendientes.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: '#238636' }} />
            <p className="text-white font-medium">Todo al día</p>
            <p className="text-sm" style={{ color: '#8b949e' }}>No hay registros pendientes de aprobación</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#21262d' }}>
            {ultimosPendientes.map((r: any) => (
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
