import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { RoutesApi } from '../../../infrastructure/routes-api';

interface Stop { id: number; address: string; position: number; schoolId: number | null; studentIds: number[]; }
interface RouteData {
  id: number; name: string; code: string; status: string;
  driverProfileId: number; vehicleId: number | null; shift: string;
  schedule: Array<{ dayOfWeek: string; departureTime: string }>; stops: Stop[];
}
interface Passenger {
  studentId: number; stopId: number; stopPosition: number; stopAddress: string;
  absent: boolean; stopServed: boolean; arrived: boolean;
}
interface TripData {
  id: string; serviceDate: string; status: string; students: Passenger[];
}

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
  private readonly http = inject(HttpClient);
  private readonly activated = inject(ActivatedRoute);
  readonly route = signal<RouteData | null>(null);
  readonly trips = signal<TripData[]>([]);
  readonly studentNames = signal<Record<string,string>>({});
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');
  serviceDate = new Date().toLocaleDateString('en-CA');
  private routeId = '';
  private readonly routesApi = inject(RoutesApi);

  ngOnInit(): void {
    this.routeId = this.activated.snapshot.paramMap.get('id') || '';
    void this.reload();
  }
  scheduleText(): string {
    return this.route()?.schedule.map(s => s.dayOfWeek + ' ' + s.departureTime).join(', ') || 'Sin horario';
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
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    try {
      const base = '/api/v1/routes/' + this.routeId;
      const [route, trips] = await Promise.all([
        firstValueFrom(this.http.get<RouteData>(base)),
        firstValueFrom(this.http.get<TripData[]>('/api/v1/trips', { params: { routeId: this.routeId } })),
      ]);
      this.route.set(route); this.trips.set(trips);
      try {
        const students = await firstValueFrom(this.routesApi.getEligibleStudents());
        this.studentNames.set(Object.fromEntries(students.map(s => [s.id,s.fullName])));
      } catch { /* Route/trip details remain usable without the optional name catalog. */ }
    } catch (e) { this.error.set(this.errorText(e)); }
    finally { this.loading.set(false); }
  }
  private async update(request: Observable<unknown>, done: string): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true); this.error.set(''); this.message.set('');
    try { await firstValueFrom(request); this.message.set(done); await this.reload(); }
    catch (e) { this.error.set(this.errorText(e)); }
    finally { this.saving.set(false); }
  }
  async plan(): Promise<void> {
    const route = this.route();
    if (!route || !this.serviceDate) return;
    const selectedDate = new Date(this.serviceDate + 'T00:00:00');
    const weekday = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    if (route.status !== 'PUBLISHED' || !route.vehicleId ||
        !route.schedule.some(day => day.dayOfWeek === weekday)) {
      this.error.set('Selecciona un día del horario de una ruta publicada con vehículo.');
      return;
    }
    const passengers = route.stops.flatMap(stop => stop.studentIds.map(studentId => ({
      studentId, stopId: stop.id, stopPosition: stop.position,
      stopAddress: stop.address, schoolId: stop.schoolId,
    })));
    if (!passengers.length) {
      this.error.set('La ruta debe tener estudiantes asignados.');
      return;
    }
    await this.update(this.http.post('/api/v1/trips', {
      routeId: route.id, driverProfileId: route.driverProfileId, vehicleId: route.vehicleId,
      shift: route.shift, date: this.serviceDate, passengers,
    }), 'Viaje programado.');
  }
  async action(trip: TripData, kind: 'start'|'complete'): Promise<void> {
    await this.update(this.http.patch('/api/v1/trips/' + trip.id + '/' + kind, {}),
      kind === 'start' ? 'Recorrido iniciado.' : 'Viaje finalizado.');
  }
  async serve(trip: TripData, passenger: Passenger): Promise<void> {
    await this.update(this.http.patch(
      '/api/v1/trips/' + trip.id + '/stops/' + passenger.stopId + '/served', {}),
      'Parada atendida. Confirma la llegada cuando corresponda.');
  }
  async confirmArrival(trip: TripData, passenger: Passenger): Promise<void> {
    await this.update(this.http.patch(
      '/api/v1/trips/' + trip.id + '/passengers/' +
        encodeURIComponent(passenger.studentId) + '/arrived', {}),
      'Llegada confirmada.');
  }
}
