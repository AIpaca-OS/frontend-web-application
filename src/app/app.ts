import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationDashboard} from './alerting/presentation/views/notification-dashboard/notification-dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationDashboard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Rumbo-frontend');
}
