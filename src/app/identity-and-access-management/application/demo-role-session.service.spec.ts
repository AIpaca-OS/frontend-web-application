import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DemoRoleSession } from './demo-role-session.service';

describe('IAM session', () => {
  let session: DemoRoleSession;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.removeItem('rumbo.auth.token');
    sessionStorage.removeItem('rumbo.auth.role');
    sessionStorage.removeItem('rumbo.preview.role');
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    session = TestBed.inject(DemoRoleSession);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it('does not grant a role without a server token', () => {
    expect(session.role()).toBeNull();
    expect(session.token()).toBeNull();
  });

  it('accepts a driver role only after a successful sign-in response', async () => {
    const signingIn = session.signIn('driver@example.com', 'password123');
    const request = http.expectOne('/api/v1/authentication/sign-in');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'driver@example.com', password: 'password123' });
    request.flush({
      token: 'jwt-from-server',
      tokenType: 'Bearer',
      expiresIn: 3600,
      account: { id: 12, email: 'driver@example.com', role: 'DRIVER', verified: true },
    });
    expect(await signingIn).toBe('driver');
    expect(session.role()).toBe('driver');
    expect(sessionStorage.getItem('rumbo.auth.token')).toBe('jwt-from-server');
  });

  it('clears the token and role when the user signs out', async () => {
    const signingIn = session.signIn('tutor@example.com', 'password123');
    http.expectOne('/api/v1/authentication/sign-in').flush({
      token: 'jwt-from-server',
      tokenType: 'Bearer',
      expiresIn: 3600,
      account: { id: 13, email: 'tutor@example.com', role: 'TUTOR', verified: true },
    });
    await signingIn;
    session.leave();
    expect(session.role()).toBeNull();
    expect(session.token()).toBeNull();
    expect(sessionStorage.getItem('rumbo.auth.token')).toBeNull();
  });
});
