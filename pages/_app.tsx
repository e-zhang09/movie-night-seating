import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import custom_theme from '../utils/theme'
import { CssBaseline } from '@material-ui/core'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from '@material-ui/core/styles'
import 'react-toastify/dist/ReactToastify.css';

function MyApp ({ Component, pageProps }: AppProps) {
    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side')
        if (jssStyles?.parentElement) {
            jssStyles.parentElement.removeChild(jssStyles)
        }
    }, [])

    return <>
        <ThemeProvider theme={custom_theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline/>
            <ToastContainer
                position='top-right'
                autoClose={8000}
                limit={3}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                // pauseOnHover    kinda looks weird
            />
            <Component {...pageProps} />
        </ThemeProvider>
    </>
}

export default MyApp
