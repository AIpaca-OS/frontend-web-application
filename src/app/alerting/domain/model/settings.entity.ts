export class Settings {

  #nonCriticalEnabled: boolean;
  #criticalEnabled: boolean;

  constructor(setting: { nonCriticalEnabled: boolean, criticalEnabled: boolean})
  {
    this.#nonCriticalEnabled = setting.nonCriticalEnabled;
    this.#criticalEnabled = setting.criticalEnabled;
  }

  get nonCriticalEnabled(): boolean {
    return this.#nonCriticalEnabled;
  }

  get criticalEnabled(): boolean {
    return this.#criticalEnabled;
  }

  set nonCriticalEnabled(value: boolean) {
    this.#nonCriticalEnabled = value;
  }

  set criticalEnabled(value: boolean) {
    this.#criticalEnabled = value;
  }

}
