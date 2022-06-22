import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
        <script async defer data-website-id="556351d8-60ef-4d44-bd2d-8797dce107b9" src="https://umami.notedwin.tech/umami.js"></script>
        </Head>
        <body>
          <Main />
          <NextScript />

        </body>
      </Html>
    )
  }
}