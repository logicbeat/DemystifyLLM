import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setGistUrl, setLoading, setError, setSlidesData } from '../store/slidesSlice';
import { loadSampleData } from '../utils/sampleData';

const PresentationLoader: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const dispatch = useAppDispatch();
  const { gistUrl, loading } = useAppSelector(state => state.slides);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      dispatch(setError('Please enter a valid GitHub Gist URL'));
      return;
    }

    // Basic URL validation
    try {
      new URL(inputUrl);
    } catch {
      dispatch(setError('Please enter a valid URL'));
      return;
    }

    dispatch(setGistUrl(inputUrl.trim()));
    dispatch(setLoading(true));
    // TODO: Implement actual Gist fetching in Phase 2
  };

  const handleLoadDemo = async () => {
    dispatch(setLoading(true));
    try {
      const sampleData = await loadSampleData();
      dispatch(setSlidesData(sampleData));
      dispatch(setGistUrl('demo://sample-presentation'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load demo data';
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
          <input
            id="gist-url"
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://gist.github.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading.isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={loading.isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.isLoading ? 'Loading...' : 'Load Presentation'}
        </button>

        <div className="text-center text-gray-500">or</div>

        <button
          type="button"
          onClick={handleLoadDemo}
          disabled={loading.isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load Demo Presentation
        </button>
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