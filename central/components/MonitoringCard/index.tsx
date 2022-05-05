import {
  Container,
  Divider,
  Flex,
  Text,
  Switch,
  Center,
  Button,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import {
  BsThermometerHalf,
  BsDroplet,
  BsLightningCharge,
  BsBell,
} from 'react-icons/bs';
import { useMqtt } from '../../contexts/MqttContext';
import { IEspInfo } from '../../types/ESPTypes';
import InfoLine from '../InfoLine';
import Status from '../Status';
import styles from './MonitoringCard.module.css';

export interface IMonitoringCardProps {
  espInfo: IEspInfo;
  disconect: () => void;
}

function MonitoringCard({ espInfo, disconect }: IMonitoringCardProps) {
  const mqttClient = useMqtt();
  const deviceTopic = `${mqttClient.baseTopicString}/dispositivos/${espInfo.espId}`;
  const [isActivated, setIsActivated] = useState(false);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const songRef = useRef(new Audio('/assets/audio/alarm.mp3'));
  songRef.current.loop = true;
  const audioMenager = (alarmActivated: boolean) => {
    if (alarmActivated) {
      songRef.current.play();
    } else {
      songRef.current.pause();
    }
    setIsAlarmOn(alarmActivated);
  };

  const activateOutput = () => {
    mqttClient.publish(
      deviceTopic,
      JSON.stringify({ mode: 'update', state: !isActivated }),
    );
    setIsActivated(!isActivated);
  };

  const disconnectEsp = () => {
    mqttClient.unsubscribe(`${mqttClient.baseTopicString}/${espInfo.room}/+`);
    disconect();
  };

  useEffect(() => {
    mqttClient.subscribe(`${mqttClient.baseTopicString}/${espInfo.room}/+`);
    // mqttClient.subscribe(`/fse2021/180106970/dispositivos/${espInfo.espId}`);
    mqttClient.publish(
      deviceTopic,
      JSON.stringify({
        mode: 'register',
        room: espInfo.room,
        input: espInfo.inputName,
        output: espInfo.outputName,
        temperature: espInfo.hasTempSensor || false,
      }),
    );
    console.log(
      `subscribed to : ${mqttClient.baseTopicString}/${espInfo.room}/+`,
    );
  }, []);

  useEffect(() => {
    if (espInfo.hasAlarm) {
      audioMenager(espInfo.isAlarmOn || false);
    }
  }, [espInfo.isAlarmOn]);

  return (
    <Container
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
      shadow="md"
      py={3}
      bg="white"
    >
      <Flex justifyContent="space-between">
        <Text>Cômodo: {espInfo.room}</Text>
        <Status status={'on'} />
      </Flex>
      <Flex justifyContent="space-between">
        <Text>Nome: {espInfo.name}</Text>
        <Text>{espInfo.espId}</Text>
      </Flex>

      <Divider paddingY={1} />

      <Flex gap={3} flexDirection="column" pt="2">
        {espInfo?.hasTempSensor && (
          <>
            <InfoLine
              InfoIcon={BsThermometerHalf}
              InfoIconColor={
                (espInfo?.temperature || 0) > 0 ? '#d64040' : '#4150d9'
              }
              label="Temperatura"
              value={`${espInfo?.temperature || 0}ºC`}
            />

            <InfoLine
              InfoIcon={BsDroplet}
              label="Humidade"
              value={`${espInfo?.humidity || 0}  %`}
              InfoIconColor="blue"
            />
          </>
        )}
        <InfoLine
          InfoIcon={BsLightningCharge}
          InfoIconColor={isActivated ? '#868741' : ''}
          label={espInfo.outputName || 'Estado'}
          UpdateComponent={
            <Switch onChange={activateOutput} defaultChecked={isActivated} />
          }
        />

        <InfoLine
          InfoIcon={BsBell}
          InfoIconColor={espInfo.isAlarmOn ? 'red' : ''}
          InfoIconClass={espInfo.isAlarmOn ? styles.alarm : ''}
          label={espInfo.inputName || 'Alarme'}
          UpdateComponent={
            <Switch
              onChange={() => {
                console.log('onchange alarm');

                if (espInfo.hasAlarm) {
                  audioMenager(!isAlarmOn);
                }
              }}
              defaultChecked={espInfo.isAlarmOn}
              isChecked={espInfo.isAlarmOn}
              isReadOnly
            />
          }
        />
      </Flex>

      <Center mt={4}>
        <Button
          size="sm"
          colorScheme="red"
          onClick={() => {
            audioMenager(false);
            songRef.current.remove();
            disconnectEsp();
          }}
        >
          Desconectar
        </Button>
      </Center>
    </Container>
  );
}

export default MonitoringCard;
