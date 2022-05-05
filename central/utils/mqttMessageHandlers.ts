import { toast } from 'react-toastify';
import { IEspInfo } from '../types/ESPTypes';

function handleOutputMessageAction(
  mqttMessage: {
    topic: string;
    message: string;
  },
  currentEsps: IEspInfo[],
) {
  console.log('Handling output message:', mqttMessage);
  // console.log(currentEsps);
  const targetTopic = mqttMessage?.topic?.split('/')[4];
  const parsedMessage = targetTopic ? JSON.parse(mqttMessage?.message) : '';
  let updatedEsps: IEspInfo[] = [];
  switch (targetTopic) {
    case 'temperatura':
      updatedEsps = currentEsps.map((esp) => {
        if (esp.espId === parsedMessage?.mac) {
          return {
            ...esp,
            temperature: Math.round(Number(parsedMessage?.data)),
          };
        }
        return esp;
      });
      break;
    case 'umidade':
      updatedEsps = currentEsps.map((esp) => {
        if (esp.espId === parsedMessage?.mac) {
          return {
            ...esp,
            humidity: Math.round(Number(parsedMessage?.data)),
          };
        }
        return esp;
      });
      // console.log('humidade recebida');
      break;
    case 'estado':
      updatedEsps = currentEsps.map((esp) => {
        if (esp.espId === parsedMessage?.mac) {
          return {
            ...esp,
            isAlarmOn: parsedMessage?.data,
          };
        }
        return esp;
      });
      break;
    default:
      break;
  }
  if (updatedEsps.length > 0) {
    return updatedEsps;
  }
  return currentEsps;
}
function handleDeviceMessageAction(
  mqttMessage: {
    topic: string;
    message: string;
  },
  currentEsps: IEspInfo[],
  addDetectedEspMacs: (mac: string) => void,
  addReturningEsp: (espInfo: IEspInfo) => void,
) {
  console.log('Handling device message');
  const targetTopic = mqttMessage?.topic?.split('/')[4];
  const parsedMessage = targetTopic ? JSON.parse(mqttMessage?.message) : '';
  console.log(targetTopic, parsedMessage);

  switch (parsedMessage?.mode) {
    case 'register':
      if (
        parsedMessage?.mac &&
        !currentEsps.find((esp) => esp.espId === parsedMessage?.mac)
      ) {
        toast.success(`ESP ${parsedMessage?.mac} detectada.`);
        addDetectedEspMacs(parsedMessage?.mac);
      }
      break;
    case 're-register':
      addReturningEsp({
        espId: parsedMessage?.mac,
        isAlarmOn: false,
        temperature: 0,
        humidity: 0,
        inputName: parsedMessage?.input,
        outputName: parsedMessage?.output,
        hasTempSensor: parsedMessage?.temperature,
        room: parsedMessage?.room,
        status: 'on',
        name: `Esp ${parsedMessage?.room}`,
        hasAlarm: false,
      });
      break;

    default:
      break;
  }
}
export { handleOutputMessageAction, handleDeviceMessageAction };
