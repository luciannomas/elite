import connectDB from '@/lib/mongodb';
import Registro from '@/models/Registro';
import StatusBadge from '@/components/registros/StatusBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import type { RegistroStatus } from '@/types';
import { ChevronRight } from 'lucide-react';

export default async function AprobacionesPage() {
  let pendientes: any[] = [];
  try {
    await connectDB();
    pendientes = await Registro.find({ status: 'pre_aprobado' })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name')
      .lean();
  } catch { /* sin DB */ }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Aprobaciones</h1>
        <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
          {pendientes.length} registro{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''} de revisión
        </p>
      </div>

      {pendientes.length === 0 ? (
        <div className="rounded-xl py-16 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <p className="text-white font-medium">Todo al día ✓</p>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>No hay registros pendientes</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <div className="divide-y" style={{ borderColor: '#21262d' }}>
            {pendientes.map((r: any) => (
              <Link
                key={r._id.toString()}
                href={`/auditor/aprobaciones/${r._id}`}
                className="flex items-start justify-between px-5 py-4 hover:bg-[#1c2128] transition-colors gap-3"
              >
                <div className="flex-1 min-w-0">
                  {/* Fila 1: título + badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white leading-snug">
                      {r.proyectoNombre || '—'} — {r.clienteNombre || '—'}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: '#21262d', color: '#8b949e' }}>
                      {r.trabajoRealizadoEn === 'campo' ? 'Campo' : 'Taller'}
                    </span>
                    {/* StatusBadge visible solo en mobile, dentro del contenido */}
                    <span className="sm:hidden shrink-0">
                      <StatusBadge status={r.status as RegistroStatus} />
                    </span>
                  </div>
                  {/* Fila 2: metadata */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs" style={{ color: '#8b949e' }}>
                    <span>{format(new Date(r.fecha), 'dd MMM yyyy', { locale: es })}</span>
                    <span>·</span>
                    <span>{r.tipoProyecto || r.estadoActividad}</span>
                    <span>·</span>
                    <span>Enc: {r.encargadoNombre || '—'}</span>
                    {r.horasTotalesDec && <><span>·</span><span>{r.horasTotalesDec}h</span></>}
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#8b949e' }}>
                    Por: {(r.submittedBy as any)?.name || '—'} · {format(new Date(r.createdAt), 'dd/MM HH:mm', { locale: es })}
                  </p>
                </div>
                {/* Derecha: badge + chevron — oculto en mobile, visible en sm+ */}
                <div className="hidden sm:flex items-center gap-3 shrink-0 mt-0.5">
                  <StatusBadge status={r.status as RegistroStatus} />
                  <ChevronRight className="w-4 h-4" style={{ color: '#8b949e' }} />
                </div>
                {/* Chevron solo en mobile */}
                <ChevronRight className="sm:hidden w-4 h-4 shrink-0 mt-1" style={{ color: '#8b949e' }} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
