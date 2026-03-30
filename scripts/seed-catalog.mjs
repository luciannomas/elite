import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://Vercel-Admin-finanzas:8kqtvAB8oFgplhv3@finanzas.ws7pqgm.mongodb.net/elite?retryWrites=true&w=majority';

const clientes = [
  { nombre: 'Fortescue', codigo: 'FFI', activo: true },
  { nombre: 'Abo Energy', codigo: 'Abo', activo: true },
  { nombre: 'PCR', codigo: 'PCR', activo: true },
  { nombre: 'Genneia', codigo: 'Genneia', activo: true },
  { nombre: 'Coarco', codigo: 'Coarco', activo: true },
  { nombre: 'Ternium', codigo: 'Ternium', activo: true },
  { nombre: 'NEOEN', codigo: 'NEOEN', activo: true },
  { nombre: 'YPF LUZ', codigo: 'YPF', activo: true },
];

const proyectos = [
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
  { nombre: 'Rio Gallegos', clienteNombre: 'PCR', activo: true },
  { nombre: 'Taller San Jose', clienteNombre: '', activo: true },
];

const personal = [
  'Amarilla Carlos', 'Barreto Ayrton', 'Dodera William', 'Duarte Andrea',
  'Maza Gabriel', 'Maza Roman', 'Nuñez Basilio', 'Reyes Alexis',
  'Romero Nelson', 'Silva Carlos', 'Silva Ricardo', 'Surra Juan',
  'Torgues Enzo', 'Viera Valdomiro', 'Winnik Rodrigo', 'Martinez Manuel',
];

const vehiculos = [
  { patente: 'AF454WH', modelo: 'Toyota Hilux', activo: true },
  { patente: 'AF454WV', modelo: 'Toyota Hilux', activo: true },
  { patente: 'AG273ZG', modelo: 'Ford Ranger', activo: true },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('elite');
  console.log('Conectado a MongoDB Atlas (base: elite)\n');

  // Clientes
  const colClientes = db.collection('clientes');
  for (const c of clientes) {
    const exists = await colClientes.findOne({ nombre: c.nombre });
    if (exists) { console.log(`⏭  Cliente ya existe: ${c.nombre}`); continue; }
    await colClientes.insertOne({ ...c, createdAt: new Date() });
    console.log(`✅ Cliente: ${c.nombre}`);
  }

  // Proyectos
  const colProyectos = db.collection('proyectos');
  for (const p of proyectos) {
    const exists = await colProyectos.findOne({ nombre: p.nombre });
    if (exists) { console.log(`⏭  Proyecto ya existe: ${p.nombre}`); continue; }
    await colProyectos.insertOne({ ...p, createdAt: new Date() });
    console.log(`✅ Proyecto: ${p.nombre}`);
  }

  // Personal
  const colPersonal = db.collection('personals');
  for (const nombre of personal) {
    const exists = await colPersonal.findOne({ nombre });
    if (exists) { console.log(`⏭  Personal ya existe: ${nombre}`); continue; }
    await colPersonal.insertOne({ nombre, activo: true, createdAt: new Date() });
    console.log(`✅ Personal: ${nombre}`);
  }

  // Vehiculos
  const colVehiculos = db.collection('vehiculos');
  for (const v of vehiculos) {
    const exists = await colVehiculos.findOne({ patente: v.patente });
    if (exists) { console.log(`⏭  Vehículo ya existe: ${v.patente}`); continue; }
    await colVehiculos.insertOne({ ...v, createdAt: new Date() });
    console.log(`✅ Vehículo: ${v.patente}`);
  }

  await client.close();
  console.log('\nSeed de catálogo completado.');
}

seed().catch(e => { console.error(e); process.exit(1); });
