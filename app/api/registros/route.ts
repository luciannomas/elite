import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB, { isMongoDBAvailable } from '@/lib/mongodb';
import Registro from '@/models/Registro';
import { calcHH } from '@/lib/metricas';
import { mockRegistros } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Modo demo sin MongoDB: devolver mock data filtrada
    if (!isMongoDBAvailable()) {
      let data: any[] = [...mockRegistros];
      if (status) data = data.filter(r => r.status === status);
      const cliente = searchParams.get('cliente');
      const encargado = searchParams.get('encargado');
      const tipoProyecto = searchParams.get('tipoProyecto');
      if (cliente) data = data.filter(r => r.clienteNombre === cliente);
      if (encargado) data = data.filter(r => r.encargadoNombre === encargado);
      if (tipoProyecto) data = data.filter(r => r.tipoProyecto === tipoProyecto);
      data = data.slice(0, limit);
      return NextResponse.json({ success: true, data, total: data.length, page: 1, totalPages: 1 });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (session.user.role === 'jefe_cuadrilla') {
      filter.submittedBy = session.user.id;
    }
    if (status) filter.status = status;

    const cliente = searchParams.get('cliente');
    const encargado = searchParams.get('encargado');
    const tipoProyecto = searchParams.get('tipoProyecto');
    const proyectoNombre = searchParams.get('proyectoNombre');
    if (cliente) filter.clienteNombre = cliente;
    if (encargado) filter.encargadoNombre = encargado;
    if (tipoProyecto) filter.tipoProyecto = tipoProyecto;
    if (proyectoNombre) filter.proyectoNombre = { $regex: proyectoNombre, $options: 'i' };

    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    if (fechaDesde || fechaHasta) {
      filter.fecha = {};
      if (fechaDesde) filter.fecha.$gte = new Date(fechaDesde);
      if (fechaHasta) filter.fecha.$lte = new Date(fechaHasta);
    }

    const [registros, total] = await Promise.all([
      Registro.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('submittedBy', 'name email')
        .populate('approvedBy', 'name')
        .lean(),
      Registro.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: registros,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });

    await connectDB();
    const body = await req.json();

    // Compute KM recorridos
    const kmRecorridos = body.kmFinal && body.kmInicial ? body.kmFinal - body.kmInicial : 0;

    // Compute HH
    const hh = calcHH(body.horaInicio, body.horaInicioField, body.horaFinField, body.horaFin);

    const registro = await Registro.create({
      ...body,
      kmRecorridos,
      ...hh,
      status: 'pre_aprobado',
      submittedBy: session.user.id,
    });

    return NextResponse.json({ success: true, data: registro }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
