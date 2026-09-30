import { getClient } from './client';
import { getDeviceId } from './storage';

export async function setTags(tags: Record<string, string>): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) {
    throw new Error(
      '[Signal] Device not registered. Call Signal.registerForPush() first.',
    );
  }
  await getClient().put(`/devices/${deviceId}/tags`, { tags });
}

export async function setSubscription(isSubscribed: boolean): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) {
    return;
  }
  await getClient().put(`/devices/${deviceId}/subscription`, { is_subscribed: isSubscribed });
}
