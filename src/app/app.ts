import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationDashboard} from './alerting/presentation/views/notification-dashboard/notification-dashboard';
import { QuickActions } from './incident/presentation/components/quick-actions/quick-actions';
import { DelayForm } from './incident/presentation/views/delay-form/delay-form';
import { IncidentForm } from './incident/presentation/views/incident-form/incident-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationDashboard, QuickActions, DelayForm, IncidentForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Rumbo-frontend');
}
