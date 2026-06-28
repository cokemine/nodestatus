import { notification } from 'antd';

export function notify(message: string, description: string | undefined, type: 'success' | 'error' | 'info' | 'warning' | 'open' = 'open'): void {
  notification[type]({
    message,
    description: description === 'ok' ? undefined : description,
  });
}
