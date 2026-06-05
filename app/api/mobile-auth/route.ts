import { NextRequest, NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import User from '@/models/User';
import { encode } from 'next-auth/jwt';

const DEMO_USERS = [
  { id: 'demo-1', email: 'jefe@elite.com',    name: 'Amarilla Carlos',  role: 'jefe_cuadrilla', password: 'password123' },
  { id: 'demo-2', email: 'jefe2@elite.com',   name: 'Surra Juan',       role: 'jefe_cuadrilla', password: 'password123' },
  { id: 'demo-3', email: 'auditor@elite.com', name: 'Auditor Sistema',  role: 'auditor',         password: 'password123' },
  { id: 'demo-4', email: 'admin@elite.com',   name: 'Super Admin',      role: 'super_admin',     password: 'password123' },
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    let userId: string, userName: string, userEmail: string, userRole: string;

    await connectDB();

    if (isMongoDBAvailable()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
      if (!user.active) return NextResponse.json({ success: false, error: 'Usuario inactivo' }, { status: 401 });
      const valid = await user.comparePassword(password);
      if (!valid) return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
      userId = user._id.toString();
      userName = user.name;
      userEmail = user.email;
      userRole = user.role;
    } else {
      const demo = DEMO_USERS.find(u => u.email === email.toLowerCase());
      if (!demo || demo.password !== password) {
        return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
      }
      userId = demo.id;
      userName = demo.name;
      userEmail = demo.email;
      userRole = demo.role;
    }

    // Generar JWT token de NextAuth
    const token = await encode({
      token: { id: userId, email: userEmail, name: userName, role: userRole, sub: userId },
      secret: process.env.NEXTAUTH_SECRET || 'elite-seguimiento-secret-2026',
    });

    return NextResponse.json({
      success: true,
      token,
      user: { id: userId, name: userName, email: userEmail, role: userRole },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CORS preflight
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
