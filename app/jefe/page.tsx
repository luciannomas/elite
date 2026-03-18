import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ClipboardList, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import connectDB from '@/lib/mongodb';
import Registro from '@/models/Registro';
import { mockRegistros } from '@/lib/mock-data';
import StatusBadge from '@/components/registros/StatusBadge';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RegistroStatus } from '@/types';

export default async function JefeDashboard() {
  const session = await getServerSession(authOptions);

  const mockUltimos = mockRegistros.slice(0, 5);
  let total = mockRegistros.length;
  let pendientes = mockRegistros.filter(r => r.status === 'pre_aprobado').length;
  let aprobados = mockRegistros.filter(r => r.status === 'aprobado').length;
  let rechazados = mockRegistros.filter(r => r.status === 'rechazado').length;
  let ultimos: any[] = mockUltimos;

  try {
    await connectDB();
    const [t, p, a, r, u] = await Promise.all([
      Registro.countDocuments({ submittedBy: session?.user.id }),
      Registro.countDocuments({ submittedBy: session?.user.id, status: 'pre_aprobado' }),
      Registro.countDocuments({ submittedBy: session?.user.id, status: 'aprobado' }),
      Registro.countDocuments({ submittedBy: session?.user.id, status: 'rechazado' }),
      Registro.find({ submittedBy: session?.user.id }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    total = t; pendientes = p; aprobados = a; rechazados = r; ultimos = u;
  } catch { /* sin DB — usa mock */ }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Bienvenido, {session?.user.name?.split(' ')[0]}</h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Panel de carga de jornadas</p>
        </div>
        <Link
          href="/jefe/nueva-jornada"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: '#1d6fb8' }}
        >
          <Plus className="w-4 h-4" />
          Nueva Jornada
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard icon={ClipboardList} title="Total enviados" value={total} color="#1d6fb8" />
        <KPICard icon={Clock} title="Pendientes" value={pendientes} color="#9e6a03" subtitle="Esperando aprobación" />
        <KPICard icon={CheckCircle} title="Aprobados" value={aprobados} color="#238636" />
        <KPICard icon={XCircle} title="Rechazados" value={rechazados} color="#da3633" />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #21262d' }}>
          <h2 className="font-semibold text-white">Últimas jornadas</h2>
          <Link href="/jefe/mis-registros" className="text-sm" style={{ color: '#1d6fb8' }}>Ver todos →</Link>
        </div>
        {ultimos.length === 0 ? (
          <div className="px-5 py-10 text-center" style={{ color: '#8b949e' }}>
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Aún no cargaste jornadas</p>
            <Link href="/jefe/nueva-jornada" className="text-sm mt-2 inline-block" style={{ color: '#1d6fb8' }}>Cargar primera jornada →</Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#21262d' }}>
            {ultimos.map((r: any) => (
              <div key={r._id.toString()} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {r.proyectoNombre || 'Sin proyecto'} — {r.clienteNombre || 'Sin cliente'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
                    {format(new Date(r.fecha), "dd MMM yyyy", { locale: es })} · {r.tipoProyecto || r.estadoActividad}
                  </p>
                </div>
                <StatusBadge status={r.status as RegistroStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
