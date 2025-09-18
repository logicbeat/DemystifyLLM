import React, { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import "../styles/prism-github.css";
import type { Slide } from "../types";
import { fetchSlideContent } from "../utils/gistFetcher";
import { marked } from "../utils/markdownConfig";
import { extractTitle, processSlideMarkdown } from "../utils/markdownRenderer";

interface SlideViewerProps {
  slide?: Slide;
}

interface SlideContentState {
  content: string | { type: 'image'; url: string; filename?: string } | null;
  isLoading: boolean;
  error: string | null;
  title: string | null;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ slide }) => {
  const { slides, currentSlideIndex } = useAppSelector((state) => state.slides);
  const [contentState, setContentState] = useState<SlideContentState>({
    content: null,
    isLoading: false,
    error: null,
    title: null,
  });

  // Use the provided slide or fallback to current slide from store
  const currentSlide = slide || slides[currentSlideIndex];

  useEffect(() => {
    if (!currentSlide) return;

    const loadSlideContent = async () => {
      setContentState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const slideContent = await fetchSlideContent(
          currentSlide.slideContentGist
        );

        if (!slideContent) {
          throw new Error("No content received from the server");
        }

        // Handle different content types
        if (typeof slideContent === 'string') {
          // Markdown content
          const processedContent = processSlideMarkdown(slideContent);
          const extractedTitle = extractTitle(slideContent);

          setContentState({
            content: processedContent,
            isLoading: false,
            error: null,
            title: extractedTitle,
          });
        } else {
          // Image content
          setContentState({
            content: slideContent,
            isLoading: false,
            error: null,
            title: slideContent.filename || 'Image Slide',
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading the slide";

        setContentState({
          content: null,
          isLoading: false,
          error: errorMessage,
          title: null,
        });
      }
    };

    loadSlideContent();
  }, [currentSlide]);

  // Early return if no slide is available
  if (!currentSlide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            No Slide Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please load a presentation to view slides.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-3 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Slide Content Area */}
        <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-5 mb-6 transition-all duration-200 hover:shadow-xl min-h-[calc(100vh-70px)]">
          <div className="prose prose-lg max-w-none dark:prose-invert justify-center flex h-full">
            {contentState.isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Loading slide content...
                  </span>
                </div>
              </div>
            )}

            {contentState.error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 animate-shake">
                <div className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 text-2xl mr-3 flex-shrink-0">
                    ⚠️
                  </span>
                  <div>
                    <h3 className="text-red-800 dark:text-red-200 font-medium text-lg mb-2">
                      Failed to load slide content
                    </h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-3">
                      {contentState.error}
                    </p>
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

            {contentState.content &&
              !contentState.isLoading &&
              !contentState.error && (
                <div className="markdown-content animate-fade-in prose prose-lg max-w-none dark:prose-invert">
                  {typeof contentState.content === 'string' ? (
                    // Render markdown content
                    <div
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(contentState.content),
                      }}
                    />
                  ) : (
                    // Render image content
                    <div className="flex flex-col items-center justify-center h-full">
                      <img 
                        src={contentState.content.url}
                        alt={contentState.content.filename || 'Slide image'}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        style={{ maxHeight: 'calc(100vh - 200px)' }}
                        onError={(e) => {
                          console.error('Failed to load image:', contentState.content);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY3NzI4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      {contentState.content.filename && (
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                          {contentState.content.filename}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideViewer;