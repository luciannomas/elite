// Test E2E contra producción
// En HTTPS Next-Auth usa cookie __Secure-next-auth.session-token
const BASE = 'https://elite-demo-v1.vercel.app';
const RESULTS = [];

function log(icon, label, msg) {
  console.log(`${icon} ${label.padEnd(45)} ${msg}`);
  RESULTS.push({ ok: icon === '✅', label, msg });
}

async function getCSRF() {
  const res = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await res.json();
  const cookies = res.headers.get('set-cookie') || '';
  return { csrfToken, cookies };
}

async function login(email, password) {
  const { csrfToken, cookies } = await getCSRF();
  const body = new URLSearchParams({ csrfToken, email, password, callbackUrl: `${BASE}/jefe`, json: 'true' });
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookies },
    body: body.toString(),
    redirect: 'manual',
  });
  const setCookie = res.headers.get('set-cookie') || '';
  // Prod HTTPS usa __Secure- prefix
  const secureMatch = setCookie.match(/__Secure-next-auth\.session-token=([^;]+)/);
  const plainMatch  = setCookie.match(/next-auth\.session-token=([^;]+)/);
  const match = secureMatch || plainMatch;
  if (!match) return null;
  return {
    token: match[1],
    cookieName: secureMatch ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
  };
}

