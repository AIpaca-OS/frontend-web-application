import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { NotificationsApiEndpoint } from './notifications-api-endpoint';
import { Notification } from '../domain/model/notification.entity';
import { ApiError } from '../../shared/infrastructure/api-error';

describe('NotificationsApiEndpoint', () => {
  const url = `${environment.platformProviderApiBaseUrl}${environment.platformProviderNotificationsEndpointPath}`;
  let endpoint: NotificationsApiEndpoint;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    endpoint = new NotificationsApiEndpoint(TestBed.inject(HttpClient));
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('posts the CreateNotificationRequest body expected by Spring Boot', () => {
    let title = '';
    endpoint.create(new Notification({
      id: 0, type: 'warning', priority: 'regular', title: 'Delay reported', message: 'Heavy traffic',
      createdAt: '', readAt: '', read: false, routeId: 10, studentId: null,
    })).subscribe(created => title = created.title);

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      type: 'WARNING', priority: 'REGULAR', title: 'Delay reported', message: 'Heavy traffic',
      routeId: 10, studentId: null, recipientProfileId: null,
    });
    request.flush({ id: 12, type: 'WARNING', priority: 'REGULAR', title: 'Delay reported', message: 'Heavy traffic',
      createdAt: '2026-11-13T08:00:00Z', readAt: null, read: false, routeId: 10, studentId: null });
    expect(title).toBe('Delay reported');
  });

  it('marks a notification as read with PATCH /{id}/read', () => {
    endpoint.markAsRead(5).subscribe();
    const request = http.expectOne(`${url}/5/read`);
    expect(request.request.method).toBe('PATCH');
    request.flush({ id: 5, type: 'INFO', priority: 'REGULAR', title: 't', message: 'm', createdAt: '', readAt: 'x', read: true });
  });

  it('preserves the HTTP status when the request fails', () => {
    let failure: unknown;
    endpoint.getByRecipient(3).subscribe({ error: error => failure = error });
    http.expectOne(`${url}?recipientProfileId=3`).flush({ detail: 'Validación fallida' }, { status: 400, statusText: 'Bad Request' });
    expect(failure instanceof ApiError).toBe(true);
    expect((failure as ApiError).status).toBe(400);
    expect((failure as ApiError).detail).toBe('Validación fallida');
  });
});
