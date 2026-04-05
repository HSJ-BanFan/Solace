import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  hue: number;
  theme: 'light' | 'dark';
  setHue: (hue: number) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const DEFAULT_HUE = 250;

export function applyHue(hue: number) {
  document.documentElement.style.setProperty('--hue', String(hue));
}

export function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      hue: DEFAULT_HUE,
      theme: 'light',

      setHue: (hue) => {
        set({ hue });
        applyHue(hue);
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        applyTheme(newTheme);
      },

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyHue(state.hue);
          applyTheme(state.theme);
        }
      },
    }
  )
);