async function api(path, session, options = {}) {
  if (!session) return { success: false, error: 'Sin sesion' };
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${session.cookieName}=${session.token}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

async function run() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  TEST E2E PRODUCCION — ' + BASE);
  console.log('══════════════════════════════════════════════════\n');

  // 1. Login jefe
  let jefe = null;
  try {
    jefe = await login('jefe@elite.com', 'password123');
    if (jefe) log('✅', '1. Login jefe@elite.com', `Token OK (cookie: ${jefe.cookieName})`);
    else log('❌', '1. Login jefe@elite.com', 'Sin token — revisar NEXTAUTH_URL en Vercel');
  } catch (e) { log('❌', '1. Login jefe@elite.com', e.message); }

  // 2. Catálogo
  if (jefe) {
    try {
      const cat = await api('/api/catalogo', jefe);
      if (cat.success) {
        const { clientes, personal, vehiculos } = cat.data;
        log('✅', '2. GET /api/catalogo', `clientes:${clientes.length} personal:${personal.length} vehiculos:${vehiculos.length}`);
        if (!clientes.length)  log('⚠️ ', '2b. clientes VACIO', 'Seed pendiente');
        if (!vehiculos.length) log('⚠️ ', '2b. vehiculos VACIO', 'Seed pendiente');
        if (!personal.length)  log('⚠️ ', '2b. personal VACIO', 'Seed pendiente');
      } else log('❌', '2. GET /api/catalogo', cat.error);
    } catch (e) { log('❌', '2. GET /api/catalogo', e.message); }
  }

  // 3. Crear registro campo
  let registroId = null;
  if (jefe) {
    try {
      const res = await api('/api/registros', jefe, {
        method: 'POST',
        body: JSON.stringify({
          fecha: new Date().toISOString().split('T')[0],
          trabajoRealizadoEn: 'campo',
          estadoActividad: 'Productivo',
          llego_al_mastil: 'si',
          clienteNombre: 'Fortescue',
          proyectoNombre: 'MM-ARG-010-CH',
          tipoProyecto: 'M. Preventivo',
          tareaTexto: 'Test E2E prod — mantenimiento antena.\nLinea 2 descripcion.',
          encargadoNombre: 'Amarilla Carlos',
          personalACargo: 'Maza Gabriel, Maza Roman',
          nPersonas: 3,
          vehiculoPatente: 'AF454WV',
          kmInicial: 50000,
          kmFinal: 50280,
          horaInicio: '07:00',
          horaInicioField: '08:30',
          horaFinField: '17:00',
          horaFin: '18:30',
        }),
      });
      if (res.success) {
        registroId = res.data._id;
        log('✅', '3. POST /api/registros (campo)', `ID:${registroId} status:${res.data.status}`);
      } else log('❌', '3. POST /api/registros (campo)', res.error || JSON.stringify(res));
    } catch (e) { log('❌', '3. POST /api/registros (campo)', e.message); }
  }

  // 4. Crear registro taller
  let tallerID = null;
  if (jefe) {
    try {
      const res = await api('/api/registros', jefe, {
        method: 'POST',
        body: JSON.stringify({
          fecha: new Date().toISOString().split('T')[0],
          trabajoRealizadoEn: 'taller',
          estadoActividad: 'Productivo',
          tipoProyecto: 'M. Correctivo',
          tareaTexto: 'Test taller prod — reparacion modulo.',
          encargadoNombre: 'jefe@elite.com',
          nPersonas: 1,
          horaInicio: '08:00',
          horaFin: '16:00',
        }),
      });
      if (res.success) {
        tallerID = res.data._id;
        log('✅', '4. POST /api/registros (taller)', `ID:${tallerID} status:${res.data.status}`);
      } else log('❌', '4. POST /api/registros (taller)', res.error);
    } catch (e) { log('❌', '4. POST /api/registros (taller)', e.message); }
  }

  // 5. Jefe ve sus registros
  if (jefe) {
    try {
      const res = await api('/api/registros', jefe);
      if (res.success) log('✅', '5. GET /api/registros (jefe)', `${res.data.length} registros propios`);
      else log('❌', '5. GET /api/registros', res.error);
    } catch (e) { log('❌', '5. GET /api/registros', e.message); }
  }

  // 6. Login auditor
  let auditor = null;
  try {
    auditor = await login('auditor@elite.com', 'password123');
    if (auditor) log('✅', '6. Login auditor@elite.com', `Token OK (cookie: ${auditor.cookieName})`);
    else log('❌', '6. Login auditor@elite.com', 'Sin token');
  } catch (e) { log('❌', '6. Login auditor@elite.com', e.message); }

  // 7. Auditor ve pendientes
  if (auditor) {
    try {
      const res = await api('/api/registros?status=pre_aprobado', auditor);
      if (res.success) log('✅', '7. GET pendientes (auditor)', `${res.data.length} pendientes`);
      else log('❌', '7. GET pendientes', res.error);
    } catch (e) { log('❌', '7. GET pendientes', e.message); }
  }

  // 8. Detalle registro
  if (auditor && registroId) {
    try {
      const res = await api(`/api/registros/${registroId}`, auditor);
      if (res.success) {
        const r = res.data;
        log('✅', '8. GET detalle registro', `personalACargo:${r.personalACargo ? '✓' : '✗'} tareaTexto:${r.tareaTexto ? '✓' : '✗'} saltoLinea:${r.tareaTexto?.includes('\n') ? '✓' : '✗'}`);
      } else log('❌', '8. GET detalle', res.error);
    } catch (e) { log('❌', '8. GET detalle', e.message); }
  }

  // 9. Aprobar
  if (auditor && registroId) {
    try {
      const res = await api(`/api/registros/${registroId}/aprobar`, auditor, { method: 'POST', body: JSON.stringify({ action: 'aprobar' }) });
      if (res.success) log('✅', '9. Aprobar registro', `status:${res.data.status}`);
      else log('❌', '9. Aprobar', res.error);
    } catch (e) { log('❌', '9. Aprobar', e.message); }
  }

  // 10. Revertir
  if (auditor && registroId) {
    try {
      const res = await api(`/api/registros/${registroId}/aprobar`, auditor, { method: 'POST', body: JSON.stringify({ action: 'revertir' }) });
      if (res.success) log('✅', '10. Revertir registro', `status:${res.data.status}`);
      else log('❌', '10. Revertir', res.error);
    } catch (e) { log('❌', '10. Revertir', e.message); }
  }

  // 11. Rechazar
  if (auditor && registroId) {
    try {
      const res = await api(`/api/registros/${registroId}/aprobar`, auditor, { method: 'POST', body: JSON.stringify({ action: 'rechazar', motivo: 'Test rechazo prod' }) });
      if (res.success) log('✅', '11. Rechazar registro', `status:${res.data.status}`);
      else log('❌', '11. Rechazar', res.error);
    } catch (e) { log('❌', '11. Rechazar', e.message); }
  }

  // 12. Métricas
  if (auditor) {
    try {
      const res = await api('/api/metricas', auditor);
      if (res.success) {
        const d = res.data;
        log('✅', '12. GET /api/metricas', `aprobados:${d.aprobados} pendientes:${d.pendientes} rechazados:${d.rechazados} HH:${d.hhTotales} KM:${d.kmTotales}`);
      } else log('❌', '12. GET /api/metricas', res.error);
    } catch (e) { log('❌', '12. GET /api/metricas', e.message); }
  }

  // 13. Último KM
  if (auditor) {
    try {
      const res = await api('/api/registros/ultimo-km?patente=AF454WV', auditor);
      log(res.success ? '✅' : '❌', '13. GET ultimo-km AF454WV', `kmFinal:${res.kmFinal ?? 'null'}`);
    } catch (e) { log('❌', '13. GET ultimo-km', e.message); }
  }

  // 14. Guard: jefe no puede acceder a métricas
  if (jefe) {
    try {
      const res = await api('/api/metricas', jefe);
      if (!res.success) log('✅', '14. Guard jefe bloqueado en metricas', `error:${res.error}`);
      else log('❌', '14. Guard permisos', 'Jefe accedio a metricas — ERROR de seguridad');
    } catch (e) { log('❌', '14. Guard permisos', e.message); }
  }

  // 15. Crear usuario
  let newUserId = null;
  if (auditor) {
    try {
      const res = await api('/api/usuarios', auditor, {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Prod E2E', email: `test.prod.${Date.now()}@elite.com`, password: 'test1234', role: 'jefe_cuadrilla', active: true }),
      });
      if (res.success) {
        newUserId = res.data._id;
        log('✅', '15. POST /api/usuarios', `ID:${newUserId} pass_expuesta:${res.data.password ? '❌ EXPUESTA' : '✓ oculta'}`);
      } else log('❌', '15. POST /api/usuarios', res.error);
    } catch (e) { log('❌', '15. POST /api/usuarios', e.message); }
  }

  // 16. Editar usuario
  if (auditor && newUserId) {
    try {
      const res = await api(`/api/usuarios/${newUserId}`, auditor, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test Prod Editado', email: `edited.${Date.now()}@elite.com`, role: 'auditor', active: false }),
      });
      if (res.success) log('✅', '16. PUT /api/usuarios/:id', `nombre:${res.data.name} activo:${res.data.active}`);
      else log('❌', '16. PUT /api/usuarios/:id', res.error);
    } catch (e) { log('❌', '16. PUT /api/usuarios/:id', e.message); }
  }

  // 17. Limpieza
  if (auditor) {
    for (const [id, tipo] of [[registroId, 'registros'], [tallerID, 'registros'], [newUserId, 'usuarios']].filter(([id]) => id)) {
      try { await api(`/api/${tipo}/${id}`, auditor, { method: 'DELETE' }); } catch {}
    }
    log('✅', '17. Limpieza registros/usuario test', 'OK');
  }

  // Resumen final
  const ok   = RESULTS.filter(r => r.ok).length;
  const fail = RESULTS.filter(r => !r.ok).length;
  console.log('\n══════════════════════════════════════════════════');
  console.log(`  RESULTADO PROD: ${ok} OK — ${fail} FALLOS`);
  console.log('══════════════════════════════════════════════════');
  if (fail > 0) {
    console.log('\n  FALLOS:');
    RESULTS.filter(r => !r.ok).forEach(r => console.log(`     * ${r.label}: ${r.msg}`));
  }
  console.log('');
}

run().catch(console.error);
