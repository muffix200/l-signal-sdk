import { getClient } from '../client';
import { getDeviceId } from '../storage';
import type { InAppEventType } from './types';

export async function trackInAppEvent(
  messageId: string,
  eventType: InAppEventType,
  buttonId?: string,
): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) {
    return;
  }

  await getClient()
    .post(`/in-app-messages/${messageId}/events`, {
      device_id: deviceId,
      event_type: eventType,
      button_id: buttonId ?? '',
    })
    .catch(() => {
      // Non-critical — don't block the UI
    });
}
