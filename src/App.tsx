
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import Layout from './components/Layout';
import NavigationBar from './components/NavigationBar';
import PresentationLoader from './components/PresentationLoader';
import SettingsPanel from './components/SettingsPanel';
import SlideViewer from './components/SlideViewer';
import { LabsModal } from './components/LabsModal';
import CacheDebugger from './components/CacheDebugger';
import {
  firstSlide,
  lastSlide,
  nextSlide,
  previousSlide,
  setCurrentSlide,
  setError,
  setGistId,
  setGistUrl,
  setLoading,
  setSlidesData
} from './store/slidesSlice';
import { loadPresentationFromGistId } from './utils/gistFetcher';

// Component for handling query parameter-based slide routing
const PresentationRoute: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { slides, currentSlideIndex, gistId, loading } = useAppSelector(state => state.slides);

  const urlGistId = searchParams.get('gistId');
  const slideNumber = searchParams.get('slide');

  // Load presentation from gist ID if not already loaded
  useEffect(() => {
    if (urlGistId && (!gistId || gistId !== urlGistId)) {
      const loadPresentation = async () => {
        dispatch(setLoading(true));
        try {
          const [slidesArray, metadata] = await loadPresentationFromGistId(urlGistId);
          
          // Sort slides by slideIndex to ensure proper order
          slidesArray.sort((a, b) => a.slideIndex - b.slideIndex);
          
          // Create presentation data with proper structure
          const presentationData = {
            slides: slidesArray,
            metadata: {
              title: metadata.title || "Untitled Presentation",
              description: metadata.description,
            },
          };
          
          // Store the slides data and gist ID
          dispatch(setSlidesData(presentationData));
          dispatch(setGistId(urlGistId));
          dispatch(setGistUrl(`https://gist.github.com/${urlGistId}`));
          
          // Set the current slide based on URL
          const slideIndex = parseInt(slideNumber || '1', 10) - 1;
          if (slideIndex >= 0 && slideIndex < slidesArray.length) {
            dispatch(setCurrentSlide(slideIndex));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to load presentation from Gist";
          dispatch(setError(errorMessage));
        }
      };
      
      loadPresentation();
    }
  }, [urlGistId, gistId, slideNumber, dispatch]);

  // Sync URL when current slide changes (for programmatic navigation)
  useEffect(() => {
    if (slides.length > 0 && urlGistId) {
      const expectedSlideNumber = currentSlideIndex + 1;
      const currentUrlSlideNumber = parseInt(slideNumber || '1', 10);
      if (expectedSlideNumber !== currentUrlSlideNumber) {
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('gistId', urlGistId);
        newSearchParams.set('slide', expectedSlideNumber.toString());
        navigate(`/?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [currentSlideIndex, slides.length, slideNumber, navigate, urlGistId]);

  // Show loading state while fetching
  if (loading.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading presentation...</p>
        </div>
      </div>
    );
  }

  // Show error state if loading failed
  if (loading.error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Failed to Load Presentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {loading.error}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <SlideViewer />;
};

// Home component
const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { slides, gistId } = useAppSelector(state => state.slides);
  const navigate = useNavigate();

  const urlGistId = searchParams.get('gistId');
  const slideNumber = searchParams.get('slide');

  useEffect(() => {
    // If slides are loaded and we have query parameters, render the presentation
    if (slides.length > 0 && gistId && urlGistId) {
      // This is handled by PresentationRoute component
      return;
    }
    // If slides are loaded but no query parameters, redirect to first slide with gist ID in URL
    else if (slides.length > 0 && gistId && !urlGistId) {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('gistId', gistId);
      newSearchParams.set('slide', '1');
      navigate(`/?${newSearchParams.toString()}`, { replace: false });
    }
  }, [slides.length, gistId, navigate, urlGistId, slideNumber]);

  // If we have query parameters, show the presentation
  if (urlGistId && slideNumber) {
    return <PresentationRoute />;
  }

  // Otherwise show the presentation loader
  return (
    <div className="flex-1 flex items-center justify-center">
      <PresentationLoader />
    </div>
  );
};

// Main App component
function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLabsOpen, setIsLabsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { slides, currentSlideIndex } = useAppSelector(state => state.slides);
  const { theme, wrapNavigation } = useAppSelector(state => state.preferences);

  // Get current slide for labs modal
  const currentSlide = slides[currentSlideIndex] || null;

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
          setIsLabsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, slides.length, currentSlideIndex, wrapNavigation]);

  return (
    <Layout 
      navigationBar={
        <NavigationBar 
          onSettingsOpen={() => setIsSettingsOpen(true)}
          onLabsOpen={() => setIsLabsOpen(true)}
        />
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
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

      {/* Labs Modal */}
      <LabsModal
        isOpen={isLabsOpen}
        onClose={() => setIsLabsOpen(false)}
        slide={currentSlide}
      />

      {/* Cache Debugger - only show in development */}
      {import.meta.env.DEV && (
        <CacheDebugger isVisible={true} />
      )}
    </Layout>
  );
}

export default App;
