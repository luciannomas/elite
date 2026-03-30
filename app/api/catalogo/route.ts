import { NextResponse } from 'next/server';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Cliente from '@/models/Cliente';
import Proyecto from '@/models/Proyecto';
import Personal from '@/models/Personal';
import Vehiculo from '@/models/Vehiculo';
import { clientes as mockClientes, proyectos as mockProyectos, personal as mockPersonal, vehiculos as mockVehiculos, tiposProyecto, categoriasStandBy } from '@/lib/seed-data';

export async function GET() {
  try {
    await connectDB();

    if (isMongoDBAvailable()) {
      const [clientes, proyectos, personal, vehiculos] = await Promise.all([
        Cliente.find({ activo: true }).sort({ nombre: 1 }).lean(),
        Proyecto.find({ activo: true }).sort({ nombre: 1 }).lean(),
        Personal.find({ activo: true }).sort({ nombre: 1 }).lean(),
        Vehiculo.find({ activo: true }).sort({ patente: 1 }).lean(),
      ]);
      return NextResponse.json({
        success: true,
        data: { clientes, proyectos, personal, vehiculos, tiposProyecto, categoriasStandBy },
      });
    }
  } catch {
    // fallback below
  }

  // Fallback: datos mock cuando MongoDB no está disponible
  return NextResponse.json({
    success: true,
    data: {
      clientes: mockClientes.filter(c => c.activo).map(c => ({ _id: c.nombre, nombre: c.nombre })),
      proyectos: mockProyectos.filter(p => p.activo).map(p => ({ _id: p.nombre, nombre: p.nombre, clienteNombre: p.clienteNombre })),
      personal: mockPersonal.map(nombre => ({ _id: nombre, nombre })),
      vehiculos: mockVehiculos.map(v => ({ _id: v.patente, patente: v.patente })),
      tiposProyecto,
      categoriasStandBy,
    },
  });
}
