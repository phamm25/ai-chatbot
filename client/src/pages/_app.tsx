import type { AppProps } from 'next/app';
import { ChatProvider } from '../context/ChatContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ChatProvider>
        <Component {...pageProps} />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
