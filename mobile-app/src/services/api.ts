import axios from 'axios';
import { useMobileStore } from '../store/mobileStore';

// Create an axios instance
const apiClient = axios.create({
  timeout: 5000, // Reduced timeout for quicker feedback
});

// Request interceptor to add API key and URL
apiClient.interceptors.request.use((config) => {
  const { connection } = useMobileStore.getState();

  if (connection.apiUrl) {
    config.baseURL = connection.apiUrl;
  }

  if (connection.apiKey) {
    config.headers['X-API-KEY'] = connection.apiKey;
    // Also support Bearer token if that's what desktop uses (some memories imply both)
    config.headers['Authorization'] = `Bearer ${connection.apiKey}`;
  }

  return config;
});

export const api = {
  // Check connection status
  checkConnection: async () => {
    try {
      // Use the public status endpoint to verify network connectivity
      const response = await apiClient.get('/api/status');
      return response.status === 200 && response.data.status === 'ok';
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  },

  // Full sync (Pull)
  syncPull: async () => {
    const response = await apiClient.get('/api/sync');
    return response.data;
  },

  // Push sync queue
  syncPush: async (queue: any[]) => {
    if (queue.length === 0) return;
    const response = await apiClient.post('/api/sync', { operations: queue });
    return response.data;
  },

  // Print Receipt (Remote)
  printReceipt: async (transactionData: any) => {
    const response = await apiClient.post('/api/print-receipt', transactionData);
    return response.data;
  }
};
