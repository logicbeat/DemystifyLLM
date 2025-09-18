import React, { useState, useEffect } from "react";
import { getCacheStats, clearGistCache } from "../utils/gistFetcher";
import { Button } from "./ui/button";

interface CacheDebuggerProps {
  isVisible?: boolean;
}

const CacheDebugger: React.FC<CacheDebuggerProps> = ({ isVisible = false }) => {
  const [stats, setStats] = useState({ totalCachedGists: 0, cacheKeys: [] as string[] });
  
  const refreshStats = () => {
    setStats(getCacheStats());
  };

  const clearAllCache = () => {
    clearGistCache();
    refreshStats();
  };

  useEffect(() => {
    if (isVisible) {
      refreshStats();
      const interval = setInterval(refreshStats, 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 max-w-xs">
      <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
        🗄️ Cache Debug Info
      </h4>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div>Cached Gists: {stats.totalCachedGists}</div>
        {stats.cacheKeys.length > 0 && (
          <div>
            <div className="font-medium">Gist IDs:</div>
            {stats.cacheKeys.map((gistId) => (
              <div key={gistId} className="truncate ml-2">
                {gistId.substring(0, 8)}...
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          onClick={refreshStats}
          size="sm"
          variant="outline"
          className="text-xs px-2 py-1"
        >
          Refresh
        </Button>
        <Button
          onClick={clearAllCache}
          size="sm"
          variant="outline"
          className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default CacheDebugger;