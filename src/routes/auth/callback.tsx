import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { logger } from '../../lib/logger';
import { supabase } from '../../lib/supabase/client';
import { getChildName, setChildName } from '../../lib/services/child-names/api';
import ChildNameModal from '../../components/Auth/ChildNameModal';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [needsChildName, setNeedsChildName] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('Auth state change', { event, session });

      if (event === 'SIGNED_IN') {
        if (session?.user) {
          logger.info('User signed in', { 
            userId: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });

          setUser(session.user);

          try {
            logger.debug('Checking child name');
            const childName = await getChildName(session.user.id);
            logger.debug('Child name check', { childName });

            if (!childName) {
              logger.debug('Child name needed');
              setNeedsChildName(true);
            } else {
              logger.info('Child name exists, navigating', { childName });
              navigate('/');
            }
          } catch (error) {
            logger.error('Error checking child name', error);
            navigate('/');
          }
        } else {
          logger.error('No user in session after SIGNED_IN event');
        }
      }
    });
  }, [navigate]);

  const handleChildNameSubmit = async (name: string) => {
    if (!user) return;
    logger.debug('Submitting child name', { userId: user.id, name });
    await setChildName(user.id, name);
    logger.debug('Child name saved');
    setUser(null);
    setNeedsChildName(false);
    navigate('/');
  };

  if (needsChildName && user) {
    return (
      <ChildNameModal
        onSubmit={handleChildNameSubmit}
        onClose={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-purple-600 mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600">
          You'll be redirected automatically
        </p>
      </div>
    </div>
  );
}