import { Center, Circle, Text } from '@chakra-ui/react';

import './Status.module.css';
import { IEspStatus } from '../../types/ESPTypes';

function Status({ status }: IEspStatus) {
  const statusColor = {
    Conectado: {
      text: 'green.700',
      circle: 'green',
    },
    Desconectado: {
      text: 'red.700',
      circle: 'red',
    },
  };
  return (
    <Center gap={2}>
      <Circle
        size={3}
        bg={`${statusColor[status].circle}`}
        className={`${status === 'Conectado' ? 'pulsate' : ''}`}
      />
      <Text fontSize="sm" color={`${statusColor[status].text}`}>
        {status}
      </Text>
    </Center>
  );
}

export default Status;
