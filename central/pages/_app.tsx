import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { ToastContainer } from 'react-toastify';
import { MqttProvider } from '../contexts/MqttContext';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <MqttProvider>
        <Component {...pageProps} />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          draggable={false}
          closeOnClick
          pauseOnHover
        />
      </MqttProvider>
    </ChakraProvider>
  );
}

export default MyApp;
