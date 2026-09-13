import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'area[href]',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
].join(',');

/**
 * Keyboard focus trap + Escape handling + focus restore on deactivate.
 * `ref` must point at the dialog container element.
 */
export function useFocusTrap(ref, { active, onEscape, restoreFocus = true } = {}) {
  useEffect(() => {
    if (!active) return undefined;

    const node = ref.current;
    const previouslyFocused = document.activeElement;

    const getFocusable = () => {
      if (!node) return [];
      return Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    };

    const focusFirst = () => {
      const els = getFocusable();
      if (els.length > 0) els[0].focus();
      else node?.focus?.();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = getFocusable();
      if (els.length === 0) {
        e.preventDefault();
        return;
      }
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const raf = requestAnimationFrame(focusFirst);
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown, true);
      if (restoreFocus && previouslyFocused?.focus) {
        previouslyFocused.focus();
      }
    };
  }, [active, onEscape, restoreFocus, ref]);
}