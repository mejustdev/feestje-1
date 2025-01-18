import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { connection, type ConnectionState } from '../lib/supabase/connection';
import { isDev } from '../lib/utils/env';

const STATUS_CONFIG = {
  unknown: {
    icon: Loader2,
    text: 'Connecting...',
    className: 'text-gray-500'
  },
  error: {
    icon: AlertCircle,
    text: isDev ? 'Dev mode' : 'Connection error',
    className: 'text-red-500'
  },
  connected: {
    icon: CheckCircle2,
    text: isDev ? 'Dev mode' : 'Connected',
    className: 'text-green-500'
  }
};

export default function ConnectionStatus() {
  const [state, setState] = useState<ConnectionState>('unknown');

  useEffect(() => {
    connection.test();
    return connection.subscribe(setState);
  }, []);

  const config = STATUS_CONFIG[state];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${config.className}`}>
      <Icon className={`w-4 h-4 ${state === 'unknown' ? 'animate-spin' : ''}`} />
      <span className="text-sm">{config.text}</span>
    </div>
  );
}