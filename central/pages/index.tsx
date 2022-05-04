import type { NextPage } from 'next';
import { Grid, GridItem, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import AddForm from '../components/Form';
import Loading from '../components/Loading';
import AddESPModal from '../components/Modal';
import MonitoringCard from '../components/MonitoringCard';
import Navbar from '../components/Navbar';
import { IEspInfo } from '../types/ESPTypes';
import { useMqtt } from '../contexts/MqttContext';

const Home: NextPage = () => {
  const client = useMqtt();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ESPsInfo, setESPsInfo] = useState<IEspInfo[]>([]);

  const addEspInfo = (espInfo: IEspInfo) => {
    setESPsInfo([...ESPsInfo, espInfo]);
  };

  const disconnectEsp = (espId: string) => {
    setESPsInfo(ESPsInfo.filter((esp) => esp.espId !== espId));
  };
  const messageHandler = (topic: string, message: string) => {
    console.log(`Mensagem recebida de: ${topic}\nMensagem: ${message}`);
  };

  useEffect(() => {
    client.connect();
    client.listen('/esp/recv', messageHandler);
  }, []);
  return (
    <>
      <Navbar openAddModal={onOpen} />
      {ESPsInfo.length > 0 ? (
        <Grid templateColumns="repeat(4, 1fr)" gap={6} p="10">
          {ESPsInfo.map((espInfo: IEspInfo) => (
            <GridItem key={espInfo.espId}>
              <MonitoringCard
                disconect={() => disconnectEsp(espInfo.espId)}
                espStatus={{ status: 'Desconectado' }}
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
    </>
  );
};

export default Home;
