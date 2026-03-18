import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  color?: string;
}

export default function KPICard({ icon: Icon, title, value, unit, subtitle, color = '#1d6fb8' }: KPICardProps) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: '#8b949e' }}>{title}</p>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm" style={{ color: '#8b949e' }}>{unit}</span>}
      </div>
      {subtitle && <p className="text-xs mt-1" style={{ color: '#8b949e' }}>{subtitle}</p>}
    </div>
  );
}
