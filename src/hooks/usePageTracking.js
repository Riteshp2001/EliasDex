import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-comic.antidonasi.web.id';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await axios.post(`${API_URL}/api/track`, {
          pagePath: location.pathname,
          pageTitle: document.title,
          referrer: document.referrer
        });
      } catch (error) {
        // Silently fail - don't block the app if tracking fails
        console.debug('Page tracking failed:', error.message);
      }
    };

    // Track after a small delay to ensure page is loaded
    const timer = setTimeout(trackPageView, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);
};

export default usePageTracking;
