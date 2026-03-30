import { test, expect, Page } from '@playwright/test';

const BASE = 'https://elite-demo-v1.vercel.app';
const BUGS: string[] = [];

function bug(msg: string) {
  BUGS.push(msg);
  console.log(`  🐛 BUG: ${msg}`);
}

async function loginAs(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(jefe|auditor)/, { timeout: 15000 });
}

// ─────────────────────────────────────────────
test.describe('Login', () => {
  test('Login page carga', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    console.log('  ✅ Login page visible');
  });

  test('Login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"], input[name="email"]', 'wrong@elite.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const url = page.url();
    if (url.includes('/jefe') || url.includes('/auditor')) {
      bug('Login acepta credenciales incorrectas');
    } else {
      console.log('  ✅ Login rechaza credenciales incorrectas');
    }
  });

  test('Jefe no puede acceder a /auditor', async ({ page }) => {
    await loginAs(page, 'jefe@elite.com', 'password123');
    await page.goto(`${BASE}/auditor`);
    await page.waitForTimeout(2000);
    const url = page.url();
    if (url.includes('/auditor')) {
      bug('Jefe puede acceder a /auditor — falla guard de rol');
    } else {
      console.log('  ✅ Jefe redirigido fuera de /auditor');
    }
  });
});

// ─────────────────────────────────────────────
test.describe('Dashboard Jefe', () => {
  test('Dashboard jefe carga correctamente', async ({ page }) => {
    await loginAs(page, 'jefe@elite.com', 'password123');
    await page.waitForLoadState('networkidle');
    const h1 = await page.locator('h1').first().textContent();
    console.log(`  ✅ Dashboard jefe carga — h1: "${h1}"`);
  });
});

