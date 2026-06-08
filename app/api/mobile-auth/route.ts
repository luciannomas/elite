import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import User from '@/models/User';
import { encode } from 'next-auth/jwt';

const DEMO_USERS: { id: string; email: string; name: string; role: 'jefe_cuadrilla' | 'auditor' | 'super_admin'; password: string }[] = [
  { id: 'demo-1', email: 'jefe@elite.com',    name: 'Amarilla Carlos',  role: 'jefe_cuadrilla', password: 'password123' },
  { id: 'demo-2', email: 'jefe2@elite.com',   name: 'Surra Juan',       role: 'jefe_cuadrilla', password: 'password123' },
  { id: 'demo-3', email: 'auditor@elite.com', name: 'Auditor Sistema',  role: 'auditor',         password: 'password123' },
  { id: 'demo-4', email: 'admin@elite.com',   name: 'Super Admin',      role: 'super_admin',     password: 'password123' },
];

async function buildResponse(id: string, email: string, name: string, role: 'jefe_cuadrilla' | 'auditor' | 'super_admin') {
  const token = await encode({
    token: { id, email, name, role, sub: id },
    secret: process.env.NEXTAUTH_SECRET || 'seguimiento-elite-secret-2026',
  });
  return NextResponse.json({ success: true, token, user: { id, name, email, role } });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    // Intentar con MongoDB
    try {
      await connectDB();
      if (isMongoDBAvailable()) {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (user) {
          if (!user.active) return NextResponse.json({ success: false, error: 'Usuario inactivo' }, { status: 401 });
          const valid = await user.comparePassword(password);
          if (!valid) return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
          await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
          return buildResponse(user._id.toString(), user.email, user.name, user.role);
        }
      }
    } catch {
      // MongoDB falló, caer al mock
    }

    // Fallback mock — siempre disponible para demo
    const demo = DEMO_USERS.find(u => u.email === email.toLowerCase());
    if (!demo || demo.password !== password) {
      return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
    }
    return buildResponse(demo.id, demo.email, demo.name, demo.role);

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
