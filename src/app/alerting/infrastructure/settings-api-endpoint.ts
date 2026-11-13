import { Observable, of } from 'rxjs';
import { Settings } from '../domain/model/settings.entity';

/**
 * Notification preferences kept in memory for the current browser session.
 *
 * @remarks
 * The published Rumbo API has no notification-settings resource, so no HTTP request is made.
 * Replace this class with a BaseApiEndpoint subclass once the backend exposes the resource.
 */
export class SettingsApiEndpoint {
  private cached: Settings | null = null;

  /**
   * Returns the current preferences (all notices enabled by default).
   * @returns Stream with the settings.
   */
  get(): Observable<Settings> {
    if (!this.cached) {
      this.cached = new Settings({
        criticalEnabled: true, importantEnabled: true, regularEnabled: true,
        successEnabled: true, warningEnabled: true, infoEnabled: true,
      });
    }
    return of(this.cached);
  }

  /**
   * Stores the preferences for the current session.
   * @param settings - Settings to keep.
   * @returns Stream with the stored settings.
   */
  update(settings: Settings): Observable<Settings> {
    this.cached = settings;
    return of(settings);
  }
}
