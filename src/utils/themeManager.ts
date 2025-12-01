// Theme Manager - Handles light/dark/auto theme switching
export type Theme = 'light' | 'dark' | 'auto';

export const applyTheme = (theme: Theme) => {
  // Ensure DOM is ready
  if (!document.documentElement) {
    console.warn('Document element not ready');
    return;
  }

  const html = document.documentElement;
  const body = document.body;
  
  console.log('Applying theme:', theme);
  
  if (theme === 'auto') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('System prefers dark:', prefersDark);
    html.classList.remove('dark');
    body.classList.remove('dark');
    if (prefersDark) {
      html.classList.add('dark');
      body.classList.add('dark');
    }
  } else if (theme === 'dark') {
    html.classList.add('dark');
    body.classList.add('dark');
  } else {
    html.classList.remove('dark');
    body.classList.remove('dark');
  }

  console.log('HTML classes after theme:', html.className);
  console.log('HTML element:', html);
  
  // Store theme preference
  localStorage.setItem('theme_preference', theme);
};

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getInitialTheme = (): Theme => {
  // Check localStorage first
  const stored = localStorage.getItem('theme_preference') as Theme | null;
  if (stored && ['light', 'dark', 'auto'].includes(stored)) {
    console.log('Found stored theme:', stored);
    return stored;
  }
  
  console.log('No stored theme, defaulting to light');
  // Default to 'light'
  return 'light';
};

export const initializeTheme = () => {
  // Wait for document to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const theme = getInitialTheme();
      console.log('Initializing theme after DOMContentLoaded:', theme);
      applyTheme(theme);
      setupThemeListeners(theme);
    });
  } else {
    const theme = getInitialTheme();
    console.log('Initializing theme (DOM ready):', theme);
    applyTheme(theme);
    setupThemeListeners(theme);
  }
};

const setupThemeListeners = (theme: Theme) => {
  // Listen for system theme changes if auto is selected
  if (theme === 'auto') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const html = document.documentElement;
      console.log('System theme changed, dark:', e.matches);
      html.classList.toggle('dark', e.matches);
      document.body.classList.toggle('dark', e.matches);
    });
  }
};
