'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Plus, List, CheckSquare, Users, ClipboardList, LogOut, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

const jefeLinks = [
  { href: '/jefe', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jefe/nueva-jornada', label: 'Nueva Jornada', icon: Plus },
  { href: '/jefe/mis-registros', label: 'Mis Registros', icon: List },
];

const auditorLinks = [
  { href: '/auditor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/auditor/aprobaciones', label: 'Aprobaciones', icon: CheckSquare },
  { href: '/auditor/registros', label: 'Todos los Registros', icon: ClipboardList },
  { href: '/auditor/usuarios', label: 'Usuarios', icon: Users },
];

const roleLabels: Record<Role, string> = {
  jefe_cuadrilla: 'Jefe de Cuadrilla',
  auditor: 'Auditor',
  super_admin: 'Super Admin',
};

interface SidebarProps {
  role: Role;
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const links = role === 'jefe_cuadrilla' ? jefeLinks : auditorLinks;

  return (
    <aside className="flex flex-col w-60 min-h-screen" style={{ backgroundColor: '#080b0f', borderRight: '1px solid #21262d' }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid #21262d' }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: '#1d6fb8' }}>
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-lg leading-none">Elite</p>
          <p className="text-xs" style={{ color: '#8b949e' }}>Seguimiento Operativo</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/jefe' && href !== '/auditor' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'text-white border-l-2'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
              )}
              style={isActive ? { backgroundColor: '#161b22', borderLeftColor: '#1d6fb8' } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #21262d' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold" style={{ backgroundColor: '#1d6fb8' }}>
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs truncate" style={{ color: '#8b949e' }}>{roleLabels[role]}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-[#8b949e] hover:text-white hover:bg-[#161b22]"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