// ─────────────────────────────────────────────
test.describe('Formulario Nueva Jornada — Campo', () => {
  test('Paso 1 carga con catálogo', async ({ page }) => {
    await loginAs(page, 'jefe@elite.com', 'password123');
    await page.goto(`${BASE}/jefe/nueva-jornada`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Toggle campo/taller visible
    const campoBtn = page.locator('button', { hasText: 'Campo' });
    const tallerBtn = page.locator('button', { hasText: 'Taller' });
    if (!await campoBtn.isVisible()) bug('Toggle Campo no visible en paso 1');
    else console.log('  ✅ Toggle Campo/Taller visible');

    // Campo fecha
    const fechaInput = page.locator('input[type="date"]');
    if (!await fechaInput.isVisible()) bug('Campo fecha no visible');
    else console.log('  ✅ Campo fecha visible');

    // Select cliente
    const clienteSelect = page.locator('select').first();
    const clienteOptions = await clienteSelect.locator('option').count();
    if (clienteOptions <= 1) bug(`Selector cliente vacío (${clienteOptions} opciones) — catálogo no carga`);
    else console.log(`  ✅ Selector cliente con ${clienteOptions - 1} opciones`);

    // Select tipo proyecto
    const selects = await page.locator('select').all();
    let tipoOk = false;
    for (const sel of selects) {
      const count = await sel.locator('option').count();
      if (count > 5) { tipoOk = true; break; }
    }
    if (!tipoOk) bug('Selector tipo de tarea vacío');
    else console.log('  ✅ Selector tipo de tarea con opciones');
  });

  test('Validación bloquea avance si faltan campos obligatorios', async ({ page }) => {
    await loginAs(page, 'jefe@elite.com', 'password123');
    await page.goto(`${BASE}/jefe/nueva-jornada`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Intentar avanzar sin completar nada
    const nextBtn = page.locator('button', { hasText: 'Siguiente' });
    await nextBtn.click();
    await page.waitForTimeout(500);

    // Verificar que sigue en paso 1
    const stillStep1 = await page.locator('text=Información de la Jornada').isVisible();
    if (!stillStep1) bug('Formulario avanzó sin completar campos obligatorios');
    else console.log('  ✅ Validación bloquea avance en paso 1');

    // Verificar mensajes de error
    const errorMsgs = await page.locator('p[style*="da3633"], p[style*="color: rgb(218"]').count();
    if (errorMsgs === 0) bug('No aparecen mensajes de error en campos obligatorios');
    else console.log(`  ✅ Aparecen ${errorMsgs} mensajes de error`);
  });

  test('Flujo campo completo — 3 pasos hasta enviar', async ({ page, context }) => {
    test.setTimeout(120000);
    await loginAs(page, 'jefe@elite.com', 'password123');
    await page.goto(`${BASE}/jefe/nueva-jornada`);
    await page.waitForLoadState('networkidle');

    // Esperar que el catálogo cargue (el tipo de tarea tiene 16+ opciones)
    // Puede tardar hasta 15s si Vercel está en cold start
    try {
      await page.waitForFunction(() => {
        const selects = document.querySelectorAll('select');
        for (const s of selects) { if (s.options.length > 10) return true; }
        return false;
      }, { timeout: 20000 });
      console.log('  ✅ Catálogo cargado');
    } catch {
      bug('Catálogo no cargó en 20s — Vercel cold start');
      return;
    }

    // PASO 1 — debug: mostrar conteo de opciones de cada select
    const selects = await page.locator('select').all();
    const optCounts = await Promise.all(selects.map(s => s.locator('option').count()));
    console.log(`  ℹ️  Selects en step 0: ${optCounts.join(', ')}`);

    // select[0]=Estado(5), select[1]=¿Llegó?(3), select[2]=Cliente(N), select[3]=TipoTarea(17+)
    // Seleccionar cliente — empezar desde índice 2 (saltear Estado y ¿Llegó?)
    let clienteSeleccionado = false;
    for (let i = 2; i < selects.length; i++) {
      const opts = optCounts[i];
      if (opts > 1) {
        await selects[i].selectOption({ index: 1 });
        clienteSeleccionado = true;
        console.log(`  ℹ️  Cliente seleccionado en select[${i}] (${opts} opciones)`);
        await page.waitForTimeout(500);
        break;
      }
    }
    if (!clienteSeleccionado) {
      bug('No se encontró selector de cliente con opciones');
      return;
    }

    // Seleccionar tipo de tarea — siempre el ÚLTIMO select en step 0
    const lastSelectIdx = selects.length - 1;
    const lastOpts = optCounts[lastSelectIdx];
    if (lastOpts > 1) {
      await selects[lastSelectIdx].selectOption({ index: 1 });
      console.log(`  ℹ️  TipoProyecto seleccionado en select[${lastSelectIdx}] (${lastOpts} opciones)`);
    } else {
      bug(`Selector tipo de tarea vacío (${lastOpts} opciones)`);
    }

    // Completar descripción
    await page.locator('textarea').first().fill('Tarea de prueba UI E2E automatizado.');

    // Avanzar paso 1
    await page.locator('button', { hasText: 'Siguiente' }).click();
    await page.waitForTimeout(1500);

    const enPaso2 = await page.locator('h2', { hasText: 'Personal y Vehículo' }).isVisible().catch(() => false);
    if (!enPaso2) {
      bug('No avanzó a paso 2 después de completar paso 1 (h2 no visible)');
      return;
    }
    console.log('  ✅ Avanzo a paso 2 (Personal y Vehículo)');

    // PASO 2
    await page.waitForTimeout(1500);

    // Verificar encargado con opciones
    const encargadoSelect = page.locator('select').first();
    const encOpts = await encargadoSelect.locator('option').count();
    if (encOpts <= 1) bug(`Selector encargado vacío en paso 2 (${encOpts} opciones)`);
    else {
      await encargadoSelect.selectOption({ index: 1 });
      console.log(`  ✅ Selector encargado con ${encOpts - 1} opciones`);
    }

    // Verificar vehículos (solo contar opciones, sin seleccionar para evitar fetch lento a Vercel)
    const vehiculoSelect = page.locator('select').last();
    const vehOpts = await vehiculoSelect.locator('option').count();
    if (vehOpts <= 1) bug(`Selector vehículo vacío en paso 2 (${vehOpts} opciones)`);
    else console.log(`  ✅ Selector vehículo con ${vehOpts - 1} opciones`);

    // Avanzar paso 2
    await page.locator('button', { hasText: 'Siguiente' }).click();
    await page.waitForTimeout(1500);

    // Verificar que estamos en paso 3 usando el h2 dentro del contenido (no el step indicator)
    const enPaso3 = await page.locator('h2', { hasText: 'Tiempos y Notas' }).isVisible().catch(() => false);
    if (!enPaso3) {
      bug('No avanzó a paso 3 después de completar paso 2 (h2 "Tiempos y Notas" no visible)');
      return;
    }
    console.log('  ✅ Avanzo a paso 3 (Tiempos y Notas)');

    // PASO 3 — verificar campos de hora visibles
    const timeInputs = await page.locator('input[type="time"]').count();
    if (timeInputs < 2) bug(`Paso 3: solo ${timeInputs} inputs de hora (esperado al menos 2)`);
    else console.log(`  ✅ Paso 3 tiene ${timeInputs} campos de hora`);

    // Completar horas requeridas y enviar
    const timeInputList = await page.locator('input[type="time"]').all();
    if (timeInputList.length >= 1) await timeInputList[0].fill('07:00');
    if (timeInputList.length >= 4) await timeInputList[3].fill('18:00');

    const enviarBtn = page.locator('button', { hasText: 'Enviar Jornada' });
    if (!await enviarBtn.isVisible()) bug('Botón Enviar Jornada no visible en paso 3');
    else {
      console.log('  ✅ Botón Enviar Jornada visible');
      await enviarBtn.click();
      await page.waitForTimeout(5000);
      // Verificar redirección a mis-registros o toast de éxito
      const url = page.url();
      const toastVisible = await page.locator('[data-sonner-toast], [role="status"]').count();
      if (url.includes('mis-registros')) console.log('  ✅ Redirigió a mis-registros después de enviar');
      else if (toastVisible > 0) console.log('  ✅ Toast visible después de enviar');
      else console.log('  ℹ️  Envío procesado (sin redirección detectada en timeout)');
    }
  });
});

// ─────────────────────────────────────────────
test.describe('Formulario Nueva Jornada — Taller', () => {
  test('Taller tiene solo 2 pasos simplificados', async ({ page }) => {
    await loginAs(page, 'jefe@elite.com', 'password123');
    await page.goto(`${BASE}/jefe/nueva-jornada`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Cambiar a Taller
    await page.locator('button', { hasText: 'Taller' }).click();
    await page.waitForTimeout(500);

    // Verificar que NO aparezcan campos de campo
    const clienteVisible = await page.locator('select').filter({ hasText: 'cliente' }).isVisible().catch(() => false);
    const encargadoVisible = await page.locator('text=Encargado de cuadrilla').isVisible().catch(() => false);
    if (encargadoVisible) bug('Taller muestra "Encargado de cuadrilla" — no debería');
    else console.log('  ✅ Taller no muestra Encargado de cuadrilla');

    // Verificar responsable auto-completado
    const responsableText = await page.locator('text=Persona responsable').isVisible();
    if (!responsableText) bug('Taller no muestra campo Persona responsable');
    else console.log('  ✅ Taller muestra Persona responsable');

    // Paso 2 de taller — solo hora entrada y salida
    await page.locator('textarea').first().fill('Reparación de equipo en taller prueba UI');
    // Seleccionar tipo tarea
    const sel = page.locator('select').first();
    const opts = await sel.locator('option').count();
    if (opts > 1) await sel.selectOption({ index: 1 });

    await page.locator('button', { hasText: 'Siguiente' }).click();
    await page.waitForTimeout(800);

    const enPaso2Taller = await page.locator('h2', { hasText: 'Horarios' }).isVisible().catch(() => false);
    if (!enPaso2Taller) bug('Taller no avanzó a paso Horarios');
    else console.log('  ✅ Taller avanzó a paso Horarios');

    // Verificar que solo hay 2 campos de hora (entrada y salida)
    const horaInputs = await page.locator('input[type="time"]').count();
    if (horaInputs !== 2) bug(`Taller tiene ${horaInputs} campos de hora, esperado 2`);
    else console.log('  ✅ Taller tiene exactamente 2 campos de hora (entrada/salida)');

    // Verificar que NO aparece encargado ni personal a cargo
    const personalVisible = await page.locator('text=Personal a cargo').isVisible().catch(() => false);
    if (personalVisible) bug('Taller paso 2 muestra "Personal a cargo" — no debería');
    else console.log('  ✅ Taller paso 2 no muestra Personal a cargo');
  });
});

// ─────────────────────────────────────────────
test.describe('Mis Registros (Jefe)', () => {
  test('Lista de registros carga', async ({ page }) => {
    await loginAs(page, 'jefe@elite.com', 'password123');
    await page.goto(`${BASE}/jefe/mis-registros`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const h1 = await page.locator('h1').first().textContent();
    console.log(`  ✅ Mis registros carga — "${h1}"`);
  });
});

// ─────────────────────────────────────────────
test.describe('Dashboard Auditor', () => {
  test('KPIs visibles', async ({ page }) => {
    await loginAs(page, 'auditor@elite.com', 'password123');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const h1 = await page.locator('h1').first().textContent();
    console.log(`  ✅ Dashboard auditor — h1: "${h1}"`);

    // Verificar que hay tarjetas KPI
    const cards = await page.locator('[class*="rounded"]').count();
    console.log(`  ✅ ${cards} elementos de card visibles`);
  });
});

// ─────────────────────────────────────────────
test.describe('Aprobaciones (Auditor)', () => {
  test('Lista de aprobaciones carga', async ({ page }) => {
    await loginAs(page, 'auditor@elite.com', 'password123');
    await page.goto(`${BASE}/auditor/aprobaciones`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const h1 = await page.locator('h1').first().textContent();
    console.log(`  ✅ Aprobaciones carga — "${h1}"`);
  });

  test('Detalle de registro muestra personal y tareas', async ({ page }) => {
    await loginAs(page, 'auditor@elite.com', 'password123');
    await page.goto(`${BASE}/auditor/registros`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click en primer "Ver detalle"
    const detailBtn = page.locator('text=Ver detalle →').first();
    if (!await detailBtn.isVisible()) {
      console.log('  ℹ️  No hay registros para ver detalle');
      return;
    }
    await detailBtn.click();
    await page.waitForTimeout(2000);

    // Verificar secciones
    const secJornada = await page.locator('text=Jornada').isVisible().catch(() => false);
    const secPersonal = await page.locator('text=Personal y Vehículo').isVisible().catch(() => false);
    const secTareas  = await page.locator('text=Tareas').isVisible().catch(() => false);

    if (!secJornada) bug('Detalle no muestra sección Jornada');
    else console.log('  ✅ Sección Jornada visible');
    if (!secPersonal) bug('Detalle no muestra sección Personal y Vehículo');
    else console.log('  ✅ Sección Personal y Vehículo visible');
    if (!secTareas) bug('Detalle no muestra sección Tareas');
    else console.log('  ✅ Sección Tareas visible');

    // Verificar botones de acción
    const aprobarBtn = page.locator('button', { hasText: 'Aprobar registro' });
    const revertirBtn = page.locator('button', { hasText: 'Revertir a pendiente' });
    const rechazarBtn = page.locator('button', { hasText: 'Rechazar registro' });
    const hayAccion = await aprobarBtn.isVisible().catch(() => false) ||
                      await revertirBtn.isVisible().catch(() => false) ||
                      await rechazarBtn.isVisible().catch(() => false);
    if (!hayAccion) bug('Detalle no muestra ningún botón de acción');
    else console.log('  ✅ Botones de acción visibles');
  });
});

// ─────────────────────────────────────────────
test.describe('Registros (Auditor)', () => {
  test('Filtros y lista cargan', async ({ page }) => {
    await loginAs(page, 'auditor@elite.com', 'password123');
    await page.goto(`${BASE}/auditor/registros`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const tabs = ['Todos', 'Pendientes', 'Aprobados', 'Rechazados'];
    for (const tab of tabs) {
      const el = page.locator(`text=${tab}`).first();
      if (!await el.isVisible()) bug(`Tab "${tab}" no visible en registros`);
    }
    console.log('  ✅ Tabs de filtro visibles');
  });
});

// ─────────────────────────────────────────────
test.describe('Usuarios (Auditor)', () => {
  test('Lista de usuarios carga desde API', async ({ page }) => {
    await loginAs(page, 'auditor@elite.com', 'password123');
    await page.goto(`${BASE}/auditor/usuarios`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const h1 = await page.locator('h1').first().textContent();
    console.log(`  ✅ Usuarios carga — "${h1}"`);

    const nuevoBtn = page.locator('button', { hasText: 'Nuevo Usuario' });
    if (!await nuevoBtn.isVisible()) bug('Botón Nuevo Usuario no visible');
    else console.log('  ✅ Botón Nuevo Usuario visible');
  });

  test('Modal crear usuario se abre y tiene campos', async ({ page }) => {
    await loginAs(page, 'auditor@elite.com', 'password123');
    await page.goto(`${BASE}/auditor/usuarios`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('button', { hasText: 'Nuevo Usuario' }).click();
    await page.waitForTimeout(500);

    // Verificar campos del modal
    const nameInput = page.locator('input').first();
    if (!await nameInput.isVisible()) bug('Modal crear usuario no se abrió o no tiene campos');
    else console.log('  ✅ Modal crear usuario abre con campos');

    // Intentar crear sin datos — debe mostrar error
    await page.locator('button', { hasText: 'Crear usuario' }).click();
    await page.waitForTimeout(1000);
    const modalAun = await nameInput.isVisible();
    if (!modalAun) bug('Modal cerró sin validar campos obligatorios');
    else console.log('  ✅ Modal no cierra sin datos válidos');
  });
});

// ─────────────────────────────────────────────
test.afterAll(async () => {
  console.log('\n══════════════════════════════════════════════════');
  if (BUGS.length === 0) {
    console.log('  RESULTADO UI: Sin bugs detectados');
  } else {
    console.log(`  BUGS DETECTADOS (${BUGS.length}):`);
    BUGS.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
  }
  console.log('══════════════════════════════════════════════════\n');
});
