'use client';

import { useEffect, useRef } from 'react';

interface MobileTouchScrollOptions {
  isRotated: boolean;
  scale: number;
  enabled?: boolean;
}

/**
 * Universal Mobile Touch Scrolling Engine for scaled and rotated Web OS environments.
 * Natively, mobile browsers (WebKit & Blink) break touch scrolling when ancestors
 * have CSS transform: rotate(...) or transform: scale(...).
 * This hook translates touch gestures accurately across rotation and scale transforms
 * with natural deceleration momentum.
 */
export function useMobileTouchScroll({ isRotated, scale, enabled = true }: MobileTouchScrollOptions) {
  const optionsRef = useRef({ isRotated, scale, enabled });

  useEffect(() => {
    optionsRef.current = { isRotated, scale, enabled };
  }, [isRotated, scale, enabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let targetEl: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityY = 0;
    let velocityX = 0;
    let isScrolling = false;
    let momentumRaf: number | null = null;

    const cancelMomentum = () => {
      if (momentumRaf !== null) {
        cancelAnimationFrame(momentumRaf);
        momentumRaf = null;
      }
    };

    const findScrollable = (element: HTMLElement | null): HTMLElement | null => {
      let curr: HTMLElement | null = element;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        // Do not intercept title bar dragging or window control buttons
        if (
          curr.classList.contains('cursor-move') ||
          curr.closest('.cursor-move') ||
          curr.classList.contains('retro-titlebar') ||
          curr.closest('.retro-titlebar') ||
          curr.classList.contains('retro-window-btn') ||
          curr.closest('.retro-window-btn')
        ) {
          return null;
        }

        // Do not intercept form inputs, selects, textareas, sliders, or drawing canvas
        if (['INPUT', 'TEXTAREA', 'SELECT', 'CANVAS'].includes(curr.tagName)) {
          return null;
        }

        if (curr.getAttribute('data-no-touch-scroll') === 'true') {
          return null;
        }

        const style = window.getComputedStyle(curr);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;

        const hasScrollY =
          (overflowY === 'auto' || overflowY === 'scroll') &&
          curr.scrollHeight > curr.clientHeight + 2;

        const hasScrollX =
          (overflowX === 'auto' || overflowX === 'scroll') &&
          curr.scrollWidth > curr.clientWidth + 2;

        if (hasScrollY || hasScrollX) {
          return curr;
        }

        curr = curr.parentElement;
      }
      return null;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!optionsRef.current.enabled || e.touches.length !== 1) return;
      cancelMomentum();

      const touch = e.touches[0];
      const found = findScrollable(e.target as HTMLElement);
      if (!found) {
        targetEl = null;
        return;
      }

      targetEl = found;
      startX = touch.clientX;
      startY = touch.clientY;
      lastX = touch.clientX;
      lastY = touch.clientY;
      lastTime = performance.now();
      velocityY = 0;
      velocityX = 0;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!targetEl || !optionsRef.current.enabled || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const totalDx = touch.clientX - startX;
      const totalDy = touch.clientY - startY;

      if (!isScrolling) {
        // Require at least 6px movement before claiming touch scroll gesture
        if (Math.hypot(totalDx, totalDy) > 6) {
          isScrolling = true;
        } else {
          return;
        }
      }

      const screenDx = touch.clientX - lastX;
      const screenDy = touch.clientY - lastY;
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      lastX = touch.clientX;
      lastY = touch.clientY;
      lastTime = now;

      const currentScale = optionsRef.current.scale || 1;
      const currentlyRotated = optionsRef.current.isRotated;

      let scrollDeltaY = 0;
      let scrollDeltaX = 0;

      if (currentlyRotated) {
        // Desktop is rotated 90deg clockwise.
        // User moves thumb along phone screen:
        // A swipe along the phone's physical Y or X maps to scrolling the vertical content
        if (Math.abs(screenDx) >= Math.abs(screenDy)) {
          scrollDeltaY = -screenDx / currentScale;
        } else {
          scrollDeltaY = -screenDy / currentScale;
        }
      } else {
        scrollDeltaY = -screenDy / currentScale;
        scrollDeltaX = -screenDx / currentScale;
      }

      const canScrollY = targetEl.scrollHeight > targetEl.clientHeight;
      const canScrollX = targetEl.scrollWidth > targetEl.clientWidth;

      let didScroll = false;

      if (canScrollY && scrollDeltaY !== 0) {
        const prev = targetEl.scrollTop;
        targetEl.scrollTop += scrollDeltaY;
        if (targetEl.scrollTop !== prev) {
          didScroll = true;
          velocityY = 0.7 * velocityY + 0.3 * (scrollDeltaY / dt);
        }
      }

      if (canScrollX && scrollDeltaX !== 0) {
        const prev = targetEl.scrollLeft;
        targetEl.scrollLeft += scrollDeltaX;
        if (targetEl.scrollLeft !== prev) {
          didScroll = true;
          velocityX = 0.7 * velocityX + 0.3 * (scrollDeltaX / dt);
        }
      }

      if (didScroll && e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (!targetEl || !isScrolling) {
        targetEl = null;
        isScrolling = false;
        return;
      }

      const activeTarget = targetEl;
      let vY = velocityY;
      let vX = velocityX;
      targetEl = null;
      isScrolling = false;

      // Clamp initial flick velocity
      const maxV = 2.5;
      vY = Math.max(-maxV, Math.min(maxV, vY));
      vX = Math.max(-maxV, Math.min(maxV, vX));

      if (Math.abs(vY) > 0.05 || Math.abs(vX) > 0.05) {
        let lastFrame = performance.now();
        const friction = 0.94; // Natural smooth deceleration

        const momentumStep = (now: number) => {
          const frameDt = Math.min(32, now - lastFrame);
          lastFrame = now;
          const factor = frameDt / 16.67;

          let moved = false;

          if (Math.abs(vY) > 0.01 && activeTarget.scrollHeight > activeTarget.clientHeight) {
            const prev = activeTarget.scrollTop;
            activeTarget.scrollTop += vY * 16 * factor;
            if (activeTarget.scrollTop !== prev) {
              moved = true;
            } else {
              vY = 0; // Hit top or bottom boundary
            }
            vY *= Math.pow(friction, factor);
          } else {
            vY = 0;
          }

          if (Math.abs(vX) > 0.01 && activeTarget.scrollWidth > activeTarget.clientWidth) {
            const prev = activeTarget.scrollLeft;
            activeTarget.scrollLeft += vX * 16 * factor;
            if (activeTarget.scrollLeft !== prev) {
              moved = true;
            } else {
              vX = 0;
            }
            vX *= Math.pow(friction, factor);
          } else {
            vX = 0;
          }

          if (moved && (Math.abs(vY) > 0.01 || Math.abs(vX) > 0.01)) {
            momentumRaf = requestAnimationFrame(momentumStep);
          } else {
            momentumRaf = null;
          }
        };

        momentumRaf = requestAnimationFrame(momentumStep);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      cancelMomentum();
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);
}
