import { SpeedInsights } from '@vercel/speed-insights/next';
import '../styles/globals.css'; // Your global styles

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Vercel Speed Insights for performance tracking */}
      <SpeedInsights />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
