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
    if (!body.password) delete body.password;
    const user = await User.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: user });
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
