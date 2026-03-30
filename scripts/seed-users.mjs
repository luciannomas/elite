import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://Vercel-Admin-finanzas:8kqtvAB8oFgplhv3@finanzas.ws7pqgm.mongodb.net/elite?retryWrites=true&w=majority';

const users = [
  { email: 'jefe@elite.com',    name: 'Amarilla Carlos',  role: 'jefe_cuadrilla', password: 'password123', active: true },
  { email: 'jefe2@elite.com',   name: 'Surra Juan',       role: 'jefe_cuadrilla', password: 'password123', active: true },
  { email: 'auditor@elite.com', name: 'Auditor Sistema',  role: 'auditor',        password: 'password123', active: true },
  { email: 'admin@elite.com',   name: 'Super Admin',      role: 'super_admin',    password: 'password123', active: true },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('Conectado a MongoDB Atlas (base: elite)');

  const db = client.db('elite');
  const col = db.collection('users');

  for (const u of users) {
    const exists = await col.findOne({ email: u.email });
    if (exists) {
      console.log(`⏭  Ya existe: ${u.email}`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 12);
    await col.insertOne({
      ...u,
      password: hash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Creado: ${u.email} (${u.role})`);
  }

  await client.close();
  console.log('\nSeed completado.');
}

seed().catch(e => { console.error(e); process.exit(1); });
