import React, { useState, useEffect, type ReactNode } from 'react';
import { inAppManager } from './manager';
import { InAppRenderer } from './renderer';
import type { InAppMessage, InAppButton } from './types';

interface Props {
  children: ReactNode;
}

export function InAppProvider({ children }: Props) {
  const [currentMessage, setCurrentMessage] = useState<InAppMessage | null>(null);

  useEffect(() => {
    inAppManager.bindSetter(setCurrentMessage);
    inAppManager.startAppStateListener();

    return () => {
      inAppManager.stopAppStateListener();
    };
  }, []);

  const handleButtonPress = (button: InAppButton) => {
    inAppManager.emit('click', {
      messageId: currentMessage!.id,
      buttonId: button.id,
      actionUrl: button.action_url,
    });
    inAppManager.onClose();
  };

  const handleClose = () => {
    if (currentMessage) {
      inAppManager.emit('dismiss', { messageId: currentMessage.id });
    }
    inAppManager.onClose();
  };

  return (
    <>
      {children}
      {currentMessage ? (
        <InAppRenderer
          message={currentMessage}
          onClose={handleClose}
          onButtonPress={handleButtonPress}
        />
      ) : null}
    </>
  );
}
