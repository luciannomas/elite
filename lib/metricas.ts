export function toMinutes(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function calcHH(horaInicio?: string, horaInicioField?: string, horaFinField?: string, horaFin?: string) {
  if (!horaInicio || !horaFin) return { horasTotalesDec: 0, horasSitioDec: 0, horasTrasladoDec: 0 };
  const salHotel = toMinutes(horaInicio);
  const llegMastil = horaInicioField ? toMinutes(horaInicioField) : salHotel;
  const salMastil = horaFinField ? toMinutes(horaFinField) : toMinutes(horaFin);
  const llegHotel = toMinutes(horaFin);
  const sitio = Math.max(0, salMastil - llegMastil) / 60;
  const traslado = Math.max(0, (llegMastil - salHotel) + (llegHotel - salMastil)) / 60;
  const totales = Math.max(0, llegHotel - salHotel) / 60;
  return {
    horasTotalesDec: Math.round(totales * 100) / 100,
    horasSitioDec: Math.round(sitio * 100) / 100,
    horasTrasladoDec: Math.round(traslado * 100) / 100,
  };
}
