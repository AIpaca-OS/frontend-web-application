import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TripsApi, RouteForTrip, TripRecord, TripPassenger } from '../../../infrastructure/trips-api';
import { ServiceEnrollmentsApi } from '../../../../profiles-relationship-management/infrastructure/service-enrollments-api';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-driver-trips',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="trip-management">
      <a routerLink="/driver/routes">Volver a mis rutas</a>
      <h1>Gestionar viajes y llegadas</h1>
      @if (route()) {
        <p><strong>{{ route()?.name }}</strong> · {{ route()?.code }}</p>
        <p>Días: {{ scheduleText() }}</p>
      }
      <section class="panel">
        <h2>Programar viaje</h2>
        <p>Selecciona un día que esté incluido en el horario de esta ruta publicada.</p>
        <div class="inline">
          <label for="tripDate">Fecha</label>
          <input id="tripDate" name="tripDate" type="date" [(ngModel)]="serviceDate" />
          <button type="button" [disabled]="saving() || !serviceDate" (click)="plan()">
            Programar viaje
          </button>
        </div>
      </section>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (message()) { <p class="success" role="status">{{ message() }}</p> }
      <button type="button" (click)="reload()" [disabled]="loading() || saving()">Actualizar viajes</button>
      @if (loading()) { <p role="status">Cargando...</p> }
      @for (trip of trips(); track trip.id) {
        <article class="panel">
          <div class="header">
            <h2>Viaje del {{ trip.serviceDate }}</h2>
            <span class="pill">{{ statusName(trip.status) }}</span>
          </div>
          @if (trip.status === 'SCHEDULED') {
            <button type="button" [disabled]="saving()" (click)="action(trip, 'start')">
              Iniciar recorrido
            </button>
          }
          @for (passenger of trip.students; track passenger.studentId) {
            <div class="student">
              <div>
                <strong>{{ studentName(passenger.studentId) }}</strong>
                <p>Parada {{ passenger.stopPosition }} · {{ passenger.stopAddress }}</p>
                <p>Estado: {{ passenger.arrived ? 'Llegada confirmada' :
                  passenger.absent ? 'Ausente' :
                  passenger.stopServed ? 'Parada atendida; llegada pendiente' : 'Parada pendiente' }}</p>
              </div>
              @if (trip.status === 'IN_PROGRESS') {
                <div class="buttons">
                  @if (!passenger.stopServed && !passenger.absent) {
                    <button type="button" [disabled]="saving()" (click)="markAbsence(trip,passenger)">Registrar ausencia</button>
                    <button type="button" [disabled]="saving()" (click)="serve(trip,passenger)">
                      Marcar parada atendida
                    </button>
                  }
                  @if (passenger.stopServed && !passenger.arrived && !passenger.absent) {
                    <button type="button" class="primary" [disabled]="saving()"
                      (click)="confirmArrival(trip,passenger)">
                      Confirmar llegada
                    </button>
                  }
                </div>
              }
            </div>
          }
          @if (trip.status === 'IN_PROGRESS') {
            <button type="button" [disabled]="saving()" (click)="action(trip,'complete')">
              Finalizar viaje
            </button>
          }
          @if (trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED') {
            <button type="button" [disabled]="saving()" (click)="cancelTrip(trip)">Cancelar viaje</button>
          }
        </article>
      } @empty {
        @if (!loading()) { <p>Todavía no hay viajes programados para esta ruta.</p> }
      }
    </main>
  `,
  styles: [`
    .trip-management{max-width:1000px;margin:auto;padding:30px 24px;color:#19493a;display:grid;gap:16px;}
    h1{font-size:29px;}h2{font-size:19px;margin:4px 0 12px;}p{font-size:13px;color:#587268;}
    .panel{background:#fff;border:1px solid #dae7df;border-radius:14px;padding:22px;}
    .inline,.buttons,.header{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
    .header{justify-content:space-between;}
    input{padding:9px;border:1px solid #b4cfc2;border-radius:9px;}
    button{border:1px solid #228a6e;border-radius:9px;padding:9px 12px;background:#fff;color:#175d49;cursor:pointer;}
    button.primary{background:#229777;color:white;}button:disabled{opacity:.5;}
    a{color:#0e8266;font-size:13px;}
    .student{padding:14px 0;border-top:1px solid #e6eeea;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;}
    .pill{background:#e9f5ee;color:#126049;border-radius:20px;padding:7px 11px;font-size:12px;}
    .error{color:#a52d2a;}.success{color:#0d775b;}
  `],
})
export class DriverTrips implements OnInit {
  private readonly api = inject(TripsApi);
  private readonly enrollments = inject(ServiceEnrollmentsApi);
  private readonly activated = inject(ActivatedRoute);

  readonly route = signal<RouteForTrip | null>(null);
  readonly trips = signal<TripRecord[]>([]);
  readonly studentNames = signal<Record<number,string>>({});
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  serviceDate = new Date().toLocaleDateString('en-CA');
  private routeId = 0;

  ngOnInit(): void {
    this.routeId = Number(this.activated.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(this.routeId) || this.routeId < 1) {
      this.error.set('El ID de la ruta no es válido.');
      return;
    }
    void this.reload();
  }

  scheduleText(): string {
    return this.route()?.schedule?.map(s => s.dayOfWeek + ' ' + s.departureTime).join(', ') || 'Sin horario';
  }
  statusName(s: string): string {
    return ({ SCHEDULED:'Programado', IN_PROGRESS:'En recorrido',
              COMPLETED:'Finalizado', CANCELLED:'Cancelado' } as Record<string,string>)[s] || s;
  }
  studentName(id: number): string { return this.studentNames()[id] || 'Estudiante #' + id; }

  private errorText(e: unknown): string {
    const x = e as { status?: number; error?: {detail?:string;message?:string} };
    if (x.status === 0) return 'No se puede conectar al backend.';
    return x.error?.detail || x.error?.message || (e instanceof Error ? e.message : 'No se pudo realizar la operación.');
  }

  async reload(): Promise<void> {
    if (this.loading() || !this.routeId) return;
    this.loading.set(true); this.error.set('');
    try {
      const [route, trips] = await Promise.all([
        firstValueFrom(this.api.route(this.routeId)),
        firstValueFrom(this.api.forRoute(this.routeId)),
      ]);
      this.route.set(route);
      this.trips.set(trips);
      try {
        const students = await firstValueFrom(this.enrollments.driverStudents());
        this.studentNames.set(Object.fromEntries(
          students.map(s => [s.id, s.firstName + ' ' + s.lastName])));
      } catch { /* Names are optional; trip state is still available. */ }
    } catch (e) { this.error.set(this.errorText(e)); }
    finally { this.loading.set(false); }
  }

  private async update(request: () => Observable<TripRecord>, done: string): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true); this.error.set(''); this.message.set('');
    try {
      await firstValueFrom(request());
      this.message.set(done);
      await this.reload();
    } catch (e) { this.error.set(this.errorText(e)); }
    finally { this.saving.set(false); }
  }

  async plan(): Promise<void> {
    const route = this.route();
    if (!route || !this.serviceDate) return;
    const selectedDay = new Date(this.serviceDate + 'T12:00:00').getDay();
    const day = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][selectedDay];
    if (!route.schedule.some(item => item.dayOfWeek === day)) {
      this.error.set('Selecciona una fecha incluida en el horario semanal de esta ruta.');
      return;
    }
    await this.update(() => this.api.plan(route, this.serviceDate), 'Viaje programado.');
  }

  async action(trip: TripRecord, kind: 'start'|'complete'): Promise<void> {
    await this.update(
      () => kind === 'start' ? this.api.start(trip.id) : this.api.complete(trip.id),
      kind === 'start' ? 'Recorrido iniciado.' : 'Viaje finalizado.', 
    );
  }

  async serve(trip: TripRecord, passenger: TripPassenger): Promise<void> {
    await this.update(() => this.api.serve(trip.id,passenger.stopId),
      'Parada atendida.');
  }

  async confirmArrival(trip: TripRecord, passenger: TripPassenger): Promise<void> {
    await this.update(() => this.api.arrived(trip.id,passenger.studentId),
      'Llegada confirmada.');
  }

  async markAbsence(trip: TripRecord, passenger: TripPassenger): Promise<void> {
    await this.update(() => this.api.absence(trip.id,passenger.studentId),
      'Ausencia registrada.');
  }

  async cancelTrip(trip: TripRecord): Promise<void> {
    const reason = window.prompt('Motivo de cancelación del viaje:')?.trim();
    if (!reason) return;
    await this.update(() => this.api.cancel(trip.id,reason),
      'Viaje cancelado.');
  }
}
