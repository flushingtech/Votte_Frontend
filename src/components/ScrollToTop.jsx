import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router preserves scroll position across navigations by default.
// This resets it to the top on every route change.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
