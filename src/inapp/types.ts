export interface InAppButton {
  id: string;
  text: string;
  action_url?: string;
  style?: 'primary' | 'secondary' | 'destructive';
}

export interface InAppContent {
  title?: string;
  body?: string;
  image_url?: string;
  background_color?: string;
  buttons?: InAppButton[];
}

export interface InAppMessage {
  id: string;
  name: string;
  type: 'modal' | 'banner' | 'fullscreen';
  content: InAppContent;
  trigger_type: 'on_app_open' | 'on_event';
  trigger_event?: string;
}

export type InAppEventType = 'impression' | 'click' | 'dismiss';

export interface InAppClickEvent {
  messageId: string;
  buttonId?: string;
  actionUrl?: string;
}

export interface InAppImpressionEvent {
  messageId: string;
}

export interface InAppDismissEvent {
  messageId: string;
}

export type InAppEventMap = {
  click: InAppClickEvent;
  impression: InAppImpressionEvent;
  dismiss: InAppDismissEvent;
};
