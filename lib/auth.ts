import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB, { isMongoDBAvailable } from './mongodb';
import User from '@/models/User';

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
        if (!isMongoDBAvailable()) throw new Error('Base de datos no disponible');
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
        if (!user) throw new Error('Usuario no encontrado');
        if (!user.active) throw new Error('Usuario inactivo');
        const valid = await user.comparePassword(credentials.password);
        if (!valid) throw new Error('Contraseña incorrecta');
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
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
