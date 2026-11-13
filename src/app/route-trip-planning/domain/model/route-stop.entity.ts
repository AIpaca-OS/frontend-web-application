/**
 * Parada ordenada de una ruta.
 * RMW-20: cada parada podrá vincular a un estudiante autorizado al integrar la API.
 * La ausencia de estudiante se permite mientras la ruta siga configurable.
 */
export interface RouteStop {
  id: string | null;
  address: string;
  position: number;
  studentId?: string | null;
  studentIds?: string[];
  studentName?: string | null;
}

export function normalizeStopAddress(address: string): string {
  return address.trim().replace(/\s+/g, ' ');
}

export function isValidStopAddress(address: string): boolean {
  const normalized = normalizeStopAddress(address);
  return normalized.length >= 5 && normalized.length <= 350;
}

export function normalizeRouteStops(
  stops: Omit<RouteStop, 'position'>[],
): RouteStop[] {
  return stops.map((stop, index) => ({
    ...stop,
    address: normalizeStopAddress(stop.address),
    position: index + 1,
  }));
}
