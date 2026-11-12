import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TutorJourneyNotice, TutorJourneysApi } from '../../../../shared/infrastructure/tutor-journeys-api';

@Component({
  selector: 'app-tutor-journey-notifications',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="journey-notifications">
      <header class="heading">
        <div>
          <p class="eyebrow">RUMBO · COMUNICACIÓN ESCOLAR</p>
          <h1>Notificaciones de mis estudiantes</h1>
          <p>Publicación de rutas, inicio de recorridos, paradas, llegadas, retrasos e incidencias.</p>
        </div>
        <button type="button" (click)="reload()" [disabled]="loading()">Actualizar avisos</button>
      </header>
      @if (error()) { <p role="alert" class="error">{{ error() }}</p> }
      @if (loading()) { <p role="status">Consultando avisos...</p> }
      @if (!loading() && !notifications().length && !error()) {
        <section class="empty">
          <h2>Sin notificaciones por ahora</h2>
          <p>Cuando el conductor publique una ruta o informe el avance del recorrido, aparecerán aquí los avisos vinculados a tus estudiantes.</p>
          <a routerLink="/tutor/current-trip">Consultar rutas escolares</a>
        </section>
      }
      @for (notification of notifications(); track notification.id) {
        <article class="notice" [class.unread]="!notification.read">
          <div>
            <span class="kind">{{ typeLabel(notification.kind) }}</span>
            <h2>{{ notification.title }}</h2>
            <p>{{ notification.message }}</p>
            <small>{{ notification.createdAt.slice(0,16).replace('T',' ') }}</small>
          </div>
          @if (!notification.read) {
            <button type="button" [disabled]="saving()" (click)="markRead(notification.id)">
              Marcar como leída
            </button>
          }
        </article>
      }
      <a routerLink="/tutor/current-trip">Ver la ruta de mis estudiantes</a>
    </main>
  `,
  styles: [`
    .journey-notifications{max-width:1020px;margin:auto;padding:32px 24px;color:#183f35;display:grid;gap:16px;}
    .heading{display:flex;justify-content:space-between;align-items:start;gap:20px;flex-wrap:wrap;}
    .eyebrow,.kind{color:#18866d;font-weight:750;font-size:12px;}
    h1{font-size:28px;} h2{font-size:18px;margin:7px 0;}p{font-size:13px;color:#536d63;line-height:1.5;}
    .empty,.notice{padding:20px;background:#fff;border:1px solid #deeae3;border-radius:14px;}
    .notice{display:flex;justify-content:space-between;gap:20px;align-items:center;flex-wrap:wrap;}
    .unread{border-left:4px solid #188b70;}small{color:#6f8379;}
    button{border:1px solid #228369;border-radius:9px;background:#fff;color:#145f4d;
      padding:9px 14px;cursor:pointer;}button:disabled{opacity:.5;}a{color:#0e7a5d;font-weight:700;}
    .error{color:#aa302d;}
  `],
})
export class TutorJourneyNotifications implements OnInit {
  private readonly api = inject(TutorJourneysApi);
  readonly notifications = signal<TutorJourneyNotice[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  ngOnInit(): void { void this.reload(); }

  typeLabel(kind: string): string {
    const labels: Record<string,string> = {
      ROUTE_PUBLISHED:'Nueva ruta', TRIP_PLANNED:'Viaje programado',
      TRIP_STARTED:'Inicio de ruta', STOP_SERVED:'Parada atendida',
      STUDENT_ARRIVED:'Llegada', TRIP_COMPLETED:'Fin de viaje',
      TRIP_CANCELLED:'Cancelación', ABSENT:'Ausencia',
      DELAY:'Retraso', INCIDENT:'Incidencia',
    };
    return labels[kind] || 'Aviso';
  }
  async reload(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    try { this.notifications.set(await firstValueFrom(this.api.notifications())); }
    catch (e) {
      const response=e as {status?:number;error?:{detail?:string}};
      this.error.set(response.status===0?'No hay conexión con Spring Boot.':
        response.error?.detail || 'No se pudieron consultar los avisos del estudiante.');
    }
    finally { this.loading.set(false); }
  }
  async markRead(id:number): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    try {
      const value=await firstValueFrom(this.api.markAsRead(id));
      this.notifications.update(rows => rows.map(n => n.id===id ? value : n));
    } catch {
      this.error.set('No se pudo marcar el aviso como leído.');
    } finally { this.saving.set(false); }
  }
}
