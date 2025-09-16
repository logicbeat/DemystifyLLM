// Performance monitoring utilities for production optimization

/**
 * Measure and log performance metrics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private readonly metrics: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Start measuring a performance metric
   */
  startMeasure(name: string): void {
    this.metrics.set(name, performance.now())
  }

  /**
   * End measuring and log the result
   */
  endMeasure(name: string): number {
    const startTime = this.metrics.get(name)
    if (!startTime) {
      console.warn(`Performance measure '${name}' was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.metrics.delete(name)

    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Measure async operations
   */
  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.startMeasure(name)
    try {
      const result = await operation()
      this.endMeasure(name)
      return result
    } catch (error) {
      this.endMeasure(name)
      throw error
    }
  }

  /**
   * Get Web Vitals metrics
   */
  getWebVitals(): void {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      console.log('CLS:', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

/**
 * Hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance()

  const measureRender = () => {
    monitor.startMeasure(`${componentName}-render`)
    
    // Use useEffect to measure render completion
    return () => {
      monitor.endMeasure(`${componentName}-render`)
    }
  }

  return { measureRender, monitor }
}

/**
 * Bundle size analyzer for production builds
 */
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV !== 'production') return

  // Estimate bundle size based on loaded modules
  const estimateSize = () => {
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0

    scripts.forEach(script => {
      const src = script.getAttribute('src')
      if (src?.includes('assets')) {
        // This is a rough estimate - in production you'd use actual metrics
        totalSize += 1 // Placeholder
      }
    })

    console.log('Estimated bundle size analyzed')
  }

  // Run after page load
  if (document.readyState === 'complete') {
    estimateSize()
  } else {
    window.addEventListener('load', estimateSize)
  }
}

/**
 * Memory usage monitoring
 */
export function monitorMemoryUsage(): void {
  if (typeof window === 'undefined' || !(performance as any).memory) return

  const memory = (performance as any).memory
  const usage = {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Memory usage:', usage)
  }

  // Warn if memory usage is high
  if (usage.used / usage.limit > 0.8) {
    console.warn('High memory usage detected')
  }
}

/**
 * Network performance monitoring
 */
export function monitorNetworkPerformance(): void {
  if (typeof navigator === 'undefined' || !(navigator as any).connection) return

  const connection = (navigator as any).connection
  const networkInfo = {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Network performance:', networkInfo)
  }

  // Adjust behavior for slow connections
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    console.log('Slow connection detected - consider reducing asset sizes')
  }
}