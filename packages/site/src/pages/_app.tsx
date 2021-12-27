import { ThemeProvider } from "next-themes"
import { AppProps } from "next/app"
import Head from "next/head"
import { Favicon } from "../components/Favicon"
import "../styles/main.css"

/**
 * A custom `App` component, used to initialize pages.
 *
 * @param props - A set of props.
 * @param props.Component - The active page component.
 * @param props.pageProps - The initial props preloaded for the page.
 */
function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <Head>
        <title>Dimmmensions</title>
        <meta content="initial-scale=1, viewport-fit=cover" name="viewport" />
        <meta
          content="A collection of dimensions from iOS and iPadOS devices."
          name="description"
        />
        <meta content="Dimmmensions" property="og:title" />
        <meta
          content="A collection of dimensions from iOS and iPadOS devices."
          property="og:description"
        />
        <meta content="@marcbouchenoire" name="twitter:creator" />
      </Head>
      <Favicon>📏</Favicon>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
