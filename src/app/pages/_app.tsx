import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { RecoilRoot } from "recoil";
import "react-toastify/dist/ReactToastify.css";
export default function App({ Component, pageProps }: AppProps) {
	return (
		      <RecoilRoot>
			<Head>
				<title>Zcoder</title>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/zcoder-favicon.png' />
				<meta
					name='description'
					content='Web application that contains coding problems and provides users with rooms for discussion'
				/>
			</Head>
			
			<Component {...pageProps} />
		</RecoilRoot>
	);
}  