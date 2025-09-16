import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { 
  nextSlide, 
  previousSlide, 
  firstSlide, 
  lastSlide,
  setCurrentSlide 
} from '../store/slidesSlice';
import { shareUrl, getSlideUrl } from '../utils/urlUtils';

interface NavigationBarProps {
  onSettingsOpen?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onSettingsOpen }) => {
  const dispatch = useAppDispatch();
  const { slides, currentSlideIndex, gistId } = useAppSelector(state => state.slides);
  const { controlBarPosition, wrapNavigation } = useAppSelector(state => state.preferences);

  const totalSlides = slides.length;
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === totalSlides - 1;

  const handlePrevious = () => {
    if (!isFirstSlide) {
      dispatch(previousSlide());
    } else if (wrapNavigation && totalSlides > 0) {
      dispatch(lastSlide());
    }
  };

  const handleNext = () => {
    if (!isLastSlide) {
      dispatch(nextSlide());
    } else if (wrapNavigation && totalSlides > 0) {
      dispatch(firstSlide());
    }
  };

  const handleSlideSelect = (slideIndex: number) => {
    dispatch(setCurrentSlide(slideIndex));
  };

  const handleShare = async () => {
    const slideUrl = getSlideUrl(currentSlideIndex + 1, gistId || undefined);
    const title = `Slide ${currentSlideIndex + 1} - Interactive Presentation`;
    await shareUrl(slideUrl, title);
  };

  // Position-based styling
  const getPositionClasses = () => {
    const baseClasses = "fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-4 z-50 transition-all duration-200";
    
    switch (controlBarPosition) {
      case 'top':
        return `${baseClasses} top-0 left-0 right-0 border-b border-t-0 border-l-0 border-r-0 flex items-center justify-center backdrop-blur-sm bg-white/95 dark:bg-gray-800/95`;
      case 'bottom':
        return `${baseClasses} bottom-0 left-0 right-0 border-t border-b-0 border-l-0 border-r-0 flex items-center justify-center backdrop-blur-sm bg-white/95 dark:bg-gray-800/95`;
      case 'left':
        return `${baseClasses} left-0 top-0 bottom-0 border-r border-l-0 border-t-0 border-b-0 flex flex-col items-center justify-center backdrop-blur-sm bg-white/95 dark:bg-gray-800/95`;
      case 'right':
        return `${baseClasses} right-0 top-0 bottom-0 border-l border-r-0 border-t-0 border-b-0 flex flex-col items-center justify-center backdrop-blur-sm bg-white/95 dark:bg-gray-800/95`;
      default:
        return `${baseClasses} bottom-0 left-0 right-0 border-t border-b-0 border-l-0 border-r-0 flex items-center justify-center backdrop-blur-sm bg-white/95 dark:bg-gray-800/95`;
    }
  };

  const getButtonClasses = (disabled: boolean = false) => {
    return `px-3 py-2 rounded-lg border transition-all duration-200 transform hover:scale-105 active:scale-95 ${
      disabled 
        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600' 
        : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 border-blue-600 dark:border-blue-700 shadow-md hover:shadow-lg'
    }`;
  };

  const isVertical = controlBarPosition === 'left' || controlBarPosition === 'right';

  if (totalSlides === 0) {
    return null;
  }

  return (
    <nav className={getPositionClasses()}>
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-3`}>
        {/* First Slide Button */}
        <button
          onClick={() => dispatch(firstSlide())}
          disabled={isFirstSlide && !wrapNavigation}
          className={getButtonClasses(isFirstSlide && !wrapNavigation)}
          title="First slide"
          aria-label="Go to first slide"
        >
          ⏮️
        </button>

        {/* Previous Slide Button */}
        <button
          onClick={handlePrevious}
          disabled={isFirstSlide && !wrapNavigation}
          className={getButtonClasses(isFirstSlide && !wrapNavigation)}
          title="Previous slide"
          aria-label="Go to previous slide"
        >
          ⏪
        </button>

        {/* Slide Counter and Quick Navigation */}
        <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-2`}>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
            {currentSlideIndex + 1} of {totalSlides}
          </span>
          
          {/* Quick slide selector for small presentations */}
          {totalSlides <= 10 && (
            <select
              value={currentSlideIndex}
              onChange={(e) => handleSlideSelect(parseInt(e.target.value))}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              aria-label="Select slide"
            >
              {slides.map((slide, index) => (
                <option key={`slide-${slide.slideIndex}`} value={index}>
                  Slide {index + 1}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Next Slide Button */}
        <button
          onClick={handleNext}
          disabled={isLastSlide && !wrapNavigation}
          className={getButtonClasses(isLastSlide && !wrapNavigation)}
          title="Next slide"
          aria-label="Go to next slide"
        >
          ⏩
        </button>

        {/* Last Slide Button */}
        <button
          onClick={() => dispatch(lastSlide())}
          disabled={isLastSlide && !wrapNavigation}
          className={getButtonClasses(isLastSlide && !wrapNavigation)}
          title="Last slide"
          aria-label="Go to last slide"
        >
          ⏭️
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Share current slide"
          aria-label="Share current slide"
        >
          🔗
        </button>

        {/* Settings Button */}
        <button
          onClick={onSettingsOpen}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
          title="Open settings"
          aria-label="Open settings"
        >
          ⚙️
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;