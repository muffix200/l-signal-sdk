import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { getClient } from './client';
import { getDeviceId, setDeviceId } from './storage';
import { collectDeviceMetadata } from './device';

async function getPushToken(): Promise<string> {
  if (Platform.OS === 'ios') {
    // APNs token — retry briefly because it may not be ready immediately
    for (let attempt = 0; attempt < 5; attempt++) {
      const token = await messaging().getAPNSToken();
      if (token) {
        return token;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('[Signal] Could not obtain APNs token after 5 attempts');
  }

  return messaging().getToken();
}

export async function registerForPush(): Promise<void> {
  const authStatus = await messaging().requestPermission();
  const granted =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!granted) {
    return;
  }

  const [pushToken, metadata] = await Promise.all([
    getPushToken(),
    collectDeviceMetadata(),
  ]);

  const client = getClient();
  const { data } = await client.post<{ data: { device_id: string } }>(
    '/devices',
    {
      platform: metadata.platform,
      push_token: pushToken,
      app_version: metadata.appVersion,
      os_version: metadata.osVersion,
      device_model: metadata.deviceModel,
      language: metadata.language,
      timezone: metadata.timezone,
    },
  );

  setDeviceId(data.data.device_id);

  // Keep token fresh — fires when FCM rotates the token
  messaging().onTokenRefresh(async newToken => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      return;
    }
    try {
      await getClient().put(`/devices/${deviceId}/token`, {
        push_token: newToken,
      });
    } catch {
      // Non-critical — next app launch will re-register
    }
  });
}
