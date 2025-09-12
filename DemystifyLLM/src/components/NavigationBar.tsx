import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { 
  nextSlide, 
  previousSlide, 
  firstSlide, 
  lastSlide,
  setCurrentSlide 
} from '../store/slidesSlice';

const NavigationBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { slides, currentSlideIndex } = useAppSelector(state => state.slides);
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

  // Position-based styling
  const getPositionClasses = () => {
    const baseClasses = "fixed bg-white border shadow-lg p-4 z-50";
    
    switch (controlBarPosition) {
      case 'top':
        return `${baseClasses} top-0 left-0 right-0 border-b flex items-center justify-center`;
      case 'bottom':
        return `${baseClasses} bottom-0 left-0 right-0 border-t flex items-center justify-center`;
      case 'left':
        return `${baseClasses} left-0 top-0 bottom-0 border-r flex flex-col items-center justify-center`;
      case 'right':
        return `${baseClasses} right-0 top-0 bottom-0 border-l flex flex-col items-center justify-center`;
      default:
        return `${baseClasses} bottom-0 left-0 right-0 border-t flex items-center justify-center`;
    }
  };

  const getButtonClasses = (disabled: boolean = false) => {
    return `px-3 py-2 rounded-md border ${
      disabled 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
        : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
          <span className="text-sm font-medium text-gray-700">
            {currentSlideIndex + 1} of {totalSlides}
          </span>
          
          {/* Quick slide selector for small presentations */}
          {totalSlides <= 10 && (
            <select
              value={currentSlideIndex}
              onChange={(e) => handleSlideSelect(parseInt(e.target.value))}
              className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      </div>
    </nav>
  );
};

export default NavigationBar;