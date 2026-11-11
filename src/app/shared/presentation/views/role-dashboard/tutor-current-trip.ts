import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TutorJourney, TutorJourneysApi } from '../../../infrastructure/tutor-journeys-api';

@Component({
  selector: 'app-tutor-current-trip',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="trip">
      <header class="heading">
        <div>
          <p class="eyebrow">RUMBO · SEGUIMIENTO ESCOLAR</p>
          <h1>Rutas de mis estudiantes</h1>
          <p>Consulta la ruta publicada y los estados registrados por el conductor.</p>
        </div>
        <button type="button" (click)="reload()" [disabled]="loading()">Actualizar estado</button>
      </header>
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      @if (loading()) {
        <p role="status">Consultando rutas y viajes...</p>
      } @else if (!journeys().length && !error()) {
        <section class="card">
          <h2>Sin rutas asignadas todavía</h2>
          <p>Registra a tu estudiante y solicita el transporte. Cuando el conductor publique
            una ruta con su parada asignada, aparecerá aquí.</p>
          <a routerLink="/tutor/students">Gestionar estudiantes</a>
        </section>
      }
      @for (journey of journeys(); track journey.studentId + ':' + journey.routeId) {
        <article class="card">
          <div class="card-top">
            <div>
              <span class="student">{{ journey.studentName }}</span>
              <h2>{{ journey.routeName }}</h2>
              <p>{{ journey.routeCode }} · {{ journey.shift === 'MORNING' ? 'Mañana' : 'Tarde' }}
                @if (journey.departureTime) { · {{ journey.departureTime }} }
              </p>
            </div>
            <span class="state" [class.arrived]="journey.studentStatus === 'ARRIVED'">
              {{ statusName(journey.studentStatus) }}
            </span>
          </div>
          <p><strong>Parada asignada:</strong> {{ journey.assignedStopAddress }}</p>
          @if (journey.serviceDate) {
            <p><strong>Viaje registrado:</strong> {{ journey.serviceDate }}
              · {{ journey.tripStatus === 'IN_PROGRESS' ? 'En recorrido' :
                    journey.tripStatus === 'COMPLETED' ? 'Finalizado' :
                    journey.tripStatus === 'CANCELLED' ? 'Cancelado' : 'Programado' }}
            </p>
          } @else {
            <p>La ruta ya está publicada. Aún no se ha programado un viaje.</p>
          }
          <h3>Recorrido</h3>
          <ol>
            @for (stop of journey.stops; track stop.position) {
              <li [class.my-stop]="stop.assignedToStudent">
                <span>{{ stop.address }}</span>
                @if (stop.assignedToStudent) { <strong>Parada del estudiante</strong> }
              </li>
            }
          </ol>
          @if (journey.studentStatus === 'ARRIVED') {
            <p class="confirmation" role="status">El conductor confirmó la llegada del estudiante.</p>
          } @else if (journey.studentStatus === 'STOP_SERVED') {
            <p class="confirmation">La parada fue atendida. Todavía no se ha confirmado la llegada.</p>
          }
        </article>
      }
      <a routerLink="/tutor/notifications">Ver notificaciones del recorrido</a>
    </main>
  `,
  styles: [`
    .trip { max-width:1050px; margin:auto; padding:30px 24px; color:#143f34; display:grid; gap:18px; }
    .heading,.card-top { display:flex; justify-content:space-between; align-items:start; gap:20px; flex-wrap:wrap; }
    .eyebrow { font-size:12px; color:#19876c; font-weight:700; letter-spacing:.08em; }
    h1 {font-size:28px;margin:8px 0;} h2{font-size:20px;margin:3px 0;}h3{font-size:15px;}
    p {font-size:13px; color:#556e64; line-height:1.6;}
    .card { border:1px solid #d8e7df; background:#fff; padding:22px; border-radius:14px; }
    .student {color:#12856b;font-size:13px;font-weight:750;}
    .state {background:#f1f4f0;color:#345449;padding:8px 12px;border-radius:100px;font-size:12px;font-weight:700;}
    .state.arrived,.confirmation {background:#e8f6ee;color:#12614d;padding:9px 12px;border-radius:10px;}
    ol {padding-left:26px;} li{padding:9px 6px;border-bottom:1px solid #edf0ec;font-size:13px;}
    li.my-stop {background:#e8f6ee;} li strong{margin-left:12px;color:#176f59;font-size:11px;}
    button {border:1px solid #19856a;border-radius:10px;background:#fff;color:#146d54;padding:10px 14px;cursor:pointer;}
    button:disabled{opacity:.5;}a{color:#137e65;font-weight:700;}
    .error{color:#ab302e;}
  `],
})
export class TutorCurrentTrip implements OnInit {
  private readonly api = inject(TutorJourneysApi);
  readonly journeys = signal<TutorJourney[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void { void this.reload(); }

  statusName(status: string): string {
    const names: Record<string,string> = {
      ROUTE_PUBLISHED: 'Ruta publicada',
      NOT_PLANNED: 'Ruta publicada',
      SCHEDULED: 'Viaje programado',
      IN_PROGRESS: 'En recorrido',
      STOP_SERVED: 'Parada atendida',
      ARRIVED: 'Llegada confirmada',
      ABSENT: 'Ausente',
      CANCELLED: 'Viaje cancelado',
      TRIP_COMPLETED: 'Viaje finalizado',
      NOT_ASSIGNED_ON_TRIP: 'Sin asignación en este viaje',
    };
    return names[status] || status;
  }

  async reload(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      this.journeys.set(await firstValueFrom(this.api.journeys()));
    } catch (e) {
      const response = e as {status?:number;error?:{detail?:string}};
      this.error.set(response.status === 0
        ? 'No se puede conectar al backend. Comprueba que Spring Boot esté ejecutándose.'
        : response.status === 401 || response.status === 403 || response.status === 503
          ? 'No se pudo acceder a las rutas del estudiante con la sesión actual.'
          : response.error?.detail || (e instanceof Error ? e.message : 'No se pudieron consultar las rutas.'));
    } finally {
      this.loading.set(false);
    }
  }
}
