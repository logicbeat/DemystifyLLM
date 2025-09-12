import React from 'react';
import { useAppSelector } from '../app/hooks';
import type { Slide } from '../types';

interface SlideViewerProps {
  slide?: Slide;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ slide }) => {
  const { slides, currentSlideIndex } = useAppSelector(state => state.slides);
  
  // Use prop slide or current slide from state
  const currentSlide = slide || slides[currentSlideIndex];

  if (!currentSlide) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            No Slide Content Available
          </h2>
          <p className="text-gray-500">
            Please load a presentation to view slides.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Slide Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Slide {currentSlide.slideIndex}
          </h1>
          <div className="h-1 bg-blue-500 w-16 rounded"></div>
        </div>

        {/* Slide Content Area */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="prose max-w-none">
            {/* Placeholder for markdown content - will be implemented in Phase 2 */}
            <div className="text-gray-600 italic">
              Content from: {currentSlide.slideContentGist}
            </div>
            <p className="mt-4">
              This is a placeholder for the markdown content that will be fetched and rendered in Phase 2.
            </p>
          </div>
        </div>

        {/* Lab Section */}
        {currentSlide.slideLabUrl && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Interactive Lab</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              {/* Placeholder for iframe - will be implemented in Phase 4 */}
              <div className="p-8 text-center text-gray-600 bg-gray-100">
                <div className="text-lg mb-2">📚 Lab Content</div>
                <div className="text-sm">
                  Lab URL: {currentSlide.slideLabUrl}
                </div>
                <p className="mt-2 text-xs">
                  Interactive labs will be rendered as iframes in Phase 4
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideViewer;