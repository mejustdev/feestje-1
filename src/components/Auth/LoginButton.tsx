import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../lib/auth/hooks';
import AuthModal from './AuthModal';

export default function LoginButton() {
  const [showModal, setShowModal] = useState(false);
  const { user, loading, signOut } = useAuth();
  
  useEffect(() => {
    const handleShowAuth = () => setShowModal(true);
    window.addEventListener('show-auth-modal', handleShowAuth);
    return () => window.removeEventListener('show-auth-modal', handleShowAuth);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 px-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Laden...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 flex-col sm:flex-row">
        <span className="text-sm text-purple-700 hidden sm:inline">
          {user.email}
        </span>
        <Button
          variant="outline"
          onClick={signOut}
          className="whitespace-nowrap bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
        >
          Uitloggen
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="default"
        onClick={() => setShowModal(true)}
        className="whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        Inloggen
      </Button>

      {showModal && (
        <AuthModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}