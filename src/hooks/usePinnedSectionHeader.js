import { useEffect, useRef, useState } from 'react';

export const APP_SCROLL_ID = 'app-scroll';

function getScrollRoot() {
  return document.getElementById(APP_SCROLL_ID);
}

/**
 * Pins a section header while its body scrolls, then releases at the section end.
 * Uses position:fixed as a fallback when CSS sticky cannot see a scroll container
 * (e.g. parent page scrolls an iframe as one block).
 */
export function usePinnedSectionHeader(enabled) {
  const sectionRef = useRef(null);
  const sentinelRef = useRef(null);
  const [pinned, setPinned] = useState(false);
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setPinned(false);
      setLayout(null);
      return;
    }

    const section = sectionRef.current;
    const sentinel = sentinelRef.current;
    if (!section || !sentinel) return;

    const update = () => {
      const scrollRoot = getScrollRoot();
      const rootTop = scrollRoot ? scrollRoot.getBoundingClientRect().top : 0;
      const sectionRect = section.getBoundingClientRect();
      const sentinelRect = sentinel.getBoundingClientRect();
      const shouldPin = sentinelRect.top < rootTop && sectionRect.bottom > rootTop + 8;

      setPinned(shouldPin);
      setLayout(shouldPin ? { top: rootTop, left: sectionRect.left, width: sectionRect.width } : null);
    };

    const scrollTarget = getScrollRoot() ?? window;
    scrollTarget.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    return () => {
      scrollTarget.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  return { sectionRef, sentinelRef, pinned, layout };
}
