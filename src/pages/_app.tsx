import { AppProps } from 'next/app';
import Head from 'next/head';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="orientation" content="portrait-primary" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;