'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft, MapPin, Clock, Truck, Users } from 'lucide-react';
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

export default function JefeRegistroDetailPage() {
  const { id } = useParams();
  const [registro, setRegistro] = useState<IRegistro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/registros/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setRegistro(res.data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#1d6fb8' }} />
      </div>
    );
  }

  if (!registro) return <div className="p-6 text-white">Registro no encontrado</div>;

  const esTaller = registro.trabajoRealizadoEn === 'taller';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/jefe/mis-registros" className="p-2 rounded-lg hover:bg-[#21262d] transition-colors">
          <ArrowLeft className="w-5 h-5" style={{ color: '#8b949e' }} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">
              {registro.proyectoNombre || registro.tipoProyecto || 'Registro'}
            </h1>
            <StatusBadge status={registro.status as RegistroStatus} />
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#8b949e' }}>
            {registro.clienteNombre || (esTaller ? 'Taller' : '—')} · {registro.fecha ? format(new Date(registro.fecha), 'dd MMMM yyyy', { locale: es }) : '—'}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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

      {/* Motivo de rechazo destacado */}
      {registro.status === 'rechazado' && registro.rechazadoMotivo && (
        <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: 'rgba(218,54,51,0.1)', border: '1px solid rgba(218,54,51,0.3)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#f85149' }}>Motivo de rechazo</p>
          <p className="text-sm text-white">{registro.rechazadoMotivo}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b949e' }}>Jornada</h3>
          <DetailRow label="Fecha" value={registro.fecha ? format(new Date(registro.fecha), 'dd/MM/yyyy', { locale: es }) : '—'} />
          <DetailRow label="Trabajo realizado en" value={esTaller ? 'Taller' : 'Campo'} />
          <DetailRow label="Estado actividad" value={registro.estadoActividad} />
          {!esTaller && <DetailRow label="Llegó al mástil" value={registro.llego_al_mastil === 'si' ? 'Sí' : 'No'} />}
          {!esTaller && <DetailRow label="Cliente" value={registro.clienteNombre} />}
          {!esTaller && <DetailRow label="Proyecto / Mástil" value={registro.proyectoNombre} />}
          <DetailRow label={esTaller ? 'Lugar del taller' : 'Tipo de tarea'} value={registro.tipoProyecto} />
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
          {!esTaller && (
            <>
              <DetailRow label="Vehículo" value={registro.vehiculoPatente} />
              <DetailRow label="KM inicial" value={registro.kmInicial} />
              <DetailRow label="KM final" value={registro.kmFinal} />
              <DetailRow label="KM recorridos" value={registro.kmRecorridos} />
            </>
          )}
        </div>

        <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b949e' }}>Horarios</h3>
          {esTaller ? (
            <>
              <DetailRow label="Ingreso al taller" value={registro.horaInicio} />
              <DetailRow label="Salida del taller" value={registro.horaFin} />
            </>
          ) : (
            <>
              <DetailRow label="Inicio (salida hotel)" value={registro.horaInicio} />
              <DetailRow label="Inicio campo (llegada mástil)" value={registro.horaInicioField} />
              <DetailRow label="Fin campo (salida mástil)" value={registro.horaFinField} />
              <DetailRow label="Finalización (llegada hotel)" value={registro.horaFin} />
              <DetailRow label="Hospedaje" value={registro.hospedaje} />
            </>
          )}
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
    </div>
  );
}
