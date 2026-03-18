import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'jefe_cuadrilla' | 'auditor' | 'super_admin';
    };
  }
  interface User {
    id: string;
    role: 'jefe_cuadrilla' | 'auditor' | 'super_admin';
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'jefe_cuadrilla' | 'auditor' | 'super_admin';
  }
}
