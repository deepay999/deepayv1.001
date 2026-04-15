import { createContext, useContext, ReactNode } from 'react';

type ThemeType = 'green';

interface ThemeContextType {
  theme: ThemeType;
  accentColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme: ThemeType = 'green';
  const accentColor = 'text-green-500';

  return (
    <ThemeContext.Provider value={{ theme, accentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
