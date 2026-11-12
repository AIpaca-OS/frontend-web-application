import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DemoRoleSession } from '../../identity-and-access-management/application/demo-role-session.service';
import { DriverDemoNoticesApi } from './driver-demo-notices-api';

describe('DriverDemoNoticesApi', () => {
  let api: DriverDemoNoticesApi;
  let http: HttpTestingController;
  let session: DemoRoleSession;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(DriverDemoNoticesApi);
    http = TestBed.inject(HttpTestingController);
    session = TestBed.inject(DemoRoleSession);
    session.enter('driver', 2);
  });
  afterEach(() => { http.verify(); session.leave(); });

  it('persists a delay before notifying the students of the active trip', () => {
    let title = '';
    api.send('8', 'DELAY', 'Tráfico intenso', 12).subscribe(r => title = r.title);

    const route = http.expectOne('/api/v1/routes/8');
    expect(route.request.method).toBe('GET');
    route.flush({id:8,driverProfileId:2,status:'PUBLISHED',stops:[],schedule:[]});
    const trips = http.expectOne('/api/v1/trips?routeId=8');
    trips.flush([{id:3, routeId:8, status:'IN_PROGRESS', serviceDate:'2026-11-16',
      students:[{studentId:4,stopId:10,stopPosition:1,stopAddress:'Demo',absent:false,
        stopServed:false,arrived:false}]}]);

    const delay = http.expectOne('/api/v1/delays');
    expect(delay.request.method).toBe('POST');
    expect(delay.request.body).toEqual({
      tripId:3,reportedByProfileId:2,cause:'Tráfico intenso',estimatedMinutes:12,
    });
    delay.flush({id:14});

    const notice = http.expectOne('/api/v1/notifications');
    expect(notice.request.body.studentId).toBe(4);
    notice.flush({id:15});
    expect(title).toBe('Retraso informado');
  });
});
