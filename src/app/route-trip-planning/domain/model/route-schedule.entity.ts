/** Días de servicio aceptados por la planificación de rutas. */
export const ROUTE_WEEKDAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
  'FRIDAY', 'SATURDAY', 'SUNDAY',
] as const;

export type RouteWeekday = typeof ROUTE_WEEKDAYS[number];

export const ROUTE_WEEKDAY_LABELS: Record<RouteWeekday, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

/** Un registro por día: no depende del estado visual del formulario. */
export interface RouteSchedule {
  dayOfWeek: RouteWeekday;
  departureTime: string; // HH:mm (hora local del servicio)
}

export function isValidRouteTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isValidRouteSchedule(schedule: RouteSchedule[]): boolean {
  if (schedule.length === 0) return false;
  const days = new Set<RouteWeekday>();
  for (const row of schedule) {
    if (!ROUTE_WEEKDAYS.includes(row.dayOfWeek) || !isValidRouteTime(row.departureTime)) {
      return false;
    }
    if (days.has(row.dayOfWeek)) return false;
    days.add(row.dayOfWeek);
  }
  return true;
}
