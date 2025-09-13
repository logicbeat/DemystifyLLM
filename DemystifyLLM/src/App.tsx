
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { 
  setCurrentSlide, 
  nextSlide, 
  previousSlide, 
  firstSlide, 
  lastSlide 
} from './store/slidesSlice';
import Layout from './components/Layout';
import PresentationLoader from './components/PresentationLoader';
import SlideViewer from './components/SlideViewer';
import NavigationBar from './components/NavigationBar';
import SettingsPanel from './components/SettingsPanel';

// Component for handling slide routing
const SlideRoute: React.FC = () => {
  const { slideNumber } = useParams<{ slideNumber: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { slides, currentSlideIndex } = useAppSelector(state => state.slides);

  useEffect(() => {
    if (slideNumber) {
      const slideIndex = parseInt(slideNumber) - 1; // Convert to 0-based index
      if (slideIndex >= 0 && slideIndex < slides.length) {
        if (slideIndex !== currentSlideIndex) {
          dispatch(setCurrentSlide(slideIndex));
        }
      } else if (slides.length > 0) {
        // Invalid slide number, redirect to first slide
        navigate('/presentation/1', { replace: true });
      }
    }
  }, [slideNumber, slides.length, currentSlideIndex, dispatch, navigate]);

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
      navigate('/presentation/1');
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
      navigationBar={
        <>
          <NavigationBar />
          {/* Settings Button */}
          {slides.length > 0 && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="fixed top-4 right-4 z-40 p-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Settings"
              aria-label="Open settings"
            >
              ⚙️
            </button>
          )}
        </>
      }
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

      {/* Floating Settings Button */}
      {slides.length > 0 && (
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="fixed top-4 right-4 z-40 p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 transform hover:scale-110 active:scale-95 md:hidden"
          aria-label="Open settings"
          title="Settings"
        >
          ⚙️
        </button>
      )}
    </Layout>
  );
}

export default App;
