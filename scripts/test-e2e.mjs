/**
 * Test E2E punta a punta — flujo completo jefe → auditor
 * Corre contra http://localhost:3000
 *
 * Uso: node scripts/test-e2e.mjs
 */

const BASE = 'http://localhost:3000';
const RESULTS = [];

function log(icon, label, msg) {
  const line = `${icon} ${label.padEnd(45)} ${msg}`;
  console.log(line);
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
  const match = setCookie.match(/next-auth\.session-token=([^;]+)/);
  return match?.[1] ?? null;
}

async function api(path, token, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `next-auth.session-token=${token}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

// ─────────────────────────────────────────────
async function run() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  TEST E2E — SeguimientoElite');
  console.log('══════════════════════════════════════════════════\n');

  // ── 1. LOGIN JEFE ──
  let jefeToken;
  try {
    jefeToken = await login('jefe@elite.com', 'password123');
    if (jefeToken) log('✅', '1. Login jefe@elite.com', 'Token obtenido');
    else log('❌', '1. Login jefe@elite.com', 'No se obtuvo token');
  } catch (e) {
    log('❌', '1. Login jefe@elite.com', e.message);
  }

  // ── 2. CATÁLOGO ──
  if (jefeToken) {
    try {
      const cat = await api('/api/catalogo', jefeToken);
      if (cat.success) {
        const { clientes, proyectos, personal, vehiculos, tiposProyecto } = cat.data;
        log('✅', '2. GET /api/catalogo', `clientes:${clientes.length} proyectos:${proyectos.length} personal:${personal.length} vehículos:${vehiculos.length} tipos:${tiposProyecto.length}`);
        if (!clientes.length) log('⚠️ ', '2b. Catálogo — clientes', 'VACÍO — ejecutar seed');
        if (!vehiculos.length) log('⚠️ ', '2b. Catálogo — vehículos', 'VACÍO — ejecutar seed');
        if (!personal.length)  log('⚠️ ', '2b. Catálogo — personal', 'VACÍO — ejecutar seed');
      } else {
        log('❌', '2. GET /api/catalogo', cat.error || 'error desconocido');
      }
    } catch (e) { log('❌', '2. GET /api/catalogo', e.message); }
  }

  // ── 3. CREAR REGISTRO (jornada campo) ──
  let registroId;
  if (jefeToken) {
    try {
      const payload = {
        fecha: new Date().toISOString().split('T')[0],
        trabajoRealizadoEn: 'campo',
        estadoActividad: 'Productivo',
        llego_al_mastil: 'si',
        clienteNombre: 'Fortescue',
        proyectoNombre: 'MM-ARG-010-CH',
        tipoProyecto: 'M. Preventivo',
        tareaTexto: 'Mantenimiento preventivo de antena principal.\nRevisión de conexiones y ajuste de tornillería.',
        encargadoNombre: 'Amarilla Carlos',
        personalACargo: 'Maza Gabriel, Maza Roman',
        nPersonas: 3,
        vehiculoPatente: 'AF454WV',
        kmInicial: 45000,
        kmFinal: 45320,
        horaInicio: '07:00',
        horaInicioField: '08:30',
        horaFinField: '17:00',
        horaFin: '18:30',
        hospedaje: 'Hotel Patagonia',
        observaciones: 'Sin novedades.',
      };
      const res = await api('/api/registros', jefeToken, { method: 'POST', body: JSON.stringify(payload) });
      if (res.success) {
        registroId = res.data._id;
        log('✅', '3. POST /api/registros (campo)', `ID: ${registroId} status: ${res.data.status}`);
        if (res.data.status !== 'pre_aprobado') log('⚠️ ', '3b. Status inicial', `esperado pre_aprobado, recibido ${res.data.status}`);
      } else {
        log('❌', '3. POST /api/registros (campo)', res.error || JSON.stringify(res));
      }
    } catch (e) { log('❌', '3. POST /api/registros (campo)', e.message); }
  }

  // ── 4. CREAR REGISTRO TALLER ──
  let registroTallerId;
  if (jefeToken) {
    try {
      const payload = {
        fecha: new Date().toISOString().split('T')[0],
        trabajoRealizadoEn: 'taller',
        estadoActividad: 'Productivo',
        tipoProyecto: 'M. Correctivo',
        tareaTexto: 'Reparación de módulo de comunicación en taller.',
        encargadoNombre: 'jefe@elite.com',
        nPersonas: 1,
        horaInicio: '08:00',
        horaFin: '16:00',
      };
      const res = await api('/api/registros', jefeToken, { method: 'POST', body: JSON.stringify(payload) });
      if (res.success) {
        registroTallerId = res.data._id;
        log('✅', '4. POST /api/registros (taller)', `ID: ${registroTallerId} status: ${res.data.status}`);
      } else {
        log('❌', '4. POST /api/registros (taller)', res.error || JSON.stringify(res));
      }
    } catch (e) { log('❌', '4. POST /api/registros (taller)', e.message); }
  }

  // ── 5. JEFE VE SUS REGISTROS ──
  if (jefeToken) {
    try {
      const res = await api('/api/registros', jefeToken);
      if (res.success) log('✅', '5. GET /api/registros (jefe)', `${res.data.length} registros`);
      else log('❌', '5. GET /api/registros (jefe)', res.error);
    } catch (e) { log('❌', '5. GET /api/registros (jefe)', e.message); }
  }

  // ── 6. LOGIN AUDITOR ──
  let auditorToken;
  try {
    auditorToken = await login('auditor@elite.com', 'password123');
    if (auditorToken) log('✅', '6. Login auditor@elite.com', 'Token obtenido');
    else log('❌', '6. Login auditor@elite.com', 'No se obtuvo token');
  } catch (e) { log('❌', '6. Login auditor@elite.com', e.message); }

  // ── 7. AUDITOR VE PENDIENTES ──
  if (auditorToken) {
    try {
      const res = await api('/api/registros?status=pre_aprobado', auditorToken);
      if (res.success) log('✅', '7. GET /api/registros?status=pre_aprobado', `${res.data.length} pendientes`);
      else log('❌', '7. GET /api/registros?status=pre_aprobado', res.error);
    } catch (e) { log('❌', '7. GET /api/registros?status=pre_aprobado', e.message); }
  }

  // ── 8. AUDITOR VE DETALLE ──
  if (auditorToken && registroId) {
    try {
      const res = await api(`/api/registros/${registroId}`, auditorToken);
      if (res.success) {
        const r = res.data;
        const tienePersonal = !!r.personalACargo;
        const tieneTarea = !!r.tareaTexto;
        log('✅', '8. GET /api/registros/:id', `personalACargo: ${tienePersonal ? '✓' : '✗'} tareaTexto: ${tieneTarea ? '✓' : '✗'}`);
      } else {
        log('❌', '8. GET /api/registros/:id', res.error);
      }
    } catch (e) { log('❌', '8. GET /api/registros/:id', e.message); }
  }

  // ── 9. AUDITOR APRUEBA ──
  if (auditorToken && registroId) {
    try {
      const res = await api(`/api/registros/${registroId}/aprobar`, auditorToken, {
        method: 'POST',
        body: JSON.stringify({ action: 'aprobar' }),
      });
      if (res.success) log('✅', '9. POST aprobar registro', `status: ${res.data.status}`);
      else log('❌', '9. POST aprobar registro', res.error);
    } catch (e) { log('❌', '9. POST aprobar registro', e.message); }
  }

  // ── 10. AUDITOR REVIERTE ──
  if (auditorToken && registroId) {
    try {
      const res = await api(`/api/registros/${registroId}/aprobar`, auditorToken, {
        method: 'POST',
        body: JSON.stringify({ action: 'revertir' }),
      });
      if (res.success) log('✅', '10. POST revertir registro', `status: ${res.data.status}`);
      else log('❌', '10. POST revertir registro', res.error);
    } catch (e) { log('❌', '10. POST revertir registro', e.message); }
  }

  // ── 11. AUDITOR RECHAZA ──
  if (auditorToken && registroId) {
    try {
      const res = await api(`/api/registros/${registroId}/aprobar`, auditorToken, {
        method: 'POST',
        body: JSON.stringify({ action: 'rechazar', motivo: 'Test de rechazo automático' }),
      });
      if (res.success) log('✅', '11. POST rechazar registro', `status: ${res.data.status}`);
      else log('❌', '11. POST rechazar registro', res.error);
    } catch (e) { log('❌', '11. POST rechazar registro', e.message); }
  }

  // ── 12. MÉTRICAS ──
  if (auditorToken) {
    try {
      const res = await api('/api/metricas', auditorToken);
      if (res.success) {
        const d = res.data;
        log('✅', '12. GET /api/metricas', `aprobados:${d.aprobados} pendientes:${d.pendientes} rechazados:${d.rechazados} HH:${d.hhTotales} KM:${d.kmTotales}`);
      } else {
        log('❌', '12. GET /api/metricas', res.error);
      }
    } catch (e) { log('❌', '12. GET /api/metricas', e.message); }
  }

  // ── 13. ULTIMO KM (vehículo) ──
  if (auditorToken) {
    try {
      const res = await api('/api/registros/ultimo-km?patente=AF454WV', auditorToken);
      if (res.success) log('✅', '13. GET /api/registros/ultimo-km', `kmFinal: ${res.kmFinal ?? 'null (sin registros aprobados)'}`);
      else log('❌', '13. GET /api/registros/ultimo-km', res.error);
    } catch (e) { log('❌', '13. GET /api/registros/ultimo-km', e.message); }
  }

  // ── 14. JEFE NO PUEDE ACCEDER A MÉTRICAS ──
  if (jefeToken) {
    try {
      const res = await api('/api/metricas', jefeToken);
      if (!res.success) log('✅', '14. Guard: jefe bloqueado en /api/metricas', `error: ${res.error}`);
      else log('❌', '14. Guard: jefe bloqueado en /api/metricas', 'Debería estar bloqueado pero accedió');
    } catch (e) { log('❌', '14. Guard: jefe bloqueado en /api/metricas', e.message); }
  }

  // ── 15. CREAR USUARIO ──
  let newUserId;
  if (auditorToken) {
    try {
      const payload = { name: 'Test E2E User', email: `test.e2e.${Date.now()}@elite.com`, password: 'test1234', role: 'jefe_cuadrilla', active: true };
      const res = await api('/api/usuarios', auditorToken, { method: 'POST', body: JSON.stringify(payload) });
      if (res.success) {
        newUserId = res.data._id;
        const tienePassword = !!res.data.password;
        log('✅', '15. POST /api/usuarios (crear)', `ID: ${newUserId} — password en respuesta: ${tienePassword ? '❌ EXPUESTA' : '✓ oculta'}`);
        if (tienePassword) log('❌', '15b. Seguridad: password expuesta', 'El campo password NO debería estar en la respuesta');
      } else {
        log('❌', '15. POST /api/usuarios (crear)', res.error);
      }
    } catch (e) { log('❌', '15. POST /api/usuarios (crear)', e.message); }
  }

  // ── 16. EDITAR USUARIO ──
  if (auditorToken && newUserId) {
    try {
      const res = await api(`/api/usuarios/${newUserId}`, auditorToken, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test E2E Editado', email: `test.e2e.${Date.now()}@elite.com`, role: 'jefe_cuadrilla', active: false, password: 'nuevapass123' }),
      });
      if (res.success) log('✅', '16. PUT /api/usuarios/:id (editar)', `nombre: ${res.data.name} activo: ${res.data.active}`);
      else log('❌', '16. PUT /api/usuarios/:id (editar)', res.error);
    } catch (e) { log('❌', '16. PUT /api/usuarios/:id (editar)', e.message); }
  }

  // ── 17. ELIMINAR USUARIO TEST ──
  if (auditorToken && newUserId) {
    try {
      const res = await api(`/api/usuarios/${newUserId}`, auditorToken, { method: 'DELETE' });
      if (res.success) log('✅', '17. DELETE /api/usuarios/:id (limpiar test)', 'OK');
      else log('❌', '17. DELETE /api/usuarios/:id', res.error);
    } catch (e) { log('❌', '17. DELETE /api/usuarios/:id', e.message); }
  }

  // ── 18. LIMPIAR registros de test ──
  if (auditorToken) {
    for (const id of [registroId, registroTallerId].filter(Boolean)) {
      try {
        await api(`/api/registros/${id}`, auditorToken, { method: 'DELETE' });
      } catch {}
    }
    log('✅', '18. Limpieza registros de test', 'OK');
  }

  // ── RESUMEN ──
  const ok = RESULTS.filter(r => r.ok).length;
  const fail = RESULTS.filter(r => !r.ok).length;
  console.log('\n══════════════════════════════════════════════════');
  console.log(`  RESULTADO: ${ok} OK — ${fail} FALLOS`);
  console.log('══════════════════════════════════════════════════');
  if (fail > 0) {
    console.log('\n  ❌ FALLOS DETECTADOS:');
    RESULTS.filter(r => !r.ok).forEach(r => console.log(`     • ${r.label}: ${r.msg}`));
  }
  console.log('');
}

run().catch(console.error);
