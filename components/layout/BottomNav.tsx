'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Plus, List, CheckSquare, Users, ClipboardList, LogOut } from 'lucide-react';
import type { Role } from '@/types';

const jefeLinks = [
  { href: '/jefe', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/jefe/nueva-jornada', label: 'Nueva', icon: Plus, exact: false },
  { href: '/jefe/mis-registros', label: 'Registros', icon: List, exact: false },
];

const auditorLinks = [
  { href: '/auditor', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/auditor/aprobaciones', label: 'Aprobar', icon: CheckSquare, exact: false },
  { href: '/auditor/registros', label: 'Registros', icon: ClipboardList, exact: false },
  { href: '/auditor/usuarios', label: 'Usuarios', icon: Users, exact: false },
];

export default function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = role === 'jefe_cuadrilla' ? jefeLinks : auditorLinks;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch lg:hidden"
      style={{
        backgroundColor: '#080b0f',
        borderTop: '1px solid #21262d',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {links.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        const isPrimary = label === 'Nueva';

        if (isPrimary) {
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5"
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full -mt-6 shadow-lg"
                style={{ backgroundColor: '#1d6fb8', boxShadow: '0 0 0 4px #080b0f' }}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium mt-1" style={{ color: '#1d6fb8' }}>
                {label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center justify-center flex-1 py-3 gap-1 transition-colors"
          >
            {isActive && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: '#1d6fb8' }}
              />
            )}
            <Icon
              className="w-5 h-5"
              style={{ color: isActive ? '#1d6fb8' : '#8b949e' }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: isActive ? '#1d6fb8' : '#8b949e' }}
            >
              {label}
            </span>
          </Link>
        );
      })}

      {/* Sign out tab */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex flex-col items-center justify-center py-3 gap-1 px-3 transition-colors"
      >
        <LogOut className="w-5 h-5" style={{ color: '#8b949e' }} />
        <span className="text-xs font-medium" style={{ color: '#8b949e' }}>Salir</span>
      </button>
    </nav>
  );
}
