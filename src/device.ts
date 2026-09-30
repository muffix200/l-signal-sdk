import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export interface DeviceMetadata {
  platform: 'android' | 'ios';
  appVersion: string;
  osVersion: string;
  deviceModel: string;
  language: string;
  timezone: string;
}

export async function collectDeviceMetadata(): Promise<DeviceMetadata> {
  const [appVersion, osVersion, deviceModel] = await Promise.all([
    DeviceInfo.getVersion(),
    DeviceInfo.getSystemVersion(),
    DeviceInfo.getModel(),
  ]);

  const language = (
    Intl?.DateTimeFormat?.().resolvedOptions?.().locale ?? 'en'
  ).split('-')[0];

  const timezone =
    Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone ?? 'UTC';

  return {
    platform: Platform.OS as 'android' | 'ios',
    appVersion,
    osVersion,
    deviceModel,
    language,
    timezone,
  };
}
