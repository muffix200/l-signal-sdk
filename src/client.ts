import axios, { type AxiosInstance } from 'axios';
import { getConfig } from './config';

let _client: AxiosInstance | null = null;

export function getClient(): AxiosInstance {
  if (_client) {
    return _client;
  }

  const config = getConfig();

  _client = axios.create({
    baseURL: `${config.apiUrl}/api/v1/sdk`,
    headers: {
      'X-Signal-Key': config.appKey,
      'Content-Type': 'application/json',
    },
    timeout: 10_000,
  });

  return _client;
}

export function resetClient(): void {
  _client = null;
}
