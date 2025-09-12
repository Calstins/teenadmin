'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Home,
  ArrowLeft,
  Search,
  RefreshCw,
  MapPin,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-8">
          {/* Animated 404 */}
          <div
            className={`transform transition-all duration-1000 ${
              isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
          >
            <div className="relative">
              <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-bounce">🎯</div>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          <div
            className={`space-y-4 transform transition-all duration-1000 delay-300 ${
              isAnimating
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="flex items-center justify-center space-x-2 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Oops! Page Not Found</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto">
              Looks like this page went on an adventure and got lost! Don&apos;t
              worry, even the best explorers sometimes take a wrong turn.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <MapPin className="h-4 w-4" />
                <p className="text-sm font-medium">What happened?</p>
              </div>
              <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                <li>• The page might have been moved or deleted</li>
                <li>• You might have typed the URL incorrectly</li>
                <li>• The link you clicked might be broken</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`grid gap-4 sm:grid-cols-3 transform transition-all duration-1000 delay-500 ${
              isAnimating
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            <Button
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-105"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>

            <Button
              variant="outline"
              onClick={handleGoBack}
              className="transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              className="transition-all duration-200 transform hover:scale-105"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Helpful Links */}
          {/* <div
            className={`transform transition-all duration-1000 delay-700 ${
              isAnimating
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="border-t pt-6">
              <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 mb-4">
                <Compass className="h-4 w-4" />
                <p className="text-sm font-medium">Quick Navigation</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/raffle')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Raffle System
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/challenges')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Challenges
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/badges')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Badges
                </Button>
              </div>
            </div>
          </div> */}

          {/* Fun Animation Elements */}
          {/* <div className="absolute top-8 left-8 text-2xl animate-pulse opacity-50">
            ⭐
          </div>
          <div className="absolute top-16 right-12 text-xl animate-pulse opacity-50 delay-500">
            🌟
          </div>
          <div className="absolute bottom-16 left-16 text-lg animate-pulse opacity-50 delay-1000">
            ✨
          </div>
          <div className="absolute bottom-8 right-8 text-2xl animate-pulse opacity-50 delay-700">
            💫
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
