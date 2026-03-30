import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registro from '@/models/Registro';

export async function GET(req: NextRequest) {
  const patente = req.nextUrl.searchParams.get('patente');
  if (!patente) return NextResponse.json({ success: false, error: 'Patente requerida' }, { status: 400 });

  try {
    await connectDB();
    const ultimo = await Registro.findOne(
      { vehiculoPatente: patente, kmFinal: { $exists: true, $gt: 0 } },
      { kmFinal: 1, fecha: 1 }
    ).sort({ fecha: -1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      kmFinal: ultimo?.kmFinal ?? null,
      fecha: ultimo?.fecha ?? null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
