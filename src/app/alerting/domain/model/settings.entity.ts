export class Settings {
  #criticalEnabled: boolean;
  #importantEnabled: boolean;
  #regularEnabled: boolean;
  #successEnabled: boolean;
  #warningEnabled: boolean;
  #infoEnabled: boolean;

  constructor(setting: {
    criticalEnabled: boolean;
    importantEnabled: boolean;
    regularEnabled: boolean;
    successEnabled: boolean;
    warningEnabled: boolean;
    infoEnabled: boolean;
  }) {
    this.#criticalEnabled = setting.criticalEnabled;
    this.#importantEnabled = setting.importantEnabled;
    this.#regularEnabled = setting.regularEnabled;
    this.#successEnabled = setting.successEnabled;
    this.#warningEnabled = setting.warningEnabled;
    this.#infoEnabled = setting.infoEnabled;
  }

  get criticalEnabled(): boolean {
    return this.#criticalEnabled;
  }

  get importantEnabled(): boolean {
    return this.#importantEnabled;
  }

  get regularEnabled(): boolean {
    return this.#regularEnabled;
  }

  get successEnabled(): boolean {
    return this.#successEnabled;
  }

  get warningEnabled(): boolean {
    return this.#warningEnabled;
  }

  get infoEnabled(): boolean {
    return this.#infoEnabled;
  }

  get nonCriticalEnabled(): boolean {
    return (
      this.#importantEnabled &&
      this.#regularEnabled &&
      this.#successEnabled &&
      this.#warningEnabled &&
      this.#infoEnabled
    );
  }

  set nonCriticalEnabled(value: boolean) {
    this.#importantEnabled = value;
    this.#regularEnabled = value;
    this.#successEnabled = value;
    this.#warningEnabled = value;
    this.#infoEnabled = value;
  }
}
