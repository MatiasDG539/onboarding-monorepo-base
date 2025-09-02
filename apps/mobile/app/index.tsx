import React, { useState, useEffect } from 'react';
import WelcomeScreen from '@/components/welcome-screen';
import SplashScreen from '@/components/splash-screen';

const Welcome = () => {
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

  return <WelcomeScreen />;
}

export default Welcome;
