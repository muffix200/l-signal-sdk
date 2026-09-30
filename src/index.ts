import { setConfig, type SignalConfig } from './config';
import { resetClient } from './client';
import { registerForPush } from './push';
import { login, logout } from './auth';
import { setTags, setSubscription } from './tags';
import { setupNotificationOpenTracking } from './tracking';
import { inAppManager } from './inapp/manager';
import type { InAppEventMap } from './inapp/types';

export { InAppProvider } from './inapp/InAppProvider';
export type { InAppMessage, InAppClickEvent, InAppImpressionEvent, InAppDismissEvent } from './inapp/types';

function initialize(config: SignalConfig): void {
  setConfig(config);
  resetClient();
  setupNotificationOpenTracking();
}

const InAppMessages = {
  addEventListener<K extends keyof InAppEventMap>(
    event: K,
    handler: (payload: InAppEventMap[K]) => void,
  ): void {
    inAppManager.addEventListener(event, handler);
  },

  removeEventListener<K extends keyof InAppEventMap>(
    event: K,
    handler: (payload: InAppEventMap[K]) => void,
  ): void {
    inAppManager.removeEventListener(event, handler);
  },

  fetchAndShow(triggerType?: string, triggerEvent?: string): Promise<void> {
    return inAppManager.fetchAndShow(triggerType, triggerEvent);
  },
};

const Signal = {
  initialize,
  registerForPush,
  login,
  logout,
  setTags,
  setSubscription,
  InAppMessages,
};

export default Signal;
