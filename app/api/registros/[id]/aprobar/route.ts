import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Registro from '@/models/Registro';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    if (!['auditor', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Sin permisos' }, { status: 403 });
    }

    const { id } = await params;
    const { action, motivo } = await req.json();

    if (!['aprobar', 'rechazar', 'revertir'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 });
    }

    await connectDB();
    const update: any =
      action === 'aprobar'
        ? { status: 'aprobado', approvedBy: session.user.id, approvedAt: new Date(), rechazadoMotivo: null }
        : action === 'rechazar'
        ? { status: 'rechazado', rechazadoMotivo: motivo || 'Sin motivo especificado', approvedBy: null, approvedAt: null }
        : { status: 'pre_aprobado', rechazadoMotivo: null, approvedBy: null, approvedAt: null };

    const registro = await Registro.findByIdAndUpdate(id, update, { new: true });
    if (!registro) return NextResponse.json({ success: false, error: 'Registro no encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, data: registro });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
