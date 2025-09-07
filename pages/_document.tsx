import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pl">
      <Head>
        <link rel="icon" href="/favicon.ico?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=4" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=4" />
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* maskable – dla PWA / Android */}
        <link rel="mask-icon" href="/icon-maskable-512.png?v=4" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
