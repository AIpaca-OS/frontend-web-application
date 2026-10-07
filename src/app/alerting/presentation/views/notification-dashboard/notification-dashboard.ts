import { Component, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionPanel} from '@angular/material/expansion';
import { AlertingStore } from '../../../application/alerting-store';
import { Notification } from '../../../domain/model/notification.entity';
import { MatAccordion } from '@angular/material/expansion';
import { MatExpansionModule} from '@angular/material/expansion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionPanel,
    MatAccordion,
    MatExpansionModule
  ],
  templateUrl: './notification-dashboard.html',
  styleUrl: './notification-dashboard.css',
})
export class NotificationDashboard {
  readonly alertingStore: AlertingStore = inject(AlertingStore);
  protected router: Router = inject(Router);

  protected readonly notifications: Signal<Notification[]> = this.alertingStore.notifications;

  markAsRead(notification: Notification){
    this.alertingStore.markNotificationAsRead(notification);
  }

  deleteNotification(id: number){
    this.alertingStore.deleteNotification(id);
  }


}
