import { AppState, type AppStateStatus } from 'react-native';
import { fetchInAppMessages } from './fetcher';
import type { InAppMessage, InAppEventMap } from './types';

type EventListener<K extends keyof InAppEventMap> = (
  event: InAppEventMap[K],
) => void;

type Listeners = {
  [K in keyof InAppEventMap]: Set<EventListener<K>>;
};

class InAppMessageManager {
  private listeners: Listeners = {
    click: new Set(),
    impression: new Set(),
    dismiss: new Set(),
  };

  private queue: InAppMessage[] = [];
  private displaying = false;
  private setMessage: ((msg: InAppMessage | null) => void) | null = null;

  // Called by the InAppProvider to wire up the React state setter
  bindSetter(setter: (msg: InAppMessage | null) => void): void {
    this.setMessage = setter;
  }

  // ── Event bus ────────────────────────────────────────────────────────────

  addEventListener<K extends keyof InAppEventMap>(
    event: K,
    handler: EventListener<K>,
  ): void {
    (this.listeners[event] as Set<EventListener<K>>).add(handler);
  }

  removeEventListener<K extends keyof InAppEventMap>(
    event: K,
    handler: EventListener<K>,
  ): void {
    (this.listeners[event] as Set<EventListener<K>>).delete(handler);
  }

  emit<K extends keyof InAppEventMap>(
    event: K,
    payload: InAppEventMap[K],
  ): void {
    (this.listeners[event] as Set<EventListener<K>>).forEach(fn =>
      fn(payload),
    );
  }

  // ── Display queue ────────────────────────────────────────────────────────

  private showNext(): void {
    if (this.displaying || this.queue.length === 0 || !this.setMessage) {
      return;
    }
    this.displaying = true;
    this.setMessage(this.queue[0]);
  }

  onClose(): void {
    this.queue.shift();
    this.displaying = false;
    this.setMessage?.(null);
    // Brief pause before showing the next one
    setTimeout(() => this.showNext(), 400);
  }

  // ── Fetch & show ─────────────────────────────────────────────────────────

  async fetchAndShow(
    triggerType?: string,
    triggerEvent?: string,
  ): Promise<void> {
    try {
      const messages = await fetchInAppMessages(triggerType, triggerEvent);
      if (messages.length === 0) {
        return;
      }
      this.queue.push(...messages);
      this.showNext();
    } catch {
      // Non-critical
    }
  }

  // ── App foreground listener ───────────────────────────────────────────────

  private appStateSubscription: ReturnType<
    typeof AppState.addEventListener
  > | null = null;

  startAppStateListener(): void {
    if (this.appStateSubscription) {
      return;
    }
    let lastState: AppStateStatus = AppState.currentState;

    this.appStateSubscription = AppState.addEventListener(
      'change',
      nextState => {
        if (lastState !== 'active' && nextState === 'active') {
          this.fetchAndShow('on_app_open');
        }
        lastState = nextState;
      },
    );

    // Also fetch on initial mount if already active
    if (AppState.currentState === 'active') {
      this.fetchAndShow('on_app_open');
    }
  }

  stopAppStateListener(): void {
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
  }
}

export const inAppManager = new InAppMessageManager();
