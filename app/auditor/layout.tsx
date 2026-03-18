import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default async function AuditorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'jefe_cuadrilla') redirect('/jefe');

  return (
    <div className="flex min-h-screen">
      {/* Sidebar solo en desktop */}
      <div className="hidden lg:flex">
        <Sidebar role={session.user.role} userName={session.user.name} />
      </div>
      {/* Contenido: padding-bottom en mobile para no quedar debajo del BottomNav */}
      <main className="flex-1 overflow-auto pb-20 lg:pb-0" style={{ backgroundColor: '#0f1117' }}>
        {children}
      </main>
      {/* Bottom nav solo en mobile/tablet */}
      <BottomNav role={session.user.role} />
    </div>
  );
}
