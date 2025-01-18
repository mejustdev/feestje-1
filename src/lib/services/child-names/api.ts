import { supabase } from '../../supabase/client';
import { logger } from '../../logger';
import type { ChildName } from './types';

export async function getChildName(userId: string): Promise<string | null> {
  logger.service.start('getChildName');
  logger.debug('Getting child name', { userId });

  const { data, error } = await supabase
    .from('child_names')
    .select('name')
    .eq('user_id', userId)
    .single();

  logger.info('Child name query result', { 
    data,
    error,
    status: error ? 'error' : 'success',
    query: { table: 'child_names', userId }
  });

  if (error) {
    if (error.code === 'PGRST116') {
      logger.debug('No child name found');
      logger.service.end('getChildName');
      return null;
    }
    logger.error('Error getting child name', error);
    logger.service.end('getChildName');
    throw error;
  }

  logger.service.end('getChildName');
  return data.name;
}

export async function setChildName(userId: string, name: string): Promise<void> {
  logger.service.start('setChildName');
  logger.debug('Setting child name', { userId, name });

  const { error } = await supabase
    .from('child_names')
    .upsert({
      user_id: userId,
      name
    }, {
      onConflict: 'user_id'
    });

  logger.info('Child name upsert result', {
    error,
    status: error ? 'error' : 'success',
    query: { table: 'child_names', userId, name }
  });

  if (error) {
    logger.error('Error setting child name', error);
    logger.service.end('setChildName');
    throw error;
  }
  
  logger.debug('Child name set successfully', { userId });
  logger.service.end('setChildName');
}