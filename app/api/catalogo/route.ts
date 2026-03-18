import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cliente from '@/models/Cliente';
import Proyecto from '@/models/Proyecto';
import Personal from '@/models/Personal';
import Vehiculo from '@/models/Vehiculo';
import { tiposProyecto, categoriasStandBy } from '@/lib/seed-data';

export async function GET() {
  try {
    await connectDB();
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
