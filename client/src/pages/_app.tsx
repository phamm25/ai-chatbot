import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { SWRConfig } from 'swr';
import '../styles/globals.css';
import { useThemeStore, applyThemeClass } from '../state/theme';
import { ThemeToggle } from '../components/ThemeToggle';

const swrConfig = {
  revalidateOnFocus: false,
  fetcher: (resource: RequestInfo, init?: RequestInit) => fetch(resource, init).then((res) => res.json()),
};

function App({ Component, pageProps }: AppProps) {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyThemeClass(mode);
  }, [mode]);

  return (
    <SWRConfig value={swrConfig}>
      <div className="min-h-screen bg-surface-light text-gray-900 dark:bg-surface-dark dark:text-gray-100">
        <ThemeToggle />
        <Component {...pageProps} />
      </div>
    </SWRConfig>
  );
}

export default App;
