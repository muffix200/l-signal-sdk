import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'signal-sdk' });

const KEYS = {
  DEVICE_ID: 'signal.device_id',
} as const;

export function getDeviceId(): string | null {
  return storage.getString(KEYS.DEVICE_ID) ?? null;
}

export function setDeviceId(id: string): void {
  storage.set(KEYS.DEVICE_ID, id);
}

export function clearDeviceId(): void {
  storage.remove(KEYS.DEVICE_ID);
}
