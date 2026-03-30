'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X, Loader2, ArrowLeft, MapPin, Clock, Truck, Users, RotateCcw } from 'lucide-react';
import StatusBadge from '@/components/registros/StatusBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { IRegistro, RegistroStatus } from '@/types';
import Link from 'next/link';

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2.5" style={{ borderBottom: '1px solid #21262d' }}>
      <span className="text-sm" style={{ color: '#8b949e' }}>{label}</span>
      <span className="text-sm text-white font-medium text-right max-w-xs">{value}</span>
    </div>
  );
}

export default function AprobacionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [registro, setRegistro] = useState<IRegistro | null>(null);
  const [loading, setLoading] = useState(true);
  const [motivo, setMotivo] = useState('');
  const [acting, setActing] = useState<'aprobar' | 'rechazar' | 'revertir' | null>(null);

  useEffect(() => {
    fetch(`/api/registros/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setRegistro(res.data);
        setLoading(false);
      });
  }, [id]);

  async function handleAction(action: 'aprobar' | 'rechazar' | 'revertir') {
    if (action === 'rechazar' && !motivo.trim()) {
      toast.error('Ingresá el motivo del rechazo');
      return;
    }
    setActing(action);
    const res = await fetch(`/api/registros/${id}/aprobar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, motivo }),
    });
    const json = await res.json();
    if (json.success) {
      const newStatus = action === 'aprobar' ? 'aprobado' : action === 'rechazar' ? 'rechazado' : 'pre_aprobado';
      setRegistro(prev => prev ? {
        ...prev,
        status: newStatus as any,
        rechazadoMotivo: action === 'rechazar' ? motivo : undefined,
        approvedAt: action === 'aprobar' ? new Date().toISOString() : undefined,
      } : null);
      setMotivo('');
      const msgs = { aprobar: 'Registro aprobado ✓', rechazar: 'Registro rechazado', revertir: 'Revertido a pendiente' };
      toast.success(msgs[action]);
      setActing(null);
      if (action !== 'revertir') setTimeout(() => router.push('/auditor/aprobaciones'), 1500);
    } else {
      toast.error(json.error || 'Error al procesar');
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1d6fb8' }} />
      </div>
    );
  }

  if (!registro) return <div className="p-6 text-white">Registro no encontrado</div>;

  const canAct = true; // auditor puede actuar sobre cualquier estado

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/auditor/aprobaciones" className="p-2 rounded-lg hover:bg-[#21262d] transition-colors">
          <ArrowLeft className="w-5 h-5" style={{ color: '#8b949e' }} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{registro.proyectoNombre || 'Sin proyecto'}</h1>
            <StatusBadge status={registro.status as RegistroStatus} />
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#8b949e' }}>
            {registro.clienteNombre} · {registro.fecha ? format(new Date(registro.fecha), 'dd MMMM yyyy', { locale: es }) : '—'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Clock, label: 'HH Totales', val: `${registro.horasTotalesDec || 0}h` },
              { icon: MapPin, label: 'HH Campo', val: `${registro.horasSitioDec || 0}h` },
              { icon: Truck, label: 'KM Recorridos', val: `${registro.kmRecorridos || 0}` },
              { icon: Users, label: 'Personas', val: `${registro.nPersonas || 0}` },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="rounded-lg p-3 text-center" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: '#8b949e' }} />
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="text-xs" style={{ color: '#8b949e' }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b949e' }}>Jornada</h3>
            <DetailRow label="Fecha" value={registro.fecha ? format(new Date(registro.fecha), 'dd/MM/yyyy', { locale: es }) : '—'} />
            <DetailRow label="Trabajo realizado en" value={registro.trabajoRealizadoEn === 'campo' ? 'Campo' : 'Taller'} />
            <DetailRow label="Estado actividad" value={registro.estadoActividad} />
            <DetailRow label="Llegó al mástil" value={registro.llego_al_mastil === 'si' ? 'Sí' : 'No'} />
            <DetailRow label="Cliente" value={registro.clienteNombre} />
            <DetailRow label="Proyecto / Mástil" value={registro.proyectoNombre} />
            <DetailRow label="Tipo de tarea" value={registro.tipoProyecto} />
            <DetailRow label="OV Odoo" value={registro.ovOdoo} />
          </div>

          <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b949e' }}>Tareas</h3>
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{registro.tareaTexto || '—'}</p>
          </div>

          <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b949e' }}>Personal y Vehículo</h3>
            <DetailRow label="Encargado" value={registro.encargadoNombre} />
            {registro.personalACargo && (
              <div style={{ borderBottom: '1px solid #21262d', paddingTop: 10, paddingBottom: 10 }}>
                <span className="text-sm" style={{ color: '#8b949e' }}>Personal a cargo</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {registro.personalACargo.split(',').map(p => p.trim()).filter(Boolean).map(nombre => (
                    <span key={nombre} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#21262d', color: '#e6edf3', border: '1px solid #30363d' }}>
                      {nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <DetailRow label="Nº personas" value={registro.nPersonas} />
            <DetailRow label="Vehículo" value={registro.vehiculoPatente} />
            <DetailRow label="KM inicial" value={registro.kmInicial} />
            <DetailRow label="KM final" value={registro.kmFinal} />
            <DetailRow label="KM recorridos" value={registro.kmRecorridos} />
          </div>

          <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b949e' }}>Horarios</h3>
            <DetailRow label="Inicio (salida hotel)" value={registro.horaInicio} />
            <DetailRow label="Inicio campo (llegada mástil)" value={registro.horaInicioField} />
            <DetailRow label="Fin campo (salida mástil)" value={registro.horaFinField} />
            <DetailRow label="Finalización (llegada hotel)" value={registro.horaFin} />
            <DetailRow label="Hospedaje" value={registro.hospedaje} />
          </div>

          {(registro.standByHoras ?? 0) > 0 && (
            <div className="rounded-xl px-5 py-4" style={{ backgroundColor: 'rgba(158,106,3,0.08)', border: '1px solid rgba(158,106,3,0.3)' }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#f0a500' }}>Stand-By</h3>
              <DetailRow label="Horas" value={registro.standByHoras} />
              <DetailRow label="Categoría" value={registro.standByCategoria} />
              <DetailRow label="Detalle" value={registro.standByDetalle} />
            </div>
          )}

          {registro.observaciones && (
            <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#8b949e' }}>Observaciones</h3>
              <p className="text-sm text-white">{registro.observaciones}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-5 sticky top-6 space-y-3" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white">Acción de revisión</h3>
              <StatusBadge status={registro.status as RegistroStatus} />
            </div>

            {/* Aprobar — visible si no está aprobado */}
            {registro.status !== 'aprobado' && (
              <button
                onClick={() => handleAction('aprobar')}
                disabled={acting !== null}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#238636' }}
              >
                {acting === 'aprobar' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Aprobar registro
              </button>
            )}

            {/* Motivo + Rechazar — visible si no está rechazado */}
            {registro.status !== 'rechazado' && (
              <div style={{ borderTop: '1px solid #21262d', paddingTop: 12 }}>
                <label className="block text-sm mb-2" style={{ color: '#8b949e' }}>Motivo de rechazo</label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Explicá el motivo del rechazo..."
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white resize-none mb-3"
                  style={{ backgroundColor: '#21262d', border: '1px solid #30363d', outline: 'none' }}
                />
                <button
                  onClick={() => handleAction('rechazar')}
                  disabled={acting !== null}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                  style={{ backgroundColor: 'rgba(218,54,51,0.15)', color: '#f85149', border: '1px solid rgba(218,54,51,0.3)' }}
                >
                  {acting === 'rechazar' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Rechazar registro
                </button>
              </div>
            )}

            {/* Revertir a pendiente — visible si ya fue procesado */}
            {registro.status !== 'pre_aprobado' && (
              <div style={{ borderTop: '1px solid #21262d', paddingTop: 12 }}>
                <button
                  onClick={() => handleAction('revertir')}
                  disabled={acting !== null}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                  style={{ backgroundColor: 'rgba(139,148,158,0.1)', color: '#8b949e', border: '1px solid #30363d' }}
                >
                  {acting === 'revertir' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Revertir a pendiente
                </button>
              </div>
            )}

            {/* Info de estado actual */}
            {registro.approvedAt && registro.status !== 'pre_aprobado' && (
              <p className="text-xs pt-1" style={{ color: '#8b949e' }}>
                {registro.status === 'aprobado' ? 'Aprobado' : 'Rechazado'} el {format(new Date(registro.approvedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
            )}
            {registro.rechazadoMotivo && registro.status === 'rechazado' && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(218,54,51,0.1)', border: '1px solid rgba(218,54,51,0.2)' }}>
                <p className="text-xs" style={{ color: '#f85149' }}>Motivo: {registro.rechazadoMotivo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
