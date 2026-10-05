export interface SettingsResource {

  nonCriticalEnabled: boolean;
  criticalEnabled: boolean;
}

export interface SettingsResponse {

  notificationSettings: SettingsResource;
}

