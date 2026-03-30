import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['auditor', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Sin permisos' }, { status: 403 });
    }
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Usar findById + save() para que el pre-save hook de bcrypt se ejecute
    const user = await User.findById(id).select('+password');
    if (!user) return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });

    user.name = body.name ?? user.name;
    user.email = body.email ?? user.email;
    user.role = body.role ?? user.role;
    user.active = body.active ?? user.active;
    if (body.password) user.password = body.password; // hook lo hashea

    await user.save();
    const { password: _pw, ...data } = user.toObject();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['auditor', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Sin permisos' }, { status: 403 });
    }
    await connectDB();
    const { id } = await params;
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
