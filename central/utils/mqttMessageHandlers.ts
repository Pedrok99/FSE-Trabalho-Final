import { IEspInfo } from '../types/ESPTypes';

function handleOutputMessageAction(
  mqttMessage: {
    topic: string;
    message: string;
  },
  currentEsps: IEspInfo[],
) {
  console.log('Handling output message');
  console.log(currentEsps);
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
      console.log('humidade recebida');
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
      console.log('estado atualizado');
      break;
    default:
      console.log(mqttMessage?.topic);
      break;
  }
  if (updatedEsps.length > 0) {
    return updatedEsps;
  }
  return currentEsps;
}

export default handleOutputMessageAction;
