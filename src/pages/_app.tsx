import { AppProps } from 'next/app';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;