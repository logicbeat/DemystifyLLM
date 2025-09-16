
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
  previousSlide,
  setCurrentSlide,
  setError,
  setGistId,
  setGistUrl,
  setLoading,
  setSlidesData
} from './store/slidesSlice';
import { loadPresentationFromGistId } from './utils/gistFetcher';

// Component for handling gist-based slide routing
const GistSlideRoute: React.FC = () => {
  const { gistId: urlGistId, slideNumber } = useParams<{ gistId: string; slideNumber: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { slides, currentSlideIndex, gistId, loading } = useAppSelector(state => state.slides);

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
      const expectedUrl = `/presentation/${urlGistId}/${currentSlideIndex + 1}`;
      const currentUrl = `/presentation/${urlGistId}/${slideNumber || '1'}`;
      if (expectedUrl !== currentUrl) {
        navigate(expectedUrl, { replace: true });
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

// Component for handling slide routing
const SlideRoute: React.FC = () => {
  const { slideNumber } = useParams<{ slideNumber: string }>();
  const navigate = useNavigate();
  const { slides, currentSlideIndex, gistId } = useAppSelector(state => state.slides);

  // Sync URL when current slide changes (for programmatic navigation)
  useEffect(() => {
    if (slides.length > 0 && gistId) {
      const expectedUrl = `/presentation/${gistId}/${currentSlideIndex + 1}`;
      const currentUrl = `/presentation/${slideNumber || '1'}`;
      if (expectedUrl !== currentUrl) {
        navigate(expectedUrl, { replace: true });
      }
    }
  }, [currentSlideIndex, slides.length, slideNumber, navigate, gistId]);

  return <SlideViewer />;
};

// Home component
const Home: React.FC = () => {
  const { slides, gistId } = useAppSelector(state => state.slides);
  const navigate = useNavigate();

  useEffect(() => {
    // If slides are loaded, redirect to first slide with gist ID in URL
    if (slides.length > 0 && gistId) {
      navigate(`/presentation/${gistId}/1`, { replace: false });
    }
  }, [slides.length, gistId, navigate]);

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
        <Route path="/presentation/:gistId/:slideNumber" element={<GistSlideRoute />} />
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
