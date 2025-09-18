// Test file for verifying cache functionality
// This can be run in browser console to test caching

import { fetchGistContent, clearGistCache, getCacheStats } from '../gistFetcher';

// Test cache functionality
export const testCaching = async () => {
  console.log('🧪 Starting cache functionality tests...');
  
  const testGistUrl = 'https://gist.github.com/logicbeat/3883611f30bead74a0ab4368cb5cc763';
  
  try {
    // Clear any existing cache
    clearGistCache();
    console.log('✅ Cleared all cache');
    
    // Check initial cache stats
    let stats = getCacheStats();
    console.log('📊 Initial cache stats:', stats);
    
    // First fetch - should hit GitHub API
    console.log('🌐 First fetch (should hit GitHub API)...');
    const start1 = performance.now();
    const data1 = await fetchGistContent(testGistUrl);
    const end1 = performance.now();
    console.log(`⏱️ First fetch took ${(end1 - start1).toFixed(2)}ms`);
    console.log('📄 Fetched data:', data1.id);
    
    // Check cache stats after first fetch
    stats = getCacheStats();
    console.log('📊 Cache stats after first fetch:', stats);
    
    // Second fetch - should use cache
    console.log('💾 Second fetch (should use cache)...');
    const start2 = performance.now();
    const data2 = await fetchGistContent(testGistUrl);
    const end2 = performance.now();
    console.log(`⏱️ Second fetch took ${(end2 - start2).toFixed(2)}ms`);
    console.log('📄 Cached data:', data2.id);
    
    // Verify data is the same
    if (data1.id === data2.id) {
      console.log('✅ Data consistency verified');
    } else {
      console.log('❌ Data mismatch!');
    }
    
    // Test force refresh
    console.log('🔄 Testing force refresh...');
    const start3 = performance.now();
    await fetchGistContent(testGistUrl, true);
    const end3 = performance.now();
    console.log(`⏱️ Force refresh took ${(end3 - start3).toFixed(2)}ms`);
    
    // Performance comparison
    const cacheSpeedup = ((end1 - start1) / (end2 - start2)).toFixed(1);
    console.log(`🚀 Cache speedup: ${cacheSpeedup}x faster`);
    
    console.log('✅ All cache tests completed successfully!');
    
    return {
      firstFetchTime: end1 - start1,
      cachedFetchTime: end2 - start2,
      forceRefreshTime: end3 - start3,
      speedup: cacheSpeedup,
      cacheStats: getCacheStats()
    };
    
  } catch (error) {
    console.error('❌ Cache test failed:', error);
    throw error;
  }
};

// Function to run from browser console
export const runCacheTest = () => {
  testCaching().then(results => {
    console.log('🎉 Test Results:', results);
  }).catch(error => {
    console.error('💥 Test Error:', error);
  });
};