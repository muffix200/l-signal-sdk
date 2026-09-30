export interface SignalConfig {
  appKey: string;
  apiUrl: string;
}

let _config: SignalConfig | null = null;

export function setConfig(config: SignalConfig): void {
  _config = config;
}

export function getConfig(): SignalConfig {
  if (!_config) {
    throw new Error(
      '[Signal] Not initialized. Call Signal.initialize() before using the SDK.',
    );
  }
  return _config;
}

export function isInitialized(): boolean {
  return _config !== null;
}
