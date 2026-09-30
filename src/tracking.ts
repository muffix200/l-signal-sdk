import messaging from '@react-native-firebase/messaging';
import { getClient } from './client';
import { getDeviceId } from './storage';

export function setupNotificationOpenTracking(): void {
  // App opened from a notification (background/quit state)
  messaging().onNotificationOpenedApp(remoteMessage => {
    trackOpen(remoteMessage.data);
  });

  // App launched fresh by tapping a notification (quit state)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        trackOpen(remoteMessage.data);
      }
    });
}

function trackOpen(
  data: Record<string, string | object> | undefined,
): void {
  const notificationId =
    typeof data?.notification_id === 'string' ? data.notification_id : null;
  const deviceId = getDeviceId();

  if (!notificationId || !deviceId) {
    return;
  }

  getClient()
    .post(`/notifications/${notificationId}/opened`, { device_id: deviceId })
    .catch(() => {
      // Fire-and-forget — don't block navigation
    });
}
