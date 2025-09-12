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
    const padding = '4rem'; // Adjust based on navigation bar size
    
    switch (position) {
      case 'top':
        return { paddingTop: padding };
      case 'bottom':
        return { paddingBottom: padding };
      case 'left':
        return { paddingLeft: padding };
      case 'right':
        return { paddingRight: padding };
      default:
        return { paddingBottom: padding };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      {navigationBar}
      
      {/* Main Content */}
      <main 
        className="min-h-screen flex flex-col"
        style={getContentPadding(controlBarPosition)}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;