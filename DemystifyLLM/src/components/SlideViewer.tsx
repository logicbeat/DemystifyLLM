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
    <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b-2 border-blue-200 dark:border-blue-800 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-300">
      {children}
    </h3>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400">
        {children}
      </code>
    ) : (
      <code className={className}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 p-4 rounded-lg overflow-x-auto mb-4 border dark:border-gray-700">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 dark:border-blue-600 pl-4 italic text-gray-700 dark:text-gray-400 my-4 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-md">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  a: ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200"
    >
      {children}
    </a>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </p>
  ),
};

// Lab Viewer Component for iframe rendering
interface LabViewerProps {
  labUrl: string;
  slideIndex: number;
}

interface LabState {
  isLoading: boolean;
  hasError: boolean;
  isMinimized: boolean;
}

const LabViewer: React.FC<LabViewerProps> = ({ labUrl, slideIndex }) => {
  const [labState, setLabState] = useState<LabState>({
    isLoading: true,
    hasError: false,
    isMinimized: false,
  });

  // Validate and sanitize lab URL
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleIframeLoad = () => {
    setLabState(prev => ({ ...prev, isLoading: false, hasError: false }));
  };

  const handleIframeError = () => {
    setLabState(prev => ({ ...prev, isLoading: false, hasError: true }));
  };

  const toggleMinimize = () => {
    setLabState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  if (!isValidUrl(labUrl)) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">
          ⚠️ Invalid Lab URL
        </h3>
        <p className="text-red-600 dark:text-red-300 text-sm">
          The lab URL is not valid or uses an unsupported protocol. Only HTTP and HTTPS URLs are allowed.
        </p>
        <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-mono break-all">
          {labUrl}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-6 transition-all duration-300 ${
      labState.isMinimized ? 'pb-6' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          🧪 Interactive Lab
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMinimize}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label={labState.isMinimized ? 'Expand lab' : 'Minimize lab'}
            title={labState.isMinimized ? 'Expand lab' : 'Minimize lab'}
          >
            {labState.isMinimized ? '🔼' : '🔽'}
          </button>
          <a
            href={labUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
            aria-label="Open lab in new tab"
            title="Open lab in new tab"
          >
            🔗
          </a>
        </div>
      </div>

      {!labState.isMinimized && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg overflow-hidden relative">
          {labState.isLoading && (
            <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading lab...</p>
              </div>
            </div>
          )}
          
          {labState.hasError ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">😞</div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Failed to Load Lab
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                The lab content could not be loaded. This might be due to:
              </p>
              <ul className="text-gray-600 dark:text-gray-400 text-xs text-left max-w-md mx-auto space-y-1">
                <li>• The lab server is down or unreachable</li>
                <li>• The lab URL has changed or is incorrect</li>
                <li>• The lab doesn't allow iframe embedding</li>
                <li>• Your network connection is having issues</li>
              </ul>
              <button
                onClick={() => setLabState(prev => ({ ...prev, isLoading: true, hasError: false }))}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
              >
                Try Again
              </button>
            </div>
          ) : (
            <iframe
              src={labUrl}
              className="w-full h-96 md:h-[500px] border-0"
              title={`Interactive Lab for Slide ${slideIndex}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              loading="lazy"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
          
          {/* Lab URL display */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              <span className="font-medium">Lab URL:</span> {labUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
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
    <div className="flex-1 p-4 md:p-8 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Slide Header
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {contentState.title || `Slide ${currentSlide.slideIndex}`}
          </h1>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 w-16 rounded-full"></div>
        </div> */}

        {/* Slide Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6 transition-all duration-200 hover:shadow-xl">
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {contentState.isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Loading slide content...</span>
                </div>
              </div>
            )}
            
            {contentState.error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 animate-shake">
                <div className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 text-2xl mr-3 flex-shrink-0">⚠️</span>
                  <div>
                    <h3 className="text-red-800 dark:text-red-200 font-medium text-lg mb-2">Failed to load slide content</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-3">{contentState.error}</p>
                    <details className="mt-3">
                      <summary className="text-gray-600 dark:text-gray-400 text-xs cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                        Technical Details
                      </summary>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-2 font-mono break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        Content URL: {currentSlide.slideContentGist}
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            )}
            
            {contentState.content && !contentState.isLoading && !contentState.error && (
              <div className="markdown-content animate-fade-in">
                <ReactMarkdown components={markdownComponents}>
                  {contentState.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {/* Lab Section */}
        {currentSlide.slideLabUrl && (
          <LabViewer 
            labUrl={currentSlide.slideLabUrl} 
            slideIndex={currentSlide.slideIndex}
          />
        )}
      </div>
    </div>
  );
};

export default SlideViewer;