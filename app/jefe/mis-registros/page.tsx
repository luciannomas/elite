import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Registro from '@/models/Registro';
import StatusBadge from '@/components/registros/StatusBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RegistroStatus } from '@/types';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default async function MisRegistrosPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const registros = await Registro.find({ submittedBy: session?.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Registros</h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>{registros.length} jornadas cargadas</p>
        </div>
        <Link
          href="/jefe/nueva-jornada"
          className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#1d6fb8' }}
        >
          + Nueva Jornada
        </Link>
      </div>

      {registros.length === 0 ? (
        <div className="rounded-xl py-16 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: '#8b949e' }} />
          <p className="text-white font-medium">Sin registros</p>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Cargá tu primera jornada</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #21262d' }}>
                {['Fecha', 'Proyecto / Cliente', 'Tipo', 'Encargado', 'HH', 'Estado'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#21262d' }}>
              {registros.map((r: any) => (
                <tr key={r._id.toString()} className="hover:bg-[#1c2128] transition-colors">
                  <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
                    {format(new Date(r.fecha), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{r.proyectoNombre || '—'}</p>
                    <p className="text-xs" style={{ color: '#8b949e' }}>{r.clienteNombre || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#8b949e' }}>{r.tipoProyecto || r.estadoActividad || '—'}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#8b949e' }}>{r.encargadoNombre || '—'}</td>
                  <td className="px-4 py-3 text-sm text-white">{r.horasTotalesDec ? `${r.horasTotalesDec}h` : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status as RegistroStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
