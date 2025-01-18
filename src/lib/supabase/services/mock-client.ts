import { MockDatabase } from './mock-db';
import type { Database } from '../types';
import { logger } from '../../logger';

type MockChannel = {
  unsubscribe: () => void;
};

export class MockSupabaseClient {
  private static instance: MockSupabaseClient;
  private db: MockDatabase;
  private channels = new Map<string, MockChannel>();

  // Mock auth state
  private mockUser = {
    id: 'mock-user-id',
    email: 'mock@example.com',
    role: 'authenticated',
    aud: 'authenticated'
  };

  constructor() {
    if (MockSupabaseClient.instance) {
      return MockSupabaseClient.instance;
    }
    this.db = new MockDatabase();
    MockSupabaseClient.instance = this;
    logger.auth.success('MockSupabaseClient initialized');
  }

  from(table: keyof Database['public']['Tables']) {
    this.db.from(table);
    this.db.from(table);
    return {
      select: (columns = '*') => {
        return {
          order: (_column: string, _options: { ascending: boolean }) => this.db.select(columns),
          eq: (_field: string, _value: any) => ({
            order: (_column: string, _options: { ascending: boolean }) => this.db.select(columns)
          }),
          eq: (_field: string, _value: any) => ({
            order: (_column: string, _options: { ascending: boolean }) => this.db.select(columns)
          }),
          single: () => this.db.select(columns),
        };
      },
      insert: (data: any) => this.db.insert(data),
      update: (updates: any) => ({
        eq: (_field: string, itemId: any) => ({
          eq: (_field2: string, userId: any) => {
            return this.db.update(itemId, userId, updates);
          },
        })
      }),
      delete: () => ({
        eq: (_field: string, itemId: any) => ({
          eq: (_field2: string, userId: any) => {
            return this.db.delete(itemId, userId);
          },
        })
      }),
    };
  }

  channel(name: string) {
    return {
      on: (_event: string, _filter: any, callback: (payload: any) => void) => {
        logger.auth.success('Channel subscription', { name });
        return {
          subscribe: async () => {
            const channel: MockChannel = {
              unsubscribe: this.db.subscribe(callback)
            };
            this.channels.set(name, channel);
            logger.auth.success('Channel subscribed', { name });
            return channel;
          }
        };
      }
    };
  }

  async removeChannel(channel: MockChannel) {
    if (typeof channel?.unsubscribe === 'function') {
      channel.unsubscribe();
      logger.auth.success('Channel removed');
    }
  }

  // Mock auth methods for development
  auth = {
    getUser: () => Promise.resolve({ data: { user: this.mockUser }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: () => Promise.resolve({ data: { user: this.mockUser }, error: null }),
    signOut: () => {
      this.mockUser = null;
      return Promise.resolve({ error: null });
    }
  };
}