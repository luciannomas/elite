import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Registro from '@/models/Registro';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    if (!['auditor', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Sin permisos' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    const matchAprobados: any = { status: 'aprobado', excluirDeMetricas: { $ne: true } };
    if (fechaDesde || fechaHasta) {
      matchAprobados.fecha = {};
      if (fechaDesde) matchAprobados.fecha.$gte = new Date(fechaDesde);
      if (fechaHasta) matchAprobados.fecha.$lte = new Date(fechaHasta);
    }

    const [kpis, porStatus, porCliente, porEncargado] = await Promise.all([
      Registro.aggregate([
        { $match: matchAprobados },
        {
          $group: {
            _id: null,
            hhTotales: { $sum: '$horasTotalesDec' },
            hhCampo: { $sum: '$horasSitioDec' },
            hhTraslado: { $sum: '$horasTrasladoDec' },
            hhStandBy: { $sum: '$standByHoras' },
            kmTotales: { $sum: '$kmRecorridos' },
            totalRegistros: { $sum: 1 },
            countProductivo: { $sum: { $cond: [{ $eq: ['$estadoActividad', 'Productivo'] }, 1, 0] } },
          },
        },
      ]),
      Registro.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Registro.aggregate([
        { $match: matchAprobados },
        { $group: { _id: '$clienteNombre', hhTotales: { $sum: '$horasTotalesDec' }, count: { $sum: 1 } } },
        { $sort: { hhTotales: -1 } },
        { $limit: 6 },
      ]),
      Registro.aggregate([
        { $match: matchAprobados },
        { $group: { _id: '$encargadoNombre', hhTotales: { $sum: '$horasTotalesDec' }, count: { $sum: 1 } } },
        { $sort: { hhTotales: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const k = kpis[0] || { hhTotales: 0, hhCampo: 0, hhTraslado: 0, hhStandBy: 0, kmTotales: 0, totalRegistros: 0, countProductivo: 0 };
    const productividad = k.hhTotales > 0 ? Math.round((k.hhCampo / k.hhTotales) * 100) : 0;

    const statusMap: Record<string, number> = {};
    porStatus.forEach((s: any) => { statusMap[s._id] = s.count; });

    return NextResponse.json({
      success: true,
      data: {
        hhTotales: Math.round(k.hhTotales * 10) / 10,
        hhCampo: Math.round(k.hhCampo * 10) / 10,
        hhTraslado: Math.round(k.hhTraslado * 10) / 10,
        hhStandBy: Math.round(k.hhStandBy * 10) / 10,
        kmTotales: Math.round(k.kmTotales),
        totalRegistros: k.totalRegistros,
        productividad,
        pendientes: statusMap['pre_aprobado'] || 0,
        aprobados: statusMap['aprobado'] || 0,
        rechazados: statusMap['rechazado'] || 0,
        porCliente,
        porEncargado,
        porStatus: [
          { name: 'Pendientes', value: statusMap['pre_aprobado'] || 0, color: '#9e6a03' },
          { name: 'Aprobados', value: statusMap['aprobado'] || 0, color: '#238636' },
          { name: 'Rechazados', value: statusMap['rechazado'] || 0, color: '#da3633' },
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
