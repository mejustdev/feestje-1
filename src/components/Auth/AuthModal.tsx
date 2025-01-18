import React, { useState } from 'react';
import { X, Loader2, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '../../lib/auth/hooks';
import { isDev } from '../../lib/utils/env';
import { getChildName, setChildName } from '../../lib/services/child-names/api';
import ChildNameModal from './ChildNameModal';
import { authConfig } from '../../lib/auth/config';

const DEV_BUTTON_TEXT = 'Continue as Dev User';

type AuthModalProps = {
  onClose: () => void;
};

const AUTH_PROVIDERS = {
  google: {
    name: 'Google',
    icon: 'https://www.google.com/favicon.ico',
    className: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
  }
};

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChildNameModal, setShowChildNameModal] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleChildNameSubmit = async (name: string) => {
    if (!tempUserId) {
      throw new Error('No user ID available');
    }
    await setChildName(tempUserId, name);
    setShowChildNameModal(false);
    onClose();
  };

  const handleSignIn = async (provider = 'google') => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn(provider);
      onClose();
    } catch (error) {
      setError('Inloggen mislukt. Probeer het opnieuw.');
      setIsLoading(false);
    }
  };

  if (showChildNameModal) {
    return <ChildNameModal onSubmit={handleChildNameSubmit} onClose={onClose} />;
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Inloggen om Cadeaus te Reserveren
          </DialogTitle>
        </DialogHeader>

        {isDev && (
          <Button
            variant="secondary"
            onClick={() => handleSignIn('google')}
            className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200"
            title="Sign in as dev user"
          >
            <User className="w-5 h-5" />
            Doorgaan als Dev Gebruiker
          </Button>
        )}

        {authConfig.providers.map(provider => {
          const config = AUTH_PROVIDERS[provider];
          return (
            <Button
              variant="outline"
              key={provider}
              onClick={() => handleSignIn(provider)}
              disabled={isLoading || isDev}
              className="w-full mt-2 bg-white hover:bg-gray-50 border border-gray-300"
              title={isDev ? `${config.name} login is disabled in development mode` : undefined}
            >
              <img 
                src={config.icon}
                alt={config.name}
                className="w-5 h-5"
              />
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verbinden...
                </>
              ) : (
                `Doorgaan met ${config.name}`
              )}
            </Button>
          );
        })}

        {error && (
          <p className="mt-4 text-sm text-destructive text-center">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}