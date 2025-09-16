import React, { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setError,
  setGistUrl,
  setLoading,
  setSlidesData,
} from "../store/slidesSlice";
import { fetchGistContent, parseSlidesFromGist } from "../utils/gistFetcher";
import { loadSampleData } from "../utils/sampleData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const PresentationLoader: React.FC = () => {
  const [inputUrl, setInputUrl] = useState("");
  const dispatch = useAppDispatch();
  const { gistUrl, loading } = useAppSelector((state) => state.slides);

  // Memoize handleSubmit to prevent unnecessary re-creations
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputUrl.trim()) {
        dispatch(setError("Please enter a valid GitHub Gist URL"));
        return;
      }

      // Basic URL validation
      try {
        new URL(inputUrl);
      } catch {
        dispatch(setError("Please enter a valid URL"));
        return;
      }

      dispatch(setLoading(true));

      try {
        // Fetch Gist content
        const gistData = await fetchGistContent(inputUrl.trim());

        // Parse slides from Gist
        const [slidesArray, metadata] = await parseSlidesFromGist(gistData);

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

        // Store the slides data and Gist URL
        dispatch(setSlidesData(presentationData));
        dispatch(setGistUrl(inputUrl.trim()));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load presentation from Gist";
        dispatch(setError(errorMessage));
      }
    },
    [inputUrl, dispatch]
  );

  // Memoize handleLoadDemo to prevent unnecessary re-creations
  const handleLoadDemo = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const sampleData = await loadSampleData();
      dispatch(setSlidesData(sampleData));
      dispatch(setGistUrl("demo://sample-presentation"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load demo data";
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);

  // Memoize inputUrl change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputUrl(e.target.value);
    },
    []
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          📚 Load Interactive Presentation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Load a presentation from GitHub Gist or try our demo with interactive
          labs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="gist-url"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            GitHub Gist URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                id="gist-url"
                type="url"
                value={inputUrl}
                onChange={handleInputChange}
                placeholder="https://gist.github.com/username/your-gist-id"
                disabled={loading.isLoading}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <Button
              type="submit"
              disabled={loading.isLoading || !inputUrl.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading.isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </span>
              ) : (
                "Load Presentation"
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter a public GitHub Gist URL containing presentation data
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              or
            </span>
          </div>
        </div>

        <div className="text-center">
          <Button
            type="button"
            onClick={handleLoadDemo}
            disabled={loading.isLoading}
            variant="outline"
            className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            🚀 Try Demo with Interactive Labs
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Experience the full feature set including iframe labs
          </p>
        </div>
      </form>

      {/* Enhanced Error Display */}
      {loading.error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg animate-shake">
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-lg mr-3 flex-shrink-0">
              ⚠️
            </span>
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                Failed to Load Presentation
              </h4>
              <p className="text-sm">{loading.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Success Display */}
      {gistUrl && !loading.error && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg animate-fade-in">
          <div className="flex items-start">
            <span className="text-green-600 dark:text-green-400 text-lg mr-3 flex-shrink-0">
              ✅
            </span>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                Presentation Loaded Successfully!
              </h4>
              <p className="text-sm break-all">Source: {gistUrl}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State Overlay */}
      {loading.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl animate-fade-in">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Loading Presentation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Fetching and processing slide content...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationLoader;
