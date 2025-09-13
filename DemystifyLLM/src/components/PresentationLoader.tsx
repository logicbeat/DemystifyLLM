import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setGistUrl,
  setLoading,
  setError,
  setSlidesData,
} from "../store/slidesSlice";
import { loadSampleData } from "../utils/sampleData";
import { fetchGistContent, parseSlidesFromGist } from "../utils/gistFetcher";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const PresentationLoader: React.FC = () => {
  const [inputUrl, setInputUrl] = useState("");
  const dispatch = useAppDispatch();
  const { gistUrl, loading } = useAppSelector((state) => state.slides);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const slidesArray = await parseSlidesFromGist(gistData);
      
      // Sort slides by slideIndex to ensure proper order
      slidesArray.sort((a, b) => a.slideIndex - b.slideIndex);
      
      // Create presentation data with proper structure
      const presentationData = {
        slides: slidesArray,
        metadata: {
          title: gistData.description || "Untitled Presentation",
          description: gistData.description,
        }
      };
      
      // Store the slides data and Gist URL
      dispatch(setSlidesData(presentationData));
      dispatch(setGistUrl(inputUrl.trim()));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load presentation from Gist";
      dispatch(setError(errorMessage));
    }
  };

  const handleLoadDemo = async () => {
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
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Load Presentation from GitHub Gist
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gist-url" className="block text-sm font-medium mb-2">
            GitHub Gist URL
          </label>
          <div className="flex flex-row gap-2">
            <Input
              id="gist-url"
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://gist.github.com/..."
              disabled={loading.isLoading}
            />
            <Button type="submit" disabled={loading.isLoading}>
              {loading.isLoading ? "Loading..." : "Load Presentation"}
            </Button>
          </div>
        </div>

        <div className="text-center text-gray-500">or</div>
        <Button
          type="button"
          onClick={handleLoadDemo}
          disabled={loading.isLoading}
        >
          Load Demo Presentation
        </Button>
      </form>

      {loading.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {loading.error}
        </div>
      )}

      {gistUrl && !loading.error && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          Loaded Gist: {gistUrl}
        </div>
      )}
    </div>
  );
};

export default PresentationLoader;
