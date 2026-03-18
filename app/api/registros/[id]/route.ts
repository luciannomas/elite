import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Registro from '@/models/Registro';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const registro = await Registro.findById(id)
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name')
      .lean();
    if (!registro) return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data: registro });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const registro = await Registro.findByIdAndUpdate(id, body, { new: true });
    if (!registro) return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data: registro });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    if (!['auditor', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Sin permisos' }, { status: 403 });
    }
    await connectDB();
    const { id } = await params;
    await Registro.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
