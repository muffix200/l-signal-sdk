import { getClient } from './client';
import { getDeviceId } from './storage';

function requireDeviceId(): string {
  const id = getDeviceId();
  if (!id) {
    throw new Error(
      '[Signal] Device not registered. Call Signal.registerForPush() first.',
    );
  }
  return id;
}

export async function login(externalId: string): Promise<void> {
  const deviceId = requireDeviceId();
  await getClient().post(`/devices/${deviceId}/login`, {
    external_id: externalId,
  });
}

export async function logout(): Promise<void> {
  const deviceId = requireDeviceId();
  await getClient().post(`/devices/${deviceId}/logout`);
}
