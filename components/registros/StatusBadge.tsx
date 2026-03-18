import type { RegistroStatus } from '@/types';

const config: Record<RegistroStatus, { label: string; style: React.CSSProperties }> = {
  pre_aprobado: {
    label: 'Pendiente',
    style: { backgroundColor: 'rgba(158,106,3,0.2)', color: '#f0a500', border: '1px solid rgba(158,106,3,0.4)', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 500, display: 'inline-block' },
  },
  aprobado: {
    label: 'Aprobado',
    style: { backgroundColor: 'rgba(35,134,54,0.2)', color: '#3fb950', border: '1px solid rgba(35,134,54,0.4)', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 500, display: 'inline-block' },
  },
  rechazado: {
    label: 'Rechazado',
    style: { backgroundColor: 'rgba(218,54,51,0.2)', color: '#f85149', border: '1px solid rgba(218,54,51,0.4)', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 500, display: 'inline-block' },
  },
};

export default function StatusBadge({ status }: { status: RegistroStatus }) {
  const { label, style } = config[status] || config.pre_aprobado;
  return <span style={style}>{label}</span>;
}
