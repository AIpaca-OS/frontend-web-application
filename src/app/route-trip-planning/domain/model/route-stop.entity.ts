/**
 * Parada ordenada de una ruta.
 * RMW-20: cada parada podrá vincular a un estudiante autorizado al integrar la API.
 * La ausencia de estudiante se permite mientras la ruta siga configurable.
 */
export interface RouteStop {
  id: string;
  address: string;
  position: number;
  studentId?: string | null;
  studentName?: string | null;
}
