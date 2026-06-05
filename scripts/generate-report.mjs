import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUTPUT = path.join(process.cwd(), 'Reporte-Correcciones-Elite.pdf');

const C = {
  bg: '#0f1117',
  surface: '#161b22',
  border: '#21262d',
  blue: '#1d6fb8',
  green: '#238636',
  red: '#da3633',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
  white: '#ffffff',
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

const doc = new PDFDocument({ size: 'A4', margins: { top: 0, bottom: 0, left: 0, right: 0 }, bufferPages: true });
doc.pipe(fs.createWriteStream(OUTPUT));

const W = doc.page.width;
const MARGIN = 50;
const CONTENT_W = W - MARGIN * 2;

function rgb(hex) { return hexToRgb(hex); }
function fill(hex) { doc.fillColor(rgb(hex)); }
function stroke(hex) { doc.strokeColor(rgb(hex)); }

// ── COVER PAGE ──────────────────────────────────────────────────────────────

// Background
doc.rect(0, 0, W, doc.page.height).fill(rgb(C.bg));

// Top accent bar
doc.rect(0, 0, W, 6).fill(rgb(C.blue));

// Logo area circle
doc.circle(W/2, 130, 45).fill(rgb(C.surface));
doc.circle(W/2, 130, 45).lineWidth(2).stroke(rgb(C.blue));
fill(C.blue);
doc.fontSize(28).font('Helvetica-Bold').text('E', W/2 - 10, 116);

// Title
fill(C.white);
doc.fontSize(32).font('Helvetica-Bold').text('Reporte de Correcciones', MARGIN, 210, { align: 'center', width: CONTENT_W });
fill(C.blue);
doc.fontSize(18).font('Helvetica').text('Elite — Seguimiento Operativo', MARGIN, 252, { align: 'center', width: CONTENT_W });

// Divider
doc.rect(W/2 - 60, 285, 120, 2).fill(rgb(C.blue));

// Info pills
const pillY = 310;
const pills = [
  { label: 'Versión Web + App Móvil' },
  { label: 'Junio 2026' },
  { label: '14 correcciones' },
];
const pillW = 150;
const pillSpacing = 160;
const startX = W/2 - (pillSpacing);
pills.forEach((p, i) => {
  const x = startX + i * pillSpacing;
  doc.roundedRect(x - pillW/2, pillY, pillW, 28, 14).fill(rgb(C.surface));
  doc.roundedRect(x - pillW/2, pillY, pillW, 28, 14).lineWidth(1).stroke(rgb(C.border));
  fill(C.textPrimary);
  doc.fontSize(10).font('Helvetica').text(p.label, x - pillW/2, pillY + 8, { width: pillW, align: 'center' });
});

// Summary box
const sumY = 380;
doc.roundedRect(MARGIN, sumY, CONTENT_W, 90, 10).fill(rgb(C.surface));
doc.roundedRect(MARGIN, sumY, CONTENT_W, 90, 10).lineWidth(1).stroke(rgb(C.border));
fill(C.textMuted);
doc.fontSize(11).font('Helvetica').text(
  'Se realizó una revisión completa de la plataforma Elite Seguimiento Operativo en sus dos versiones: aplicación web y aplicación móvil para iOS/Android. A continuación se detallan los 14 problemas identificados, su descripción y cómo fueron resueltos.',
  MARGIN + 20, sumY + 20, { width: CONTENT_W - 40, lineGap: 4 }
);

// Stats row
const statsY = 500;
const stats = [
  { num: '9', label: 'Bugs Web', color: C.blue },
  { num: '5', label: 'Bugs App', color: C.green },
  { num: '14', label: 'Total resueltos', color: C.textMuted },
];
stats.forEach((s, i) => {
  const x = MARGIN + i * (CONTENT_W / 3);
  const bw = CONTENT_W / 3 - 10;
  doc.roundedRect(x, statsY, bw, 80, 8).fill(rgb(C.surface));
  doc.rect(x, statsY, 4, 80).fill(rgb(s.color));
  fill(s.color);
  doc.fontSize(36).font('Helvetica-Bold').text(s.num, x + 20, statsY + 12);
  fill(C.textMuted);
  doc.fontSize(11).font('Helvetica').text(s.label, x + 20, statsY + 52);
});

// Note at bottom of cover
fill(C.textMuted);
doc.fontSize(9).font('Helvetica').text('Preparado por Equipo de Desarrollo · Junio 2026', MARGIN, doc.page.height - 50, { align: 'center', width: CONTENT_W });
doc.rect(0, doc.page.height - 4, W, 4).fill(rgb(C.green));

// ── CONTENT PAGES ──────────────────────────────────────────────────────────

const WEB_BUGS = [
  {
    title: 'Stand-By bloqueaba el formulario',
    what: 'Cuando el jefe de cuadrilla seleccionaba "Stand-By" como estado de actividad, el formulario no permitía avanzar al siguiente paso aunque todos los campos estuvieran completos. Esto obligaba al usuario a cambiar el estado o abandonar el registro.',
    how: 'Se corrigió la validación del formulario para que revise los campos en el momento correcto según el paso actual, permitiendo avanzar sin inconvenientes cuando el estado es Stand-By.',
  },
  {
    title: 'Se permitía cargar kilómetros finales menores a los iniciales',
    what: 'Al registrar una jornada era posible ingresar un odómetro final menor al inicial. Esto generaba kilómetros negativos (por ejemplo: -200 km) visibles en los reportes del auditor, afectando la integridad de los datos.',
    how: 'Se agregó una validación que detecta el error al intentar avanzar y muestra un mensaje claro indicando que el KM final no puede ser menor al inicial.',
  },
  {
    title: 'El jefe no podía ver el motivo de rechazo ni sus datos cargados',
    what: 'Cuando un auditor rechazaba un registro, el jefe de cuadrilla no tenía forma de ver el motivo del rechazo ni los datos que había cargado originalmente. Esto generaba confusión y consultas innecesarias.',
    how: 'Se habilitó una pantalla de detalle de solo lectura desde "Mis Registros". El jefe puede ver todos los datos del registro y el motivo de rechazo aparece resaltado en la parte superior de la pantalla.',
  },
  {
    title: 'El campo "OV Odoo" era visible para el jefe de cuadrilla',
    what: 'El campo "OV Odoo" (número de orden de venta) aparecía en el formulario que completa el jefe, cuando ese dato solo debería ser gestionado por el auditor o el administrador.',
    how: 'Se eliminó el campo OV del formulario del jefe. Ahora únicamente es visible y editable desde la vista del auditor y del administrador.',
  },
  {
    title: 'En modo Taller aparecían opciones de tareas incorrectas',
    what: 'Al seleccionar "Taller" como tipo de trabajo, el campo "Tipo de tarea" mostraba las mismas opciones que para trabajo de campo (instalaciones, mantenimiento, relevamientos, etc.), que no corresponden a una jornada realizada en taller.',
    how: 'Se reemplazaron las opciones por las tres correctas: Taller San José, Taller Madryn y Proyecto Integra. El campo fue renombrado como "Lugar del taller" para mayor claridad.',
  },
  {
    title: 'La vista del auditor mostraba datos irrelevantes en registros de Taller',
    what: 'Al revisar un registro de taller, el auditor veía campos como "¿Llegó al mástil?", kilómetros recorridos y vehículo, que no aplican para jornadas en taller. Los horarios aparecían como "Salida del hotel" y "Llegada al hotel".',
    how: 'Para registros de tipo Taller, se ocultan automáticamente los campos de mástil, vehículo y kilómetros. Los horarios ahora se muestran como "Ingreso al taller" y "Salida del taller".',
  },
  {
    title: 'El auditor no podía modificar el campo OV Odoo',
    what: 'El número de orden OV se mostraba como texto estático en la vista del auditor, sin opción de editarlo en caso de que estuviera incorrecto o desactualizado.',
    how: 'Se agregó un botón de edición junto al campo OV. El auditor puede modificarlo directamente desde la vista de detalle sin necesidad de rechazar el registro.',
  },
  {
    title: 'Faltaban filtros para buscar registros',
    what: 'El administrador solo podía filtrar registros por estado (pendiente, aprobado, rechazado), sin posibilidad de buscar por cliente, encargado, tipo de tarea, proyecto ni rango de fechas.',
    how: 'Se incorporó un panel de filtros completo que permite combinar búsquedas por cliente, encargado, tipo de tarea, nombre de proyecto, fecha desde y fecha hasta.',
  },
  {
    title: 'El Super Admin no podía editar los datos cargados por el jefe',
    what: 'Una vez que el jefe enviaba un registro, el Super Admin no podía corregir errores en los datos: fechas, horarios, kilómetros, descripción de tareas, etc. La única opción era rechazar el registro y pedirle al jefe que lo volviera a cargar.',
    how: 'Se habilitó un modo de edición exclusivo para el Super Admin. Un botón "Editar" en la vista de detalle despliega todos los campos modificables y los cambios se guardan directamente.',
  },
];

const APP_BUGS = [
  {
    title: 'Los campos de hora aceptaban letras y caracteres inválidos',
    what: 'En los campos de hora (entrada, salida, llegada al mástil, etc.) el teclado permitía escribir letras y cualquier símbolo. Esto generaba horas inválidas que producían errores en los cálculos de horas trabajadas.',
    how: 'Se configuró el teclado numérico exclusivo para esos campos. Se agregó formato automático: al escribir "0800" se convierte automáticamente a "08:00", y se valida que la hora sea válida (00:00 a 23:59) antes de avanzar.',
  },
  {
    title: 'El estado de actividad no aparecía en el formulario de campo',
    what: 'Al seleccionar "Campo" como tipo de trabajo en la app, el campo "Estado de actividad" (Productivo, Stand-by, Viaje, Administrativo) no aparecía en el formulario. Todos los registros de campo quedaban sin este dato.',
    how: 'Se incorporó el selector de estado de actividad en el primer paso del formulario de trabajo en campo, con las cuatro opciones disponibles correctamente visibles.',
  },
  {
    title: 'En modo Taller aparecían opciones de tareas incorrectas',
    what: 'Al igual que en la versión web, al seleccionar "Taller" como tipo de trabajo en la app, el campo de tipo de tarea mostraba el catálogo general de tareas de campo, que no corresponde a jornadas en taller.',
    how: 'Se corrigió para mostrar únicamente las tres opciones correctas: Taller San José, Taller Madryn y Proyecto Integra.',
  },
  {
    title: 'Volver al inicio después de aprobar registros requería muchos toques',
    what: 'Cada vez que el auditor aprobaba o rechazaba un registro, la app acumulaba pantallas en el historial. Tras procesar varios registros, el usuario necesitaba presionar "Volver" muchas veces para regresar al inicio.',
    how: 'Se corrigió la navegación para que al confirmar una acción la app regrese directamente a la lista de pendientes. Además se incorporó un botón "Inicio" en el encabezado de la pantalla de detalle.',
  },
  {
    title: 'El dashboard del auditor mostraba pendientes ya aprobados',
    what: 'Al regresar al dashboard después de aprobar registros, la pantalla seguía mostrando esos registros como pendientes y los contadores (aprobados, rechazados, pendientes) no se actualizaban.',
    how: 'Se implementó una actualización automática de todos los datos del dashboard cada vez que el auditor navega hacia esa pantalla. Los contadores y la lista de pendientes reflejan el estado real en tiempo real.',
  },
];

let currentY = 0;

function newPage(bgDark = true) {
  doc.addPage();
  if (bgDark) {
    doc.rect(0, 0, W, doc.page.height).fill(rgb(C.bg));
  }
  doc.rect(0, 0, W, 4).fill(rgb(C.blue));
  currentY = 30;
}

function sectionHeader(title, subtitle, color) {
  // Header bar
  doc.rect(MARGIN, currentY, CONTENT_W, 56).fill(rgb(C.surface));
  doc.rect(MARGIN, currentY, 5, 56).fill(rgb(color));
  fill(C.white);
  doc.fontSize(16).font('Helvetica-Bold').text(title, MARGIN + 20, currentY + 10);
  fill(C.textMuted);
  doc.fontSize(11).font('Helvetica').text(subtitle, MARGIN + 20, currentY + 32);
  currentY += 70;
}

function bugCard(num, bug, color, sectionLabel) {
  // Estimate height needed
  const whatHeight = doc.heightOfString(bug.what, { width: CONTENT_W - 120, fontSize: 10 });
  const howHeight = doc.heightOfString(bug.how, { width: CONTENT_W - 120, fontSize: 10 });
  const cardHeight = 38 + whatHeight + howHeight + 70;

  if (currentY + cardHeight > doc.page.height - 60) {
    newPage();
  }

  // Card background
  doc.roundedRect(MARGIN, currentY, CONTENT_W, cardHeight, 8).fill(rgb(C.surface));
  doc.roundedRect(MARGIN, currentY, CONTENT_W, cardHeight, 8).lineWidth(1).stroke(rgb(C.border));
  // Left accent
  doc.rect(MARGIN, currentY, 4, cardHeight).fill(rgb(color));

  // Number badge
  doc.circle(MARGIN + 26, currentY + 20, 14).fill(rgb(color));
  fill(C.white);
  doc.fontSize(11).font('Helvetica-Bold').text(num.toString(), MARGIN + 19, currentY + 13);

  // Section label pill
  const labelW = 60;
  doc.roundedRect(MARGIN + CONTENT_W - labelW - 15, currentY + 10, labelW, 18, 9).fill(rgb('#ffffff15'));
  fill(C.textMuted);
  doc.fontSize(8).font('Helvetica').text(sectionLabel, MARGIN + CONTENT_W - labelW - 15, currentY + 14, { width: labelW, align: 'center' });

  // Title
  fill(C.textPrimary);
  doc.fontSize(12).font('Helvetica-Bold').text(bug.title, MARGIN + 48, currentY + 12, { width: CONTENT_W - 130 });
  currentY += 38;

  // QUE PASABA
  fill(C.textMuted);
  doc.fontSize(9).font('Helvetica-Bold').text('QUE PASABA', MARGIN + 20, currentY);
  currentY += 14;
  fill(C.textMuted);
  doc.fontSize(10).font('Helvetica').text(bug.what, MARGIN + 20, currentY, { width: CONTENT_W - 40, lineGap: 2 });
  currentY += whatHeight + 10;

  // COMO SE RESOLVIO
  fill(C.green);
  doc.fontSize(9).font('Helvetica-Bold').text('COMO SE RESOLVIO', MARGIN + 20, currentY);
  currentY += 14;
  fill(C.textPrimary);
  doc.fontSize(10).font('Helvetica').text(bug.how, MARGIN + 20, currentY, { width: CONTENT_W - 40, lineGap: 2 });
  currentY += howHeight + 18;
}

// Web section
newPage();
sectionHeader('Version Web', '9 correcciones aplicadas', C.blue);
WEB_BUGS.forEach((bug, i) => {
  bugCard(i + 1, bug, C.blue, 'WEB');
});

// App section
newPage();
sectionHeader('App Movil', '5 correcciones aplicadas · iOS y Android', C.green);
APP_BUGS.forEach((bug, i) => {
  bugCard(i + 1, bug, C.green, 'APP');
});

// Final page
newPage();
// Closing card
const closeY = 80;
doc.roundedRect(MARGIN, closeY, CONTENT_W, 200, 12).fill(rgb(C.surface));
doc.roundedRect(MARGIN, closeY, CONTENT_W, 200, 12).lineWidth(1).stroke(rgb(C.border));
doc.rect(MARGIN, closeY, CONTENT_W, 4).fill(rgb(C.green));

fill(C.green);
doc.fontSize(14).font('Helvetica-Bold').text('Mejora recomendada', MARGIN + 30, closeY + 25);
fill(C.textMuted);
doc.fontSize(11).font('Helvetica').text(
  'Base de datos en la nube',
  MARGIN + 30, closeY + 48, { continued: false }
);
fill(C.textMuted);
doc.fontSize(10).font('Helvetica').text(
  'Como mejora futura de alto impacto, se recomienda la integracion de una base de datos en la nube. Esta incorporacion permitira que toda la informacion operativa quede centralizada, respaldada y accesible desde cualquier dispositivo, representando un salto significativo en la confiabilidad y escalabilidad de la plataforma.',
  MARGIN + 30, closeY + 68, { width: CONTENT_W - 60, lineGap: 3 }
);

// Final status
const statusY = closeY + 230;
doc.roundedRect(MARGIN, statusY, CONTENT_W, 80, 10).fill(rgb('#238636' + '20'));
doc.roundedRect(MARGIN, statusY, CONTENT_W, 80, 10).lineWidth(1).stroke(rgb(C.green));
fill(C.green);
doc.fontSize(22).font('Helvetica-Bold').text('14 / 14', MARGIN + 30, statusY + 15);
fill(C.textMuted);
doc.fontSize(12).font('Helvetica').text('correcciones completadas y verificadas', MARGIN + 100, statusY + 20);
fill(C.textMuted);
doc.fontSize(10).font('Helvetica').text('Plataforma lista para uso operativo', MARGIN + 100, statusY + 42);

// Footer
fill(C.textMuted);
doc.fontSize(9).font('Helvetica').text('Elite Seguimiento Operativo · Reporte de Correcciones · Junio 2026', MARGIN, doc.page.height - 40, { align: 'center', width: CONTENT_W });
doc.rect(0, doc.page.height - 4, W, 4).fill(rgb(C.green));

// Page numbers on all pages
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  if (i > 0) {
    fill(C.textMuted);
    doc.fontSize(9).font('Helvetica').text(`${i + 1}`, W - MARGIN - 20, doc.page.height - 30, { width: 20, align: 'right' });
  }
}

doc.end();
console.log('PDF generado:', OUTPUT);
