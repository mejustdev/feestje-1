import { supabase } from './client';
import { ConnectionState } from './types';
import { isProd } from '../utils/env';

const listeners = new Set<(state: ConnectionState) => void>();
let connectionState: ConnectionState = 'unknown';
let retryTimeout: NodeJS.Timeout | null = null;
const RETRY_DELAY = isProd ? 5000 : 0; // Only retry in production

export const connection = {
  getState: () => connectionState,
  
  subscribe: (callback: (state: ConnectionState) => void) => {
    listeners.add(callback);
    callback(connectionState);
    return () => listeners.delete(callback);
  },

  setState: (newState: ConnectionState) => {
    if (newState !== connectionState) {
      connectionState = newState;
      listeners.forEach(listener => listener(newState));
    }
  },

  test: async () => {
    try {
      // In development, just set as connected to avoid errors
      if (!isProd) {
        connection.setState('connected');
        return;
      }

      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }

      const { error } = await supabase
        .from('wish_list_reservations')
        .select('id', { count: 'exact', head: true });
      
      if (error) throw error;
      connection.setState('connected');
    } catch (err) {
      console.error('Connection test failed:', err);
      connection.setState('error');
      
      // Only retry in production
      if (isProd) {
        retryTimeout = setTimeout(() => {
          if (connectionState === 'error') {
            connection.test();
          }
        }, RETRY_DELAY);
      }
    }
  }
};