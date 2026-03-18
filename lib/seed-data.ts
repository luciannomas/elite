export const clientes = [
  { nombre: 'Fortescue', codigo: 'FFI', activo: true },
  { nombre: 'Abo Energy', codigo: 'Abo', activo: true },
  { nombre: 'PCR', codigo: 'PCR', activo: true },
  { nombre: 'CWP', codigo: 'CWP', activo: false },
  { nombre: 'Genneia', codigo: 'Genneia', activo: false },
  { nombre: 'Coarco', codigo: 'Coarco', activo: false },
  { nombre: 'Ternium', codigo: 'Ternium', activo: false },
  { nombre: 'Nordex', codigo: 'Nordex', activo: false },
  { nombre: 'NEOEN', codigo: 'NEOEN', activo: false },
  { nombre: 'YPF LUZ', codigo: 'YPF', activo: false },
];

export const proyectos = [
  { nombre: 'MM-ARG-010-CH', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-005-CH', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-003-CH', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-004-CH', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-012-SC', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-014-SC', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-016-RN', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-017-CH', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-CP-Norte', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'MM-ARG-CP-Sur', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'LIDAR 1', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'LIDAR 2', clienteNombre: 'Fortescue', activo: true },
  { nombre: 'PE del Nuevo Sur', clienteNombre: 'Abo Energy', activo: true },
  { nombre: 'Boreas del Norte', clienteNombre: 'Abo Energy', activo: true },
  { nombre: 'Del Campo', clienteNombre: 'Abo Energy', activo: true },
  { nombre: 'TDF (Genneia)', clienteNombre: 'Genneia', activo: true },
  { nombre: 'Taller San Jose', clienteNombre: '', activo: true },
  { nombre: 'Rio Gallegos', clienteNombre: 'PCR', activo: true },
];

export const personal = [
  'Amarilla Carlos', 'Barreto Ayrton', 'Dodera William', 'Duarte Andrea',
  'Maza Gabriel', 'Maza Roman', 'Nuñez Basilio', 'Reyes Alexis',
  'Romero Nelson', 'Silva Carlos', 'Silva Ricardo', 'Surra Juan',
  'Torgues Enzo', 'Viera Valdomiro', 'Winnik Rodrigo', 'Martinez Manuel',
];

export const vehiculos = [
  { patente: 'AF454WH', modelo: 'Toyota Hilux' },
  { patente: 'AF454WV', modelo: 'Toyota Hilux' },
  { patente: 'AG273ZG', modelo: 'Ford Ranger' },
];

export const tiposProyecto = [
  'M. Preventivo', 'M. Correctivo', 'Instalación equipos', 'Relevamiento',
  'Visita preliminar', 'Montaje estructura', 'Visita revisión', 'Viaje',
  'Desmontaje', 'Stand-by', 'Adecuación', 'Viaje al 50%',
  'S. Tecnico en Altura', 'Replanteo', 'Traslado', 'Puesta en Marcha',
];

export const categoriasStandBy = [
  'Clima', 'Logística/Documentación', 'Salud/Personal',
  'Vehículo/Mantención', 'Acceso/Terreno', 'Cliente/Permisos',
  'Feriado/No operativo', 'Otros',
];
