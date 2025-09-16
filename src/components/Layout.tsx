import React from 'react';
import { useAppSelector } from '../app/hooks';
import type { ControlBarPosition } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  navigationBar: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, navigationBar }) => {
  const { controlBarPosition } = useAppSelector(state => state.preferences);

  const getContentPadding = (position: ControlBarPosition) => {
    switch (position) {
      case 'top':
        return 'pt-20'; // Tailwind class for top padding
      case 'bottom':
        return 'pb-20'; // Tailwind class for bottom padding
      case 'left':
        return 'pl-4 md:pl-48'; // Responsive left padding
      case 'right':
        return 'pr-4 md:pr-48'; // Responsive right padding
      default:
        return 'pb-20';
    }
  };

  const getContentClasses = () => {
    const baseClasses = "min-h-screen flex flex-col transition-all duration-300";
    const paddingClass = getContentPadding(controlBarPosition);
    return `${baseClasses} ${paddingClass}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation Bar */}
      {navigationBar}
      
      {/* Main Content */}
      <main className={getContentClasses()}>
        {children}
      </main>
    </div>
  );
};

export default Layout;