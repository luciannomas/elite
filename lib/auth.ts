import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB, { isMongoDBAvailable } from './mongodb';
import User from '@/models/User';
import type { Role } from '@/types';

// Usuarios demo hardcodeados — activos cuando no hay MongoDB disponible
const DEMO_USERS: { id: string; email: string; name: string; role: Role; password: string }[] = [
  { id: 'demo-1', email: 'jefe@elite.com',    name: 'Amarilla Carlos',  role: 'jefe_cuadrilla', password: 'password123' },
  { id: 'demo-2', email: 'jefe2@elite.com',   name: 'Surra Juan',       role: 'jefe_cuadrilla', password: 'password123' },
  { id: 'demo-3', email: 'auditor@elite.com', name: 'Auditor Sistema',  role: 'auditor',         password: 'password123' },
  { id: 'demo-4', email: 'admin@elite.com',   name: 'Super Admin',      role: 'super_admin',     password: 'password123' },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error('Email y contraseña requeridos');

        await connectDB();

        // Con MongoDB disponible: autenticar contra la base de datos
        if (isMongoDBAvailable()) {
          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
          if (!user) throw new Error('Usuario no encontrado');
          if (!user.active) throw new Error('Usuario inactivo');
          const valid = await user.comparePassword(credentials.password);
          if (!valid) throw new Error('Contraseña incorrecta');
          await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
          return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
        }

        // Sin MongoDB: usar usuarios demo hardcodeados
        const demo = DEMO_USERS.find(u => u.email === credentials.email.toLowerCase());
        if (!demo) throw new Error('Usuario no encontrado');
        if (credentials.password !== demo.password) throw new Error('Contraseña incorrecta');
        return { id: demo.id, email: demo.email, name: demo.name, role: demo.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id = token.id; (session.user as any).role = token.role; }
      return session;
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret',
};
