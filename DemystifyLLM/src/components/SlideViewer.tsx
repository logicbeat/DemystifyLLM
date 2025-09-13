import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { useAppSelector } from '../app/hooks';
import { fetchMarkdownContent } from '../utils/gistFetcher';
import { processSlideMarkdown, extractTitle } from '../utils/markdownRenderer';
import type { Slide } from '../types';

interface SlideViewerProps {
  slide?: Slide;
}

interface SlideContentState {
  content: string | null;
  isLoading: boolean;
  error: string | null;
  title: string | null;
}

// Markdown component customizations
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-blue-200 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-medium mb-3 text-gray-700">
      {children}
    </h3>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600">
        {children}
      </code>
    ) : (
      <code className={className}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700 my-4">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2">
      {children}
    </ol>
  ),
  a: ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  ),
};

const SlideViewer: React.FC<SlideViewerProps> = ({ slide }) => {
  const { slides, currentSlideIndex } = useAppSelector(state => state.slides);
  const [contentState, setContentState] = useState<SlideContentState>({
    content: null,
    isLoading: false,
    error: null,
    title: null,
  });
  
  // Use prop slide or current slide from state
  const currentSlide = slide || slides[currentSlideIndex];

  // Load markdown content when slide changes
  useEffect(() => {
    if (!currentSlide) {
      setContentState({ content: null, isLoading: false, error: null, title: null });
      return;
    }

    const loadSlideContent = async () => {
      setContentState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const rawContent = await fetchMarkdownContent(currentSlide.slideContentGist);
        const processedContent = processSlideMarkdown(rawContent);
        const slideTitle = extractTitle(rawContent);
        
        setContentState({
          content: processedContent,
          isLoading: false,
          error: null,
          title: slideTitle,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load slide content';
        setContentState({
          content: null,
          isLoading: false,
          error: errorMessage,
          title: null,
        });
      }
    };

    loadSlideContent();
  }, [currentSlide?.slideContentGist, currentSlide]);

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
            {contentState.title || `Slide ${currentSlide.slideIndex}`}
          </h1>
          <div className="h-1 bg-blue-500 w-16 rounded"></div>
        </div>

        {/* Slide Content Area */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="prose max-w-none">
            {contentState.isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading slide content...</span>
              </div>
            )}
            
            {contentState.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-600 text-lg mr-2">⚠️</span>
                  <div>
                    <h3 className="text-red-800 font-medium">Failed to load slide content</h3>
                    <p className="text-red-600 text-sm mt-1">{contentState.error}</p>
                    <p className="text-gray-600 text-xs mt-2">
                      Content URL: {currentSlide.slideContentGist}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {contentState.content && !contentState.isLoading && !contentState.error && (
              <div className="markdown-content">
                <ReactMarkdown components={markdownComponents}>
                  {contentState.content}
                </ReactMarkdown>
              </div>
            )}
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