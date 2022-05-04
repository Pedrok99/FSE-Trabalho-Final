import { Center, Circle, Text } from '@chakra-ui/react';

import styles from './Status.module.css';

function Status({ status }: { status: 'on' | 'off' }) {
  const statusColor = {
    on: {
      text: 'green.700',
      circle: 'green',
    },
    off: {
      text: 'red.700',
      circle: 'red',
    },
  };
  return (
    <Center gap={2}>
      <Circle
        size={3}
        bg={`${statusColor[status].circle}`}
        className={`${status === 'on' ? styles.pulsate : ''}`}
      />
      <Text fontSize="sm" color={`${statusColor[status].text}`}>
        {status === 'on' ? 'Conectado' : 'Desconectado'}
      </Text>
    </Center>
  );
}

export default Status;
