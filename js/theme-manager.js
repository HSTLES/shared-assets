/**
 * HSTLES Theme Manager
 * Handles light/dark/system theme switching with localStorage persistence
 */
(function() {
  const storageKey = 'theme';
  const classDark = 'dark';

  // 1. Helpers for storage (silent on errors)
  function getStored() {
    try { return localStorage.getItem(storageKey); }
    catch { return null; }
  }
  function setStored(val) {
    try { localStorage.setItem(storageKey, val); }
    catch { /* no-op */ }
  }

  // 2. Determine initial "mode" (light|dark|system)
  function detectMode() {
    const stored = getStored();
    if (stored) return stored;
    const attr = document.documentElement.getAttribute('data-theme-mode');
    if (attr) return attr;
    return 'dark';        // your default
  }

  // 3. Apply a mode: add/remove .dark on <html>
  function apply(mode) {
    let useDark;
    if (mode === 'system') {
      useDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      useDark = (mode === 'dark');
    }
    document.documentElement.classList.toggle(classDark, useDark);
  }

  // 4. Kick things off
  const currentMode = detectMode();
  apply(currentMode);

  // 5. If "system", watch for OS changes
  if (currentMode === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => apply('system'));
  }

  // 6. Expose to window for toggling or explicit set
  window.toggleTheme = function(newMode) {
    // if no arg, rotate: light → dark → system → light → …
    const order = ['light','dark','system'];
    let idx = order.indexOf(getStored() || currentMode);
    idx = (idx + 1) % order.length;
    const mode = newMode || order[idx];
    setStored(mode);
    apply(mode);
  };
})();
