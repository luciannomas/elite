'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react';

type CatalogData = {
  clientes: { _id: string; nombre: string }[];
  proyectos: { _id: string; nombre: string; clienteNombre: string }[];
  personal: { _id: string; nombre: string }[];
  vehiculos: { _id: string; patente: string }[];
  tiposProyecto: string[];
  categoriasStandBy: string[];
};

const initialData = {
  fecha: new Date().toISOString().split('T')[0],
  trabajoRealizadoEn: 'campo' as 'campo' | 'taller',
  estadoActividad: 'Productivo',
  llego_al_mastil: 'si',
  clienteNombre: '',
  proyectoNombre: '',
  tipoProyecto: '',
  tareaTexto: '',
  ovOdoo: '',
  excluirDeMetricas: false,
  encargadoNombre: '',
  personalACargo: '',
  vehiculoPatente: '',
  kmInicial: '',
  kmFinal: '',
  standByHoras: '',
  standByCategoria: '',
  standByDetalle: '',
  horaInicio: '08:00',
  horaInicioField: '',
  horaFinField: '',
  horaFin: '',
  hospedaje: '',
  observaciones: '',
};

const labelStyle = { color: '#8b949e', fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' };

function getInputStyle(error?: boolean) {
  return {
    backgroundColor: '#21262d',
    border: `1px solid ${error ? '#da3633' : '#30363d'}`,
    borderRadius: 8,
    color: 'white',
    padding: '10px 12px',
    width: '100%',
    fontSize: 14,
    outline: 'none',
  };
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={labelStyle}>
      {children}{required && <span style={{ color: '#da3633', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ color: '#da3633', fontSize: 12, marginTop: 4 }}>{msg}</p>;
}

function SelectField({ label, value, onChange, options, placeholder, required, error }: any) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...getInputStyle(!!error), appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b949e' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        <option value="">{placeholder || 'Seleccionar...'}</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ErrorMsg msg={error} />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type = 'text', required, error }: any) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={getInputStyle(!!error)}
        onFocus={e => { e.target.style.borderColor = error ? '#da3633' : '#1d6fb8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,111,184,0.15)'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#da3633' : '#30363d'; e.target.style.boxShadow = 'none'; }}
      />
      <ErrorMsg msg={error} />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, required, error }: any) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{ ...getInputStyle(!!error), resize: 'vertical' }}
        onFocus={e => { e.target.style.borderColor = error ? '#da3633' : '#1d6fb8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,111,184,0.15)'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#da3633' : '#30363d'; e.target.style.boxShadow = 'none'; }}
      />
      <ErrorMsg msg={error} />
    </div>
  );
}

const TALLER_OPCIONES = ['Taller San José', 'Taller Madryn', 'Proyecto Integra'];

function validateStep(step: number, data: typeof initialData, esTaller: boolean): Record<string, string> {
  const errs: Record<string, string> = {};
  if (esTaller) {
    if (step === 0) {
      if (!data.fecha) errs.fecha = 'La fecha es obligatoria';
      if (!data.tipoProyecto) errs.tipoProyecto = 'Seleccioná el lugar del taller';
      if (!data.tareaTexto.trim()) errs.tareaTexto = 'Describí las tareas realizadas';
    }
    if (step === 1) {
      if (!data.horaInicio) errs.horaInicio = 'La hora de entrada es obligatoria';
      if (!data.horaFin) errs.horaFin = 'La hora de salida es obligatoria';
    }
  } else {
    if (step === 0) {
      if (!data.fecha) errs.fecha = 'La fecha es obligatoria';
      if (!data.clienteNombre) errs.clienteNombre = 'Seleccioná un cliente';
      if (!data.tipoProyecto) errs.tipoProyecto = 'Seleccioná el tipo de tarea';
      if (!data.tareaTexto.trim()) errs.tareaTexto = 'Describí las tareas realizadas';
    }
    if (step === 1) {
      if (!data.encargadoNombre) errs.encargadoNombre = 'Seleccioná el encargado de cuadrilla';
      if (data.estadoActividad === 'Stand-by') {
        if (!data.standByHoras) errs.standByHoras = 'Ingresá las horas de Stand-By';
        if (!data.standByCategoria) errs.standByCategoria = 'Seleccioná la categoría';
      }
      if (data.kmInicial && data.kmFinal && parseFloat(data.kmFinal) < parseFloat(data.kmInicial)) {
        errs.kmFinal = 'El KM final no puede ser menor al KM inicial';
      }
    }
    if (step === 2) {
      if (!data.horaInicio) errs.horaInicio = 'La hora de inicio es obligatoria';
      if (!data.horaFin) errs.horaFin = 'La hora de finalización es obligatoria';
    }
  }
  return errs;
}

function calcHoras(inicio: string, fin: string): string {
  if (!inicio || !fin) return '—';
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  return ((h2 * 60 + m2 - (h1 * 60 + m1)) / 60).toFixed(1);
}

export default function NuevaJornadaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [kmLoading, setKmLoading] = useState(false);
  const [personalSearch, setPersonalSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const esTaller = data.trabajoRealizadoEn === 'taller';
  const STEPS = esTaller
    ? ['Taller', 'Horarios']
    : ['Jornada', 'Personal y Vehículo', 'Tiempos y Notas'];

  const set = (key: string) => (val: any) => {
    setData(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  function switchTipo(op: 'campo' | 'taller') {
    setData(prev => ({ ...prev, trabajoRealizadoEn: op }));
    setStep(0);
    setErrors({});
  }

  useEffect(() => {
    const cached = localStorage.getItem('elite_catalog');
    const ts = localStorage.getItem('elite_catalog_ts');
    if (cached && ts && Date.now() - parseInt(ts) < 86400000) {
      const parsed = JSON.parse(cached);
      if (parsed?.personal?.length > 0 && parsed?.clientes?.length > 0 && parsed?.vehiculos?.length > 0) {
        setCatalog(parsed);
        setCatalogLoading(false);
        return;
      }
      localStorage.removeItem('elite_catalog');
      localStorage.removeItem('elite_catalog_ts');
    }
    fetch('/api/catalogo')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setCatalog(res.data);
          localStorage.setItem('elite_catalog', JSON.stringify(res.data));
          localStorage.setItem('elite_catalog_ts', Date.now().toString());
        }
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  const filteredProyectos = catalog?.proyectos.filter(p =>
    !data.clienteNombre || p.clienteNombre === data.clienteNombre
  ) || [];

  const personalSeleccionado = data.personalACargo
    ? data.personalACargo.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  function togglePersonal(nombre: string) {
    const current = personalSeleccionado;
    if (current.includes(nombre)) {
      set('personalACargo')(current.filter(n => n !== nombre).join(', '));
    } else {
      set('personalACargo')([...current, nombre].join(', '));
    }
  }

  const isStandBy = data.estadoActividad === 'Stand-by';

  function handleNext() {
    const errs = validateStep(step, data, esTaller);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Completá los campos obligatorios antes de continuar');
      return;
    }
    setErrors({});
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    const lastStep = esTaller ? 1 : 2;
    const errs = validateStep(lastStep, data, esTaller);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Completá los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      const responsableNombre = session?.user?.name || session?.user?.email || '';
      const payload = {
        ...data,
        encargadoNombre: esTaller ? responsableNombre : data.encargadoNombre,
        kmInicial: data.kmInicial ? parseFloat(data.kmInicial) : undefined,
        kmFinal: data.kmFinal ? parseFloat(data.kmFinal) : undefined,
        standByHoras: data.standByHoras ? parseFloat(data.standByHoras) : undefined,
        nPersonas: esTaller ? 1 : personalSeleccionado.length + 1,
      };
      const res = await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('Jornada enviada correctamente. Queda pendiente de aprobación.');
      router.push('/jefe/mis-registros');
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message);
      setLoading(false);
    }
  }

  const cardStyle = { backgroundColor: '#161b22', border: '1px solid #21262d', borderRadius: 16, padding: 24 };

  // Toggle campo/taller — shared across all step 0 renders
  const TipoToggle = (
    <div>
      <FieldLabel required>Trabajo realizado en</FieldLabel>
      <div className="flex gap-2">
        {(['campo', 'taller'] as const).map(op => (
          <button
            key={op}
            onClick={() => switchTipo(op)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              backgroundColor: data.trabajoRealizadoEn === op ? '#1d6fb8' : '#21262d',
              color: data.trabajoRealizadoEn === op ? 'white' : '#8b949e',
              border: `1px solid ${data.trabajoRealizadoEn === op ? '#1d6fb8' : '#30363d'}`,
            }}
          >
            {op.charAt(0).toUpperCase() + op.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nueva Jornada</h1>
        <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Completá el formulario paso a paso</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: i < step ? '#238636' : i === step ? '#1d6fb8' : '#21262d',
                  color: i <= step ? 'white' : '#8b949e',
                }}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-sm hidden sm:block" style={{ color: i === step ? 'white' : '#8b949e', fontWeight: i === step ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-0.5 mx-1" style={{ backgroundColor: i < step ? '#238636' : '#21262d' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── TALLER STEP 0 ── */}
      {step === 0 && esTaller && (
        <div style={cardStyle} className="space-y-5">
          <h2 className="text-lg font-semibold text-white mb-2">Información de la Jornada</h2>

          <TextField label="Fecha" value={data.fecha} onChange={set('fecha')} type="date" required error={errors.fecha} />

          {TipoToggle}

          <SelectField
            label="Lugar del taller" value={data.tipoProyecto} onChange={set('tipoProyecto')}
            options={TALLER_OPCIONES}
            placeholder="Seleccionar..."
            required error={errors.tipoProyecto}
          />

          <TextAreaField
            label="Descripción de las tareas realizadas" value={data.tareaTexto} onChange={set('tareaTexto')}
            placeholder="Describí las tareas realizadas en el taller..." required error={errors.tareaTexto}
          />

          <div>
            <FieldLabel>Persona responsable</FieldLabel>
            <div
              className="px-3 py-2.5 rounded-lg text-sm"
              style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: 'white' }}
            >
              {session?.user?.name || session?.user?.email || 'Usuario actual'}
            </div>
            <p className="text-xs mt-1" style={{ color: '#8b949e' }}>Se registra automáticamente con tu usuario</p>
          </div>
        </div>
      )}

      {/* ── TALLER STEP 1 — Horarios ── */}
      {step === 1 && esTaller && (
        <div style={cardStyle} className="space-y-5">
          <h2 className="text-lg font-semibold text-white mb-2">Horarios</h2>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Hora de entrada" value={data.horaInicio} onChange={set('horaInicio')} type="time" required error={errors.horaInicio} />
            <TextField label="Hora de salida" value={data.horaFin} onChange={set('horaFin')} type="time" required error={errors.horaFin} />
          </div>

          {data.horaInicio && data.horaFin && (
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(29,111,184,0.1)', border: '1px solid rgba(29,111,184,0.3)' }}>
              <div>
                <p className="text-xs" style={{ color: '#8b949e' }}>Horas trabajadas</p>
                <p className="text-2xl font-bold text-white">{calcHoras(data.horaInicio, data.horaFin)}h</p>
              </div>
            </div>
          )}

          <TextAreaField label="Observaciones (opcional)" value={data.observaciones} onChange={set('observaciones')} placeholder="Cualquier novedad o comentario adicional..." />

          {/* Summary */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#0f1117', border: '1px solid #21262d' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b949e' }}>Resumen</p>
            {[
              ['Fecha', data.fecha],
              ['Lugar', 'Taller'],
              ['Tipo de tarea', data.tipoProyecto || '—'],
              ['Responsable', session?.user?.name || session?.user?.email || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: '#8b949e' }}>{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CAMPO STEP 0 ── */}
      {step === 0 && !esTaller && (
        <div style={cardStyle} className="space-y-5">
          <h2 className="text-lg font-semibold text-white mb-2">Información de la Jornada</h2>

          <TextField label="Fecha" value={data.fecha} onChange={set('fecha')} type="date" required error={errors.fecha} />

          {TipoToggle}

          <SelectField
            label="Estado de actividad" value={data.estadoActividad} onChange={set('estadoActividad')}
            options={['Productivo', 'Stand-by', 'Viaje', 'Administrativo']} required
          />

          <SelectField
            label="¿La cuadrilla llegó al mástil?" value={data.llego_al_mastil} onChange={set('llego_al_mastil')}
            options={['si', 'no']}
          />

          <SelectField
            label="Cliente" value={data.clienteNombre}
            onChange={(v: string) => { set('clienteNombre')(v); set('proyectoNombre')(''); }}
            options={catalog?.clientes.map(c => c.nombre) || []}
            placeholder={catalogLoading ? 'Cargando...' : 'Seleccionar cliente...'}
            required error={errors.clienteNombre}
          />

          <div>
            <FieldLabel>Nombre del mástil / Proyecto</FieldLabel>
            <select
              value={data.proyectoNombre}
              onChange={e => set('proyectoNombre')(e.target.value)}
              style={{ ...getInputStyle(), appearance: 'none' }}
              disabled={catalogLoading}
            >
              <option value="">{catalogLoading ? 'Cargando...' : 'Seleccionar proyecto...'}</option>
              {filteredProyectos.map(p => (
                <option key={p._id} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <SelectField
            label="Tipo de tarea realizada" value={data.tipoProyecto} onChange={set('tipoProyecto')}
            options={catalog?.tiposProyecto || []}
            placeholder={catalogLoading ? 'Cargando...' : 'Seleccionar...'}
            required error={errors.tipoProyecto}
          />

          <TextAreaField
            label="Descripción de las tareas realizadas" value={data.tareaTexto} onChange={set('tareaTexto')}
            placeholder="Describí las tareas realizadas en la jornada..." required error={errors.tareaTexto}
          />
        </div>
      )}

      {/* ── CAMPO STEP 1 — Personal y Vehículo ── */}
      {step === 1 && !esTaller && (
        <div style={cardStyle} className="space-y-5">
          <h2 className="text-lg font-semibold text-white mb-2">Personal y Vehículo</h2>

          {catalogLoading ? (
            <div className="flex items-center gap-2 py-4" style={{ color: '#8b949e' }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Cargando personal...</span>
            </div>
          ) : (
            <>
              <SelectField
                label="Encargado de cuadrilla" value={data.encargadoNombre} onChange={set('encargadoNombre')}
                options={catalog?.personal.map(p => p.nombre) || []} placeholder="Seleccionar encargado..."
                required error={errors.encargadoNombre}
              />

              <div>
                <FieldLabel>Personal a cargo</FieldLabel>
                <input
                  type="text"
                  placeholder="Buscar personal..."
                  value={personalSearch}
                  onChange={e => setPersonalSearch(e.target.value)}
                  style={{ ...getInputStyle(), marginBottom: 8 }}
                />
                {personalSeleccionado.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {personalSeleccionado.map(nombre => (
                      <span
                        key={nombre}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'rgba(29,111,184,0.2)', color: '#58a6ff', border: '1px solid rgba(29,111,184,0.3)' }}
                      >
                        {nombre}
                        <button onClick={() => togglePersonal(nombre)} className="opacity-70 hover:opacity-100">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="rounded-lg overflow-hidden max-h-44 overflow-y-auto" style={{ border: '1px solid #30363d' }}>
                  {(catalog?.personal || [])
                    .filter(p => !personalSearch || p.nombre.toLowerCase().includes(personalSearch.toLowerCase()))
                    .filter(p => p.nombre !== data.encargadoNombre)
                    .map(p => (
                      <button
                        key={p._id}
                        onClick={() => togglePersonal(p.nombre)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left transition-colors hover:bg-[#1c2128]"
                        style={{ color: personalSeleccionado.includes(p.nombre) ? '#58a6ff' : '#e6edf3', borderBottom: '1px solid #21262d' }}
                      >
                        {p.nombre}
                        {personalSeleccionado.includes(p.nombre) && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}

          <SelectField
            label="Vehículo" value={data.vehiculoPatente}
            onChange={async (patente: string) => {
              set('vehiculoPatente')(patente);
              set('kmInicial')('');
              if (!patente) return;
              setKmLoading(true);
              try {
                const res = await fetch(`/api/registros/ultimo-km?patente=${encodeURIComponent(patente)}`);
                const json = await res.json();
                if (json.success && json.kmFinal) set('kmInicial')(String(json.kmFinal));
              } catch {}
              finally { setKmLoading(false); }
            }}
            options={catalog?.vehiculos.map(v => v.patente) || []}
            placeholder={catalogLoading ? 'Cargando...' : 'Seleccionar vehículo...'}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <TextField
                label="KM inicial (odómetro)"
                value={data.kmInicial}
                onChange={set('kmInicial')}
                type="number"
                placeholder={kmLoading ? 'Buscando último KM...' : data.vehiculoPatente ? 'Sin registros previos' : 'Seleccioná un vehículo'}
              />
              {kmLoading && <p className="text-xs mt-1" style={{ color: '#8b949e' }}>Buscando último odómetro registrado...</p>}
              {!kmLoading && data.kmInicial && <p className="text-xs mt-1" style={{ color: '#238636' }}>✓ Tomado del último registro del vehículo</p>}
              {!kmLoading && data.vehiculoPatente && !data.kmInicial && <p className="text-xs mt-1" style={{ color: '#8b949e' }}>Sin registros previos — ingresá el valor del odómetro</p>}
            </div>
            <TextField label="KM final (odómetro)" value={data.kmFinal} onChange={set('kmFinal')} type="number" placeholder="160350" error={errors.kmFinal} />
          </div>

          {isStandBy && (
            <>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(158,106,3,0.1)', border: '1px solid rgba(158,106,3,0.3)' }}>
                <p className="text-sm font-medium" style={{ color: '#f0a500' }}>⚠ Jornada con Stand-By</p>
              </div>
              <TextField label="Horas de Stand-By" value={data.standByHoras} onChange={set('standByHoras')} type="number" placeholder="8" required error={errors.standByHoras} />
              <SelectField
                label="Categoría Stand-By" value={data.standByCategoria} onChange={set('standByCategoria')}
                options={catalog?.categoriasStandBy || []} required error={errors.standByCategoria}
              />
              <TextAreaField label="Detalle del Stand-By" value={data.standByDetalle} onChange={set('standByDetalle')} placeholder="Describí el motivo del stand-by..." />
            </>
          )}
        </div>
      )}

      {/* ── CAMPO STEP 2 — Tiempos y Notas ── */}
      {step === 2 && !esTaller && (
        <div style={cardStyle} className="space-y-5">
          <h2 className="text-lg font-semibold text-white mb-2">Tiempos y Notas</h2>

          <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: '#1c2128', border: '1px solid #21262d' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>Horarios</p>
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Hora de inicio (salida hotel)" value={data.horaInicio} onChange={set('horaInicio')} type="time" required error={errors.horaInicio} />
              <TextField label="Hora inicio campo (llegada mástil)" value={data.horaInicioField} onChange={set('horaInicioField')} type="time" />
              <TextField label="Hora fin campo (salida mástil)" value={data.horaFinField} onChange={set('horaFinField')} type="time" />
              <TextField label="Hora finalización (llegada hotel)" value={data.horaFin} onChange={set('horaFin')} type="time" required error={errors.horaFin} />
            </div>
            {data.horaInicio && data.horaFin && (
              <div className="flex gap-6 pt-2" style={{ borderTop: '1px solid #21262d' }}>
                {[
                  { label: 'HH Totales', val: calcHoras(data.horaInicio, data.horaFin) },
                  { label: 'HH Campo', val: data.horaInicioField && data.horaFinField ? calcHoras(data.horaInicioField, data.horaFinField) : '—' },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-xs" style={{ color: '#8b949e' }}>{label}</p>
                    <p className="text-xl font-bold text-white">{val}h</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <TextField label="Hospedaje" value={data.hospedaje} onChange={set('hospedaje')} placeholder="Hotel Bahia Nueva" />
          <TextAreaField label="Observaciones" value={data.observaciones} onChange={set('observaciones')} placeholder="Cualquier novedad o comentario adicional..." />

          {/* Summary */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: '#0f1117', border: '1px solid #21262d' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8b949e' }}>Resumen de la jornada</p>
            {[
              ['Fecha', data.fecha],
              ['Lugar', 'Campo'],
              ['Cliente', data.clienteNombre || '—'],
              ['Proyecto', data.proyectoNombre || '—'],
              ['Tipo', data.tipoProyecto || '—'],
              ['Encargado', data.encargadoNombre || '—'],
              ['Vehículo', data.vehiculoPatente || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: '#8b949e' }}>{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => { setErrors({}); setStep(s => s - 1); }}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30"
          style={{ backgroundColor: '#21262d', color: '#e6edf3' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#1d6fb8' }}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#238636' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {loading ? 'Guardando...' : 'Enviar Jornada'}
          </button>
        )}
      </div>
    </div>
  );
}
