import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Settings } from '../domain/model/settings.entity';
import { SettingsResource, SettingsResponse } from './settings-response';

export class SettingsAssembler {

  toEntitiesFromResponse(response: SettingsResponse): Settings {
    return this.toEntityFromResource(response.notificationSettings);
  }

  toEntityFromResource(resource: SettingsResource): Settings {
    return new Settings({
      nonCriticalEnabled: resource.nonCriticalEnabled,
      criticalEnabled: resource.criticalEnabled,
    });
  }

  toResourceFromEntity(entity: Settings): SettingsResource {
    return {
      nonCriticalEnabled: entity.nonCriticalEnabled,
      criticalEnabled: entity.criticalEnabled,
    }
  }
}
