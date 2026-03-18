import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seguimiento-elite';

const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String, active: Boolean, lastLogin: Date }, { timestamps: true });
const RegistroSchema = new mongoose.Schema({
  fecha: Date, trabajoRealizadoEn: String, estadoActividad: String, llego_al_mastil: String,
  clienteNombre: String, proyectoNombre: String, tipoProyecto: String, tareaTexto: String,
  excluirDeMetricas: Boolean, encargadoNombre: String, personalACargo: String,
  nPersonas: Number, vehiculoPatente: String, kmInicial: Number, kmFinal: Number, kmRecorridos: Number,
  standByHoras: Number, standByCategoria: String, standByDetalle: String,
  horaInicio: String, horaInicioField: String, horaFinField: String, horaFin: String,
  horasTotalesDec: Number, horasSitioDec: Number, horasTrasladoDec: Number,
  hospedaje: String, observaciones: String,
  status: String, submittedBy: mongoose.Schema.Types.ObjectId,
  approvedBy: mongoose.Schema.Types.ObjectId, approvedAt: Date, rechazadoMotivo: String,
}, { timestamps: true });
const ClienteSchema = new mongoose.Schema({ nombre: String, codigo: String, activo: Boolean }, { timestamps: true });
const ProyectoSchema = new mongoose.Schema({ nombre: String, clienteNombre: String, activo: Boolean }, { timestamps: true });
const PersonalSchema = new mongoose.Schema({ nombre: String, activo: Boolean }, { timestamps: true });
const VehiculoSchema = new mongoose.Schema({ patente: String, modelo: String, activo: Boolean }, { timestamps: true });

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB');

  for (const col of ['users','registros','clientes','proyectos','personals','vehiculos']) {
    try { await mongoose.connection.dropCollection(col); } catch {}
  }

  const UserM = mongoose.model('User', UserSchema);
  const RegistroM = mongoose.model('Registro', RegistroSchema);
  const ClienteM = mongoose.model('Cliente', ClienteSchema);
  const ProyectoM = mongoose.model('Proyecto', ProyectoSchema);
  const PersonalM = mongoose.model('Personal', PersonalSchema);
  const VehiculoM = mongoose.model('Vehiculo', VehiculoSchema);

  const pass = await bcrypt.hash('password123', 12);
  const users = await UserM.insertMany([
    { name: 'Amarilla Carlos', email: 'jefe@elite.com', password: pass, role: 'jefe_cuadrilla', active: true },
    { name: 'Surra Juan', email: 'jefe2@elite.com', password: pass, role: 'jefe_cuadrilla', active: true },
    { name: 'Auditor Sistema', email: 'auditor@elite.com', password: pass, role: 'auditor', active: true },
    { name: 'Super Admin', email: 'admin@elite.com', password: pass, role: 'super_admin', active: true },
  ]);
  const [jefe1, jefe2, auditor] = users;
  console.log('Usuarios OK');

  await ClienteM.insertMany([
    { nombre: 'Fortescue', codigo: 'FFI', activo: true },
    { nombre: 'Abo Energy', codigo: 'Abo', activo: true },
    { nombre: 'PCR', codigo: 'PCR', activo: true },
    { nombre: 'CWP', codigo: 'CWP', activo: false },
    { nombre: 'Genneia', codigo: 'Genneia', activo: false },
    { nombre: 'Coarco', codigo: 'Coarco', activo: false },
    { nombre: 'Nordex', codigo: 'Nordex', activo: false },
    { nombre: 'YPF LUZ', codigo: 'YPF', activo: false },
  ]);

  await ProyectoM.insertMany([
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
    { nombre: 'TDF (Genneia)', clienteNombre: 'Genneia', activo: true },
    { nombre: 'Taller San Jose', clienteNombre: '', activo: true },
    { nombre: 'Rio Gallegos', clienteNombre: 'PCR', activo: true },
  ]);

  await PersonalM.insertMany(['Amarilla Carlos','Barreto Ayrton','Dodera William','Duarte Andrea',
    'Maza Gabriel','Maza Roman','Nuñez Basilio','Reyes Alexis','Romero Nelson',
    'Silva Carlos','Silva Ricardo','Surra Juan','Torgues Enzo','Viera Valdomiro',
    'Winnik Rodrigo','Martinez Manuel'].map((n: string) => ({ nombre: n, activo: true })));

  await VehiculoM.insertMany([
    { patente: 'AF454WH', modelo: 'Toyota Hilux', activo: true },
    { patente: 'AF454WV', modelo: 'Toyota Hilux', activo: true },
    { patente: 'AG273ZG', modelo: 'Ford Ranger', activo: true },
  ]);
  console.log('Catalogos OK');

  const encargados = ['Amarilla Carlos', 'Surra Juan', 'Dodera William'];
  const personalLists = [
    'Maza Gabriel, Maza Roman, Silva Carlos',
    'Nuñez Basilio, Romero Nelson',
    'Viera Valdomiro, Reyes Alexis',
    'Maza Gabriel, Torgues Enzo, Barreto Ayrton',
  ];
  const proyectosR = [
    { p: 'MM-ARG-010-CH', c: 'Fortescue' }, { p: 'MM-ARG-005-CH', c: 'Fortescue' },
    { p: 'MM-ARG-017-CH', c: 'Fortescue' }, { p: 'LIDAR 1', c: 'Fortescue' },
    { p: 'PE del Nuevo Sur', c: 'Abo Energy' }, { p: 'TDF (Genneia)', c: 'Genneia' },
    { p: 'MM-ARG-012-SC', c: 'Fortescue' },
  ];
  const tiposR = ['M. Preventivo', 'M. Correctivo', 'Instalacion equipos', 'Relevamiento', 'Stand-by'];
  const vehs = ['AF454WH', 'AF454WV', 'AG273ZG'];
  const hospedajes = ['Hotel Bahia Nueva', 'Hotel Andes', 'Hotel Paris', 'Depto temporario', 'Hotel Dona Ana'];
  const statuses = ['pre_aprobado','pre_aprobado','pre_aprobado','aprobado','aprobado','aprobado','aprobado','rechazado'];
  const usuariosR: any[] = [jefe1._id, jefe2._id];

  const registros: any[] = [];
  const baseDate = new Date('2026-01-05');
  for (let i = 0; i < 40; i++) {
    const fecha = new Date(baseDate);
    fecha.setDate(baseDate.getDate() + i);
    const proy = proyectosR[i % proyectosR.length];
    const tipo = tiposR[i % tiposR.length];
    const status = statuses[i % statuses.length];
    const isStandBy = tipo === 'Stand-by';
    const kmI = 160000 + i * 180;
    const kmF = kmI + (isStandBy ? 0 : 80 + (i * 37) % 400);
    const h1 = `0${7 + (i % 2)}:00`;
    const h2 = `0${8 + (i % 2)}:${i % 2 === 0 ? '30' : '00'}`;
    const h3 = `${17 + (i % 2)}:${i % 2 === 0 ? '00' : '30'}`;
    const h4 = `${18 + (i % 2)}:${i % 2 === 0 ? '30' : '00'}`;
    const totales = 10 + (i % 3);
    const sitio = isStandBy ? 0 : 7 + (i % 2);
    const traslado = isStandBy ? 0 : (totales - sitio);
    const r: any = {
      fecha, trabajoRealizadoEn: i % 6 === 0 ? 'taller' : 'campo',
      estadoActividad: isStandBy ? 'Stand-by' : 'Productivo',
      llego_al_mastil: isStandBy ? 'no' : 'si',
      clienteNombre: proy.c, proyectoNombre: proy.p, tipoProyecto: tipo,
      tareaTexto: isStandBy ? 'Stand by climatico. Vientos fuertes.' : `Trabajos de ${tipo}. Tareas completadas.`,
      excluirDeMetricas: false,
      encargadoNombre: encargados[i % 3], personalACargo: personalLists[i % 4],
      nPersonas: personalLists[i % 4].split(',').length + 1,
      vehiculoPatente: vehs[i % 3], kmInicial: kmI, kmFinal: kmF, kmRecorridos: kmF - kmI,
      standByHoras: isStandBy ? 8 : 0,
      standByCategoria: isStandBy ? 'Clima' : undefined,
      standByDetalle: isStandBy ? 'Vientos mayores a 60 km/h' : undefined,
      horaInicio: h1, horaInicioField: isStandBy ? undefined : h2,
      horaFinField: isStandBy ? undefined : h3, horaFin: h4,
      horasTotalesDec: totales, horasSitioDec: sitio, horasTrasladoDec: traslado,
      hospedaje: hospedajes[i % 5],
      observaciones: i % 4 === 0 ? 'Sin novedad.' : undefined,
      status, submittedBy: usuariosR[i % 2],
    };
    if (status === 'aprobado') { r.approvedBy = auditor._id; r.approvedAt = new Date(fecha.getTime() + 86400000); }
    if (status === 'rechazado') { r.rechazadoMotivo = 'Datos de kilometraje incompletos. Completar y reenviar.'; }
    registros.push(r);
  }

  await RegistroM.insertMany(registros);
  console.log('40 registros OK');
  console.log('\nCredenciales:');
  console.log('  jefe@elite.com     / password123  (jefe_cuadrilla)');
  console.log('  jefe2@elite.com    / password123  (jefe_cuadrilla)');
  console.log('  auditor@elite.com  / password123  (auditor)');
  console.log('  admin@elite.com    / password123  (super_admin)');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
