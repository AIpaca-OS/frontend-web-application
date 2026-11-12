import { Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RouteTripStore } from '../../../../route-trip-planning/application/route-trip.store';
import { AlertingStore } from '../../../application/alerting-store';
import { DemoNoticeKind, IncidentCategory, DriverDemoNoticesApi } from '../../../infrastructure/driver-demo-notices-api';

@Component({
  selector: 'app-driver-demo-notices',
  standalone: true,
  template: `
    <section class="demo-composer">
      <h4>Informar retraso o incidencia</h4>
      <p class="hint">
        Describe la situación de la ruta. Los tutores de los estudiantes asignados
        recibirán el aviso. Evita incluir datos personales en el mensaje.
      </p>

      @if (publishedRoutes().length === 0) {
        <p role="status">Primero necesitas una ruta publicada y autorizada para emitir avisos de esa ruta.</p>
      } @else {
        <div class="fields">
          <label>
            Ruta publicada
            <select [value]="routeId()" (change)="selectRoute($event)">
              <option value="">Selecciona una ruta</option>
              @for (route of publishedRoutes(); track route.id) {
                <option [value]="route.id">{{ route.code }} — {{ route.name }}</option>
              }
            </select>
          </label>
          <label>
            Tipo de aviso
            <select [value]="kind()" (change)="selectKind($event)">
              <option value="DELAY">Retraso</option>
              <option value="INCIDENT">Incidencia</option>
            </select>
          </label>
          @if (kind() === 'DELAY') {
            <label>Retraso estimado en minutos
              <input type="number" min="1" max="600" [value]="minutes()" (input)="setMinutes($event)" />
            </label>
          } @else {
            <label>Tipo de incidencia
              <select [value]="category()" (change)="selectCategory($event)">
                <option value="OTHER">Otra incidencia</option>
                <option value="MECHANICAL_FAILURE">Falla mecánica</option>
                <option value="TRAFFIC_ACCIDENT">Accidente de tráfico</option>
                <option value="ROAD_BLOCKED">Vía bloqueada</option>
                <option value="STUDENT_HEALTH">Salud del estudiante</option>
              </select>
            </label>
          }
          <label class="message">
            Descripción breve, sin datos personales
            <textarea rows="3" maxlength="240" [value]="message()" (input)="setMessage($event)"
              placeholder="Ej.: Demora de diez minutos por tráfico"></textarea>
          </label>
        </div>
        <button type="button" (click)="send()" [disabled]="sending() || !routeId() || message().trim().length < 4">
          {{ sending() ? 'Enviando...' : 'Enviar aviso' }}
        </button>
      }

      @if (error()) {
        <p role="alert" class="error">{{ error() }}</p>
      }
      @if (success()) {
        <p role="status" class="success">{{ success() }}</p>
      }
    </section>
  `,
  styles: [`
    .demo-composer { margin: 0 0 18px; padding: 18px 22px; background: #fff;
      border: 1px solid #dce9e3; border-radius: 12px; }
    h4 { margin: 0 0 8px; color: #123f37; }
    .hint { color: #627b73; font-size: 12px; margin-bottom: 13px; }
    .fields { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 12px; }
    label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; font-size: 12px; }
    label.message { grid-column: 1 / -1; }
    select,input,textarea { box-sizing: border-box; width: 100%; background: #fff; border: 1px solid #c8ded5;
      border-radius: 8px; padding: 10px; font: inherit; }
    button { border: 0; background: #249a80; color: #fff; padding: 11px 14px;
      font-weight: 600; border-radius: 8px; margin-top: 12px; cursor: pointer; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    .error { color: #9e3030; } .success { color: #197552; }
  `],
})
export class DriverDemoNotices {
  private readonly routesStore = inject(RouteTripStore);
  private readonly alerts = inject(DriverDemoNoticesApi);
  private readonly notificationStore = inject(AlertingStore);
  readonly publishedRoutes = computed(() =>
    this.routesStore.routes().filter(route => route.status.toUpperCase() === 'PUBLISHED'));
  readonly routeId = signal('');
  readonly kind = signal<DemoNoticeKind>('DELAY');
  readonly minutes = signal(10);
  readonly category = signal<IncidentCategory>('OTHER');
  readonly message = signal('');
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  selectRoute(event: Event): void { this.routeId.set((event.target as HTMLSelectElement).value); }
  selectKind(event: Event): void { this.kind.set((event.target as HTMLSelectElement).value as DemoNoticeKind); }
  setMessage(event: Event): void { this.message.set((event.target as HTMLTextAreaElement).value); }
  setMinutes(event: Event): void { this.minutes.set(Number((event.target as HTMLInputElement).value)); }
  selectCategory(event: Event): void { this.category.set((event.target as HTMLSelectElement).value as IncidentCategory); }

  async send(): Promise<void> {
    if (!this.routeId() || this.message().trim().length < 4 || this.sending() ||
        (this.kind() === 'DELAY' && (!Number.isInteger(this.minutes()) || this.minutes() < 1 || this.minutes() > 600))) return;
    this.sending.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await firstValueFrom(this.alerts.send(this.routeId(), this.kind(), this.message().trim(), this.minutes(), this.category()));
      this.success.set('Aviso registrado. Estará disponible en Notificaciones al actualizar.');
      this.message.set('');
      this.notificationStore.refreshNotifications();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo registrar el reporte.');
    } finally {
      this.sending.set(false);
    }
  }
}
