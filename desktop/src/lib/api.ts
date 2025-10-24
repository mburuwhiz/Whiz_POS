import type { LinkDeviceDto } from '@whiz-pos/shared';

const BASE_URL = 'http://localhost:4001'; // The local server URL

async function post<T>(path: string, body: Record<string, any>): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// API methods
export const api = {
  linkDevice: (data: LinkDeviceDto) => {
    return post<{ deviceToken: string; businessId: string; branding: any }>(
      '/device/link',
      data,
    );
  },
};
