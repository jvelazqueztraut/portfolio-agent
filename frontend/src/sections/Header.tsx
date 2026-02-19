'use client';

import Image from 'next/image';
import logo from '@/assets/svg/logo.svg';
import { useAgentStore } from '@/store/useAgentStore';

export default function Header() {
  const { sessionId } = useAgentStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                src={logo}
                alt="JVT Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
          </div>
          
          {/* Right side - Session info */}
          {sessionId && (
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-gray-300">
                Session: {sessionId.slice(0, 8)}...
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
