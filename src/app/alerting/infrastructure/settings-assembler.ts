import { Settings } from '../domain/model/settings.entity';
import { SettingsResource } from './settings-response';

export class SettingsAssembler {
  toEntityFromResource(resource: SettingsResource): Settings {
    return new Settings({
      criticalEnabled: resource.criticalEnabled,
      importantEnabled: resource.importantEnabled,
      regularEnabled: resource.regularEnabled,
      successEnabled: resource.successEnabled,
      warningEnabled: resource.warningEnabled,
      infoEnabled: resource.infoEnabled,
    });
  }

  toResourceFromEntity(entity: Settings): SettingsResource {
    return {
      criticalEnabled: entity.criticalEnabled,
      importantEnabled: entity.importantEnabled,
      regularEnabled: entity.regularEnabled,
      successEnabled: entity.successEnabled,
      warningEnabled: entity.warningEnabled,
      infoEnabled: entity.infoEnabled,
    };
  }
}
