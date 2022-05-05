import type { NextPage } from 'next';
import { Box, Button, Grid, GridItem, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import AddForm from '../components/Form';
import Loading from '../components/Loading';
import AddESPModal from '../components/Modal';
import MonitoringCard from '../components/MonitoringCard';
import Navbar from '../components/Navbar';
import { IEspInfo } from '../types/ESPTypes';
import { useMqtt } from '../contexts/MqttContext';
import {
  handleOutputMessageAction,
  handleDeviceMessageAction,
} from '../utils/mqttMessageHandlers';

const Home: NextPage = () => {
  const client = useMqtt();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ESPsInfo, setESPsInfo] = useState<IEspInfo[]>([]);
  const [detectedEspMacs, setDetectedEspMacs] = useState<string[]>([]);
  const [mqttMessage, setMqttMessage] = useState<{
    topic: string;
    message: string;
  }>({});

  const addEspInfo = (espInfo: IEspInfo) => {
    setESPsInfo([...ESPsInfo, espInfo]);
  };

  const addDetectedEspMacs = (mac: string) => {
    if (!detectedEspMacs.includes(mac)) {
      setDetectedEspMacs([...detectedEspMacs, mac]);
    }
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
    if (mqttMessage?.topic?.includes('dispositivos')) {
      handleDeviceMessageAction(mqttMessage, ESPsInfo, addDetectedEspMacs);
    } else {
      const updatedOutputState = handleOutputMessageAction(
        mqttMessage,
        ESPsInfo,
      );
      setESPsInfo(updatedOutputState);
    }

    // console.log(mqttMessage);
  }, [mqttMessage]);
  // useEffect(() => {
  //   if (detectedEspMacs.length > 0) {
  //     onOpen();
  //   }
  // }, [detectedEspMacs]);

  useEffect(() => {
    const filteredDetectedEsps: string[] = [];
    ESPsInfo.forEach((esp) => {
      if (!detectedEspMacs.includes(esp.espId)) {
        filteredDetectedEsps.push(esp.espId);
      }
    });
    setDetectedEspMacs(filteredDetectedEsps);
  }, [ESPsInfo]);

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
          <AddForm
            addEspInfo={addEspInfo}
            onClose={onClose}
            espMacs={detectedEspMacs}
          />
        </AddESPModal>
      </Box>
    </Box>
  );
};

export default Home;
