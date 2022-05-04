import type { NextPage } from 'next';
import {
 Box, Button, Grid, GridItem, useDisclosure 
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import AddForm from '../components/Form';
import Loading from '../components/Loading';
import AddESPModal from '../components/Modal';
import MonitoringCard from '../components/MonitoringCard';
import Navbar from '../components/Navbar';
import { IEspInfo } from '../types/ESPTypes';
import { useMqtt } from '../contexts/MqttContext';
import handleOutputMessageAction from '../utils/mqttMessageHandlers';

const Home: NextPage = () => {
  const client = useMqtt();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ESPsInfo, setESPsInfo] = useState<IEspInfo[]>([]);
  const [mqttMessage, setMqttMessage] = useState<{
    topic: string;
    message: string;
  }>({});
  const [macsToConnect, setMacsToConnect] = useState<string[]>([]);

  const addEspInfo = (espInfo: IEspInfo) => {
    setESPsInfo([...ESPsInfo, espInfo]);
  };
  const disconnectEsp = (espId: string) => {
    setESPsInfo(ESPsInfo.filter((esp) => esp.espId !== espId));
  };

  const messageHandler = (topic: string, message: string) => {
    setMqttMessage({ topic, message });
  };

  useEffect(() => {
    client.connect();
    client.subscribe('/fse2021/180106970/dispositivos/+');
    client.subscribe('/fse2021/180106970/sala/+');
    client.listen(messageHandler);
    toast.success('Conectado ao broker MQTT');
  }, []);
  useEffect(() => {
    // const targetTopic = mqttMessage?.topic?.split('/')[4];
    // const parsedMessage = targetTopic ? JSON.parse(mqttMessage?.message) : '';
    const updatedOutputState = handleOutputMessageAction(mqttMessage, ESPsInfo);
    setESPsInfo(updatedOutputState);

    // switch (targetTopic) {
    //   case 'temperatura':
    //     setESPsInfo(
    //       ESPsInfo.map((esp) => {
    //         if (esp.espId === parsedMessage?.mac) {
    //           return {
    //             ...esp,
    //             temperature: Math.round(Number(parsedMessage?.data)),
    //           };
    //         }
    //         return esp;
    //       }),
    //     );
    //     break;
    //   case 'umidade':
    //     setESPsInfo(
    //       ESPsInfo.map((esp) => {
    //         if (esp.espId === parsedMessage?.mac) {
    //           return {
    //             ...esp,
    //             humidity: Math.round(Number(parsedMessage?.data)),
    //           };
    //         }
    //         return esp;
    //       }),
    //     );
    //     console.log('humidade recebida');
    //     break;
    //   case 'estado':
    //     setESPsInfo(
    //       ESPsInfo.map((esp) => {
    //         if (esp.espId === parsedMessage?.mac) {
    //           return {
    //             ...esp,
    //             isAlarmOn: parsedMessage?.data,
    //           };
    //         }
    //         return esp;
    //       }),
    //     );
    //     console.log('estado atualizado');
    //     break;
    //   default:
    //     console.log(mqttMessage?.topic);
    //     break;
    // }
    console.log(mqttMessage);
  }, [mqttMessage]);

  // useEffect(() => {
  //   console.log('ESPsInfo', ESPsInfo);
  // }, [ESPsInfo]);

  return (
    <Box
      bgGradient="linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)"
      height="100vh"
    >
      <Box>
        <Navbar openAddModal={onOpen} />
        {ESPsInfo.length > 0 ? (
          <Grid templateColumns="repeat(3, 1fr)" gap={6} p="10">
            {ESPsInfo.map((espInfo: IEspInfo) => (
              <GridItem key={espInfo.espId}>
                <MonitoringCard
                  disconect={() => disconnectEsp(espInfo.espId)}
                  espInfo={espInfo}
                />
              </GridItem>
            ))}
          </Grid>
        ) : (
          <Loading barSize="sm" title="Aguardando ESP32" />
        )}
        <AddESPModal title="Adicionar ESP" isOpen={isOpen} onClose={onClose}>
          <AddForm addEspInfo={addEspInfo} onClose={onClose} />
        </AddESPModal>
      </Box>
    </Box>
  );
};

export default Home;
