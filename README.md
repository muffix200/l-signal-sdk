# @signal/react-native-sdk

React Native SDK for [Signal](https://github.com/lavina-tech/signal) — a self-hosted push notification and in-app messaging platform.

## Requirements

- React Native 0.70+
- Firebase project with Cloud Messaging enabled (both Android and iOS)

## Installation

```sh
yarn add @signal/react-native-sdk
```

### Peer dependencies

```sh
yarn add axios \
  @react-native-firebase/app \
  @react-native-firebase/messaging \
  react-native-device-info \
  react-native-mmkv
```

Follow the setup guides for each native dependency:
- [@react-native-firebase](https://rnfirebase.io/)
- [react-native-device-info](https://github.com/react-native-device-info/react-native-device-info)
- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)

## Quick Start

### 1. Initialize the SDK

Call `Signal.initialize()` once at app startup, before any other SDK calls.

```ts
import Signal from '@signal/react-native-sdk';

Signal.initialize({
  appKey: 'your-api-key',   // from Signal dashboard → Settings → API Keys
  apiUrl: 'https://signal.yourdomain.com',
});
```

### 2. Register for push notifications

Call this after the user has granted notification permissions. Handles both FCM (Android) and APNs (iOS) automatically.

```ts
await Signal.registerForPush();
```

### 3. Identify users

```ts
// Link the device to a user in your system
await Signal.login('user-123');

// Unlink on sign-out
await Signal.logout();
```

### 4. Tag users

Tags are key/value pairs used for segmentation in the Signal dashboard.

```ts
await Signal.setTags({
  plan: 'pro',
  language: 'en',
  onboarded: 'true',
});
```

### 5. Manage subscription

```ts
// Opt the user out of push notifications
await Signal.setSubscription(false);

// Opt back in
await Signal.setSubscription(true);
```

---

## In-App Messages

Wrap your app (or the relevant screen tree) in `InAppProvider` to enable in-app message rendering.

```tsx
import { InAppProvider } from '@signal/react-native-sdk';

export default function App() {
  return (
    <InAppProvider>
      {/* your app */}
    </InAppProvider>
  );
}
```

### Fetch and show messages

Trigger message display manually (e.g. on screen focus, after an action):

```ts
await Signal.InAppMessages.fetchAndShow();

// With trigger filtering
await Signal.InAppMessages.fetchAndShow('screen', 'checkout');
```

### Listen to in-app events

```ts
import type { InAppClickEvent } from '@signal/react-native-sdk';

Signal.InAppMessages.addEventListener('click', (event: InAppClickEvent) => {
  console.log('Button clicked:', event.button.label);
  console.log('Action URL:', event.button.url);
});

Signal.InAppMessages.addEventListener('impression', (event) => {
  console.log('Message shown:', event.messageId);
});

Signal.InAppMessages.addEventListener('dismiss', (event) => {
  console.log('Message dismissed:', event.messageId);
});

// Clean up
Signal.InAppMessages.removeEventListener('click', handler);
```

---

## API Reference

### `Signal.initialize(config)`

Must be called once before any other method.

| Parameter | Type | Description |
|---|---|---|
| `config.appKey` | `string` | API key from the Signal dashboard |
| `config.apiUrl` | `string` | Base URL of your Signal backend |

### `Signal.registerForPush()`

Registers the device for push notifications with FCM/APNs and syncs the token with Signal. Safe to call multiple times — re-registers if the token has rotated.

### `Signal.login(externalId)`

Associates the current device with a user ID from your system. Call this after your own login flow completes.

### `Signal.logout()`

Dissociates the device from any user. Call this on sign-out.

### `Signal.setTags(tags)`

Sets key/value tags on the current device. Tags are merged — existing keys are overwritten, unspecified keys are left unchanged.

### `Signal.setSubscription(isSubscribed)`

Opts the device in or out of push notifications without unregistering the device token.

### `Signal.InAppMessages.fetchAndShow(triggerType?, triggerEvent?)`

Fetches in-app messages from Signal and displays the first eligible one. Optionally filter by trigger type and event name.

### `Signal.InAppMessages.addEventListener(event, handler)`

Subscribes to in-app message lifecycle events: `"click"`, `"impression"`, `"dismiss"`.

### `Signal.InAppMessages.removeEventListener(event, handler)`

Removes a previously registered event listener.

---

## Types

```ts
interface SignalConfig {
  appKey: string;
  apiUrl: string;
}

interface InAppMessage {
  id: string;
  type: 'modal' | 'banner' | 'fullscreen';
  content: InAppContent;
  triggerType?: string;
  triggerEvent?: string;
}

interface InAppClickEvent {
  messageId: string;
  button: InAppButton;
}

interface InAppImpressionEvent {
  messageId: string;
}

interface InAppDismissEvent {
  messageId: string;
}
```

---

## License

MIT — see [LICENSE](./LICENSE)
