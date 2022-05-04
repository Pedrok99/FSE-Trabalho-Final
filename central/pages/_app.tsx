import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { MqttProvider } from '../contexts/MqttContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <MqttProvider>
        <Component {...pageProps} />
      </MqttProvider>
    </ChakraProvider>
  );
}

export default MyApp;
