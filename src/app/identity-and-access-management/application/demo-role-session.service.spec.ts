import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DemoRoleSession } from './demo-role-session.service';

describe('DemoRoleSession (frontend preview only)', () => {
  beforeEach(() => {
    sessionStorage.removeItem('rumbo.preview.role');
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
  });

  afterEach(() => {
    sessionStorage.removeItem('rumbo.preview.role');
    TestBed.resetTestingModule();
  });

  it('stores the selected role for the current browser tab', () => {
    const session = TestBed.inject(DemoRoleSession);

    session.enter('driver');

    expect(session.role()).toBe('driver');
    expect(sessionStorage.getItem('rumbo.preview.role')).toBe('driver');
  });

  it('clears the selected role when the user signs out', () => {
    const session = TestBed.inject(DemoRoleSession);
    session.enter('tutor');

    session.leave();

    expect(session.role()).toBeNull();
    expect(sessionStorage.getItem('rumbo.preview.role')).toBeNull();
  });

  it('keeps tutor and driver previews distinct', () => {
    const session = TestBed.inject(DemoRoleSession);
    session.enter('tutor');
    expect(session.role()).toBe('tutor');

    session.enter('driver');
    expect(session.role()).toBe('driver');
  });
});
