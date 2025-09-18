import React, { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import "../styles/prism-github.css";
import type { Slide } from "../types";
import { fetchMarkdownContent } from "../utils/gistFetcher";
import { marked } from "../utils/markdownConfig";
import { extractTitle, processSlideMarkdown } from "../utils/markdownRenderer";

interface SlideViewerProps {
  slide?: Slide;
}

interface SlideContentState {
  content: string | null;
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
        const markdownContent = await fetchMarkdownContent(
          currentSlide.slideContentGist
        );

        if (!markdownContent) {
          throw new Error("No content received from the server");
        }

        // Process the markdown and extract metadata
        const processedContent = processSlideMarkdown(markdownContent);
        const extractedTitle = extractTitle(markdownContent);

        setContentState({
          content: processedContent,
          isLoading: false,
          error: null,
          title: extractedTitle,
        });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Slide Content Area */}
        <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6 transition-all duration-200 hover:shadow-xl min-h-[calc(100vh-70px)]">
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
                <div
                  className="markdown-content animate-fade-in prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(contentState.content),
                  }}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideViewer;