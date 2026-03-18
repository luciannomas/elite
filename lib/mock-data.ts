// Datos mock para demo sin MongoDB
export const mockRegistros = [
  {
    _id: 'm1', fecha: new Date('2026-03-10'), proyectoNombre: 'MM-ARG-017-CH', clienteNombre: 'Fortescue',
    tipoProyecto: 'M. Preventivo', encargadoNombre: 'Dodera William', horasTotalesDec: 11, horasSitioDec: 7,
    kmRecorridos: 210, nPersonas: 3, status: 'aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Productivo', submittedBy: { name: 'Amarilla Carlos' }, createdAt: new Date('2026-03-10'),
  },
  {
    _id: 'm2', fecha: new Date('2026-03-11'), proyectoNombre: 'MM-ARG-005-CH', clienteNombre: 'Fortescue',
    tipoProyecto: 'M. Correctivo', encargadoNombre: 'Amarilla Carlos', horasTotalesDec: 10, horasSitioDec: 6.5,
    kmRecorridos: 185, nPersonas: 2, status: 'aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Productivo', submittedBy: { name: 'Surra Juan' }, createdAt: new Date('2026-03-11'),
  },
  {
    _id: 'm3', fecha: new Date('2026-03-12'), proyectoNombre: 'PE del Nuevo Sur', clienteNombre: 'Abo Energy',
    tipoProyecto: 'Relevamiento', encargadoNombre: 'Surra Juan', horasTotalesDec: 9, horasSitioDec: 5,
    kmRecorridos: 320, nPersonas: 4, status: 'aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Productivo', submittedBy: { name: 'Amarilla Carlos' }, createdAt: new Date('2026-03-12'),
  },
  {
    _id: 'm4', fecha: new Date('2026-03-13'), proyectoNombre: 'TDF Genneia', clienteNombre: 'Genneia',
    tipoProyecto: 'Instalación equipos', encargadoNombre: 'Maza Gabriel', horasTotalesDec: 12, horasSitioDec: 8,
    kmRecorridos: 95, nPersonas: 5, status: 'aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Productivo', submittedBy: { name: 'Amarilla Carlos' }, createdAt: new Date('2026-03-13'),
  },
  {
    _id: 'm5', fecha: new Date('2026-03-14'), proyectoNombre: 'MM-ARG-010-CH', clienteNombre: 'Fortescue',
    tipoProyecto: 'Puesta en Marcha', encargadoNombre: 'Dodera William', horasTotalesDec: 8, horasSitioDec: 5,
    kmRecorridos: 170, nPersonas: 3, status: 'pre_aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Productivo', submittedBy: { name: 'Surra Juan' }, createdAt: new Date('2026-03-14'),
  },
  {
    _id: 'm6', fecha: new Date('2026-03-15'), proyectoNombre: 'MM-ARG-003-CH', clienteNombre: 'Fortescue',
    tipoProyecto: 'Montaje estructura', encargadoNombre: 'Amarilla Carlos', horasTotalesDec: 10, horasSitioDec: 7,
    kmRecorridos: 230, nPersonas: 3, status: 'pre_aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Productivo', submittedBy: { name: 'Amarilla Carlos' }, createdAt: new Date('2026-03-15'),
  },
  {
    _id: 'm7', fecha: new Date('2026-03-16'), proyectoNombre: 'LIDAR 1', clienteNombre: 'PCR',
    tipoProyecto: 'Visita preliminar', encargadoNombre: 'Surra Juan', horasTotalesDec: 7, horasSitioDec: 4,
    kmRecorridos: 140, nPersonas: 2, status: 'pre_aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Productivo', submittedBy: { name: 'Surra Juan' }, createdAt: new Date('2026-03-16'),
  },
  {
    _id: 'm8', fecha: new Date('2026-03-08'), proyectoNombre: 'Taller San José', clienteNombre: 'Fortescue',
    tipoProyecto: 'Adecuación', encargadoNombre: 'Maza Roman', horasTotalesDec: 8, horasSitioDec: 8,
    kmRecorridos: 0, nPersonas: 2, status: 'rechazado', trabajoRealizadoEn: 'taller',
    estadoActividad: 'Administrativo', submittedBy: { name: 'Amarilla Carlos' }, createdAt: new Date('2026-03-08'),
  },
  {
    _id: 'm9', fecha: new Date('2026-03-09'), proyectoNombre: 'MM-ARG-004-CH', clienteNombre: 'Fortescue',
    tipoProyecto: 'Stand-by', encargadoNombre: 'Dodera William', horasTotalesDec: 9, horasSitioDec: 0,
    kmRecorridos: 180, nPersonas: 3, status: 'aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Stand-by', submittedBy: { name: 'Surra Juan' }, createdAt: new Date('2026-03-09'),
  },
  {
    _id: 'm10', fecha: new Date('2026-03-17'), proyectoNombre: 'PE del Nuevo Sur', clienteNombre: 'Abo Energy',
    tipoProyecto: 'Replanteo', encargadoNombre: 'Amarilla Carlos', horasTotalesDec: 11, horasSitioDec: 7.5,
    kmRecorridos: 290, nPersonas: 4, status: 'pre_aprobado', trabajoRealizadoEn: 'campo',
    estadoActividad: 'Productivo', submittedBy: { name: 'Amarilla Carlos' }, createdAt: new Date('2026-03-17'),
  },
];

export const mockKPIs = {
  pendientes: mockRegistros.filter(r => r.status === 'pre_aprobado').length,
  aprobados: mockRegistros.filter(r => r.status === 'aprobado').length,
  rechazados: mockRegistros.filter(r => r.status === 'rechazado').length,
  hhTotales: mockRegistros.filter(r => r.status === 'aprobado').reduce((s, r) => s + r.horasTotalesDec, 0),
  hhCampo: mockRegistros.filter(r => r.status === 'aprobado').reduce((s, r) => s + r.horasSitioDec, 0),
  kmTotales: mockRegistros.filter(r => r.status === 'aprobado').reduce((s, r) => s + r.kmRecorridos, 0),
};
