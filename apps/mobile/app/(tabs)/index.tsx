import React, { useState, useEffect } from 'react';
import LandingPage from '@/components/home-screen';
import SplashScreen from '@/components/splash-screen';

export default function HomeScreen() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // Shows splash screen for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <LandingPage />;
}
