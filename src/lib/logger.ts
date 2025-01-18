import { AuthError, Session, User } from '@supabase/supabase-js';

export const logger = {
  service: {
    start: (service: string) => {
      console.group(`🚀 Starting ${service}`);
      console.time(service);
    },
    end: (service: string) => {
      console.timeEnd(service);
      console.groupEnd();
    }
  },
  debug: (message: string, data?: any) => {
    console.group(`🔍 Debug: ${message}`);
    if (data) console.log('Data:', data);
    console.groupEnd();
  },
  info: (message: string, data?: any) => {
    console.group(`ℹ️ Info: ${message}`);
    if (data) console.log('Data:', data);
    console.groupEnd();
  },
  error: (message: string, error: any) => {
    console.group('❌ Error');
    console.error('Message:', message);
    console.error('Error:', error);
    if (error.stack) console.error('Stack:', error.stack);
    console.groupEnd();
  },
  auth: {
    stateChange: (event: string, session: Session | null) => {
      console.group(`🔐 Auth State Change: ${event}`);
      console.log('Event:', event);
      console.log('Session Details:', session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          role: session.user?.role,
          app_metadata: session.user?.app_metadata,
          user_metadata: session.user?.user_metadata,
        },
        expires_at: session.expires_at,
      } : null);
      console.groupEnd();
    },
    error: (context: string, error: AuthError | Error) => {
      console.group('❌ Auth Error');
      console.error('Context:', context);
      console.error('Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      console.groupEnd();
    },
    success: (context: string, data?: any) => {
      console.group('✅ Auth Success');
      console.log('Context:', context);
      if (data) console.log('Data:', data);
      console.groupEnd();
    }
  }
};