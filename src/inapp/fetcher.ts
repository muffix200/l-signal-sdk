import { getClient } from '../client';
import { getDeviceId } from '../storage';
import type { InAppMessage } from './types';

export async function fetchInAppMessages(
  triggerType?: string,
  triggerEvent?: string,
): Promise<InAppMessage[]> {
  const deviceId = getDeviceId();
  if (!deviceId) {
    return [];
  }

  const { data } = await getClient().get<{ data: InAppMessage[] }>(
    '/in-app-messages',
    { params: { device_id: deviceId } },
  );

  const messages = data.data ?? [];

  if (!triggerType) {
    return messages;
  }

  return messages.filter(msg => {
    if (msg.trigger_type !== triggerType) {
      return false;
    }
    if (triggerType === 'on_event' && triggerEvent) {
      return msg.trigger_event === triggerEvent;
    }
    return true;
  });
}
