import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth/hooks';
import ConnectionStatus from '../components/ConnectionStatus';
import WishList from '../components/WishList/index';
import LocationMap from '../components/LocationMap';
import BirthdayCountdown from '../components/BirthdayCountdown';
import BirthdayInfo from '../components/BirthdayInfo';
import LoadingSpinner from '../components/LoadingSpinner';
import SnowEffect from '../components/Snow/SnowEffect';
import VoteSection from '../components/VoteSection';
import NotesGrid from '../components/Notes/NotesGrid';
import LoginButton from '../components/Auth/LoginButton';

const SECTION_CLASSES = "space-y-6 w-full max-w-4xl mx-auto";
const CONTAINER_CLASSES = "container mx-auto px-4 py-8 space-y-8";

export default function MainLayout() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 relative">
      <SnowEffect />
      <div className={CONTAINER_CLASSES}>
        {/* Header */}
        <div className="relative text-center mb-8">
          <div className="flex justify-between items-center">
            <ConnectionStatus />
            <h1 className="text-4xl md:text-6xl font-bold text-purple-600 mb-2 animate-bounce">
              Azra's Birthday! 🎉
            </h1>
            <LoginButton />
          </div>
        </div>

        {/* Main Content - Stacked Layout */}
        <div className={SECTION_CLASSES}>
          <BirthdayCountdown />
          <BirthdayInfo />
          <LocationMap />
          <WishList />
          <VoteSection />
          <NotesGrid />
        </div>
      </div>
      <Outlet />
    </div>
  );
}