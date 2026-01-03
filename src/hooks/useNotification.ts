import { useState, useCallback } from 'react';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
}

