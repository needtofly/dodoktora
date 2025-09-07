import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="pl">
      <Head>
        {/* favicon – PNG ma pierwszeństwo */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=7" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=7" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=7" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
