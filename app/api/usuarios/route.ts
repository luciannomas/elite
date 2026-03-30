import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    if (!['auditor', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Sin permisos' }, { status: 403 });
    }
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    if (!['auditor', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Sin permisos' }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const user = await User.create(body);
    const { password: _pw, ...data } = user.toObject();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
