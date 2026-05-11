// Performance monitoring utility
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Measure FCP
  const measureFCP = () => {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      console.log('FCP:', fcpEntry.startTime.toFixed(2), 'ms');
    }
  };

  // Measure LCP
  const measureLCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime, 'ms');
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported
    }
  };

  // Measure CLS
  const measureCLS = () => {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log('CLS:', clsValue.toFixed(4));
        }
      }
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // CLS not supported
    }
  };

  // Measure FID (First Input Delay)
  const measureFID = () => {
    const observer = new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      const fid = firstInput.processingStart - firstInput.startTime;
      console.log('FID:', fid.toFixed(2), 'ms');
    });

    try {
      observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // FID not supported
    }
  };

  // Run all measurements
  if (document.readyState === 'complete') {
    measureFCP();
    measureLCP();
    measureCLS();
    measureFID();
  } else {
    window.addEventListener('load', () => {
      measureFCP();
      measureLCP();
      measureCLS();
      measureFID();
    });
  }
};

// Report to analytics (optional)
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(() => {
      // web-vitals not installed
      measureWebVitals();
    });
  } else {
    measureWebVitals();
  }
};
