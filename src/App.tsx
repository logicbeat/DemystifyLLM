
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import Layout from './components/Layout';
import NavigationBar from './components/NavigationBar';
import PresentationLoader from './components/PresentationLoader';
import SettingsPanel from './components/SettingsPanel';
import SlideViewer from './components/SlideViewer';
import {
  firstSlide,
  lastSlide,
  nextSlide,
  previousSlide
} from './store/slidesSlice';

// Component for handling slide routing
const SlideRoute: React.FC = () => {
  const { slideNumber } = useParams<{ slideNumber: string }>();
  const navigate = useNavigate();
  const { slides, currentSlideIndex } = useAppSelector(state => state.slides);

  // Sync URL when current slide changes (for programmatic navigation)
  useEffect(() => {
    if (slides.length > 0) {
      const expectedUrl = `/presentation/${currentSlideIndex + 1}`;
      const currentUrl = `/presentation/${slideNumber || '1'}`;
      if (expectedUrl !== currentUrl) {
        navigate(expectedUrl, { replace: true });
      }
    }
  }, [currentSlideIndex, slides.length, slideNumber, navigate]);

  return <SlideViewer />;
};

// Home component
const Home: React.FC = () => {
  const { slides } = useAppSelector(state => state.slides);
  const navigate = useNavigate();

  useEffect(() => {
    // If slides are loaded, redirect to first slide
    if (slides.length > 0) {
      navigate('/presentation/1', { replace: false });
    }
  }, [slides.length, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <PresentationLoader />
    </div>
  );
};

// Main App component
function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { slides, currentSlideIndex } = useAppSelector(state => state.slides);
  const { theme, wrapNavigation } = useAppSelector(state => state.preferences);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle navigation when not typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      // Only handle navigation if slides are loaded
      if (slides.length === 0) {
        return;
      }

      const isFirstSlide = currentSlideIndex === 0;
      const isLastSlide = currentSlideIndex === slides.length - 1;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (!isFirstSlide) {
            dispatch(previousSlide());
          } else if (wrapNavigation) {
            dispatch(lastSlide());
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (!isLastSlide) {
            dispatch(nextSlide());
          } else if (wrapNavigation) {
            dispatch(firstSlide());
          }
          break;
        case 'Home':
          event.preventDefault();
          dispatch(firstSlide());
          break;
        case 'End':
          event.preventDefault();
          dispatch(lastSlide());
          break;
        case 'Escape':
          setIsSettingsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, slides.length, currentSlideIndex, wrapNavigation]);

  return (
    <Layout 
      navigationBar={<NavigationBar onSettingsOpen={() => setIsSettingsOpen(true)} />}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/presentation/:slideNumber" element={<SlideRoute />} />
        <Route path="*" element={
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Page Not Found
              </h1>
              <p className="text-gray-600 mb-4">
                The page you're looking for doesn't exist.
              </p>
              <a 
                href="/" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Go to Home
              </a>
            </div>
          </div>
        } />
      </Routes>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </Layout>
  );
}

export default App;
