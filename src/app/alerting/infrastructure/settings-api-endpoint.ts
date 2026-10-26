import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Settings } from '../domain/model/settings.entity';
import { SettingsAssembler } from './settings-assembler';
import { SettingsResource } from './settings-response';

export class SettingsApiEndpoint {
  private readonly endpointUrl =
    `${environment.platformProviderApiBaseUrl}${environment.platformProviderNotificationSettingsEndpointPath}`;
  private readonly assembler = new SettingsAssembler();

  constructor(private readonly http: HttpClient) {}

  get(): Observable<Settings> {
    return this.http
      .get<SettingsResource>(this.endpointUrl)
      .pipe(map((resource) => this.assembler.toEntityFromResource(resource)));
  }

  update(settings: Settings): Observable<Settings> {
    const resource = this.assembler.toResourceFromEntity(settings);
    return this.http
      .put<SettingsResource>(this.endpointUrl, resource)
      .pipe(map((updated) => this.assembler.toEntityFromResource(updated)));
  }
}
