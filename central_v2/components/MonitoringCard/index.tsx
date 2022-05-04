import {
  Container,
  Divider,
  Flex,
  Text,
  Switch,
  Center,
  Button
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import {
  BsThermometerHalf,
  BsDroplet,
  BsLightningCharge,
  BsBell
} from 'react-icons/bs'

import alarmSound from '../../assets/audio/alarm.mp3'
import { IEspInfo, IEspStatus } from '../../types/ESPTypes'
import InfoLine from '../InfoLine'
import Status from '../Status'
import './styles.css'

export interface IMonitoringCardProps {
  espInfo: IEspInfo
  espStatus: IEspStatus
  disconect: () => void
}

function MonitoringCard({
  espInfo,
  espStatus,
  disconect
}: IMonitoringCardProps) {
  const [isActivated, setIsActivated] = useState(false)
  const [isAlarmOn, setIsAlarmOn] = useState(false)
  const songRef = useRef(new Audio(alarmSound))
  songRef.current.loop = true
  const audioMenager = (alarmActivated: boolean) => {
    if (alarmActivated) {
      songRef.current.play()
    } else {
      songRef.current.pause()
    }
    setIsAlarmOn(alarmActivated)
  }

  return (
    <Container
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
      shadow="md"
      py={3}
    >
      <Flex justifyContent="space-between">
        <Text>Cômodo: {espInfo.room}</Text>
        <Status status={espStatus.status} />
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
              // InfoIconColor={temperatura > 0 ? '#d64040' : '#4150d9'}
              label="Temperatura"
              value="20ºC"
            />

            <InfoLine
              InfoIcon={BsDroplet}
              label="Humidade"
              value="20%"
              InfoIconColor="blue"
            />
          </>
        )}

        <InfoLine
          InfoIcon={BsLightningCharge}
          InfoIconColor={isActivated ? '#868741' : ''}
          label="Estado"
          UpdateComponent={
            <Switch
              onChange={() => setIsActivated(!isActivated)}
              defaultChecked={isActivated}
            />
          }
        />
        {espInfo?.hasAlarm && (
          <InfoLine
            InfoIcon={BsBell}
            InfoIconColor={isAlarmOn ? 'red' : ''}
            InfoIconClass={isAlarmOn ? 'alarm' : ''}
            label="Alarme"
            UpdateComponent={
              <Switch
                onChange={() => {
                  audioMenager(!isAlarmOn)
                }}
                defaultChecked={isAlarmOn}
              />
            }
          />
        )}
      </Flex>

      <Center mt={4}>
        <Button
          size="sm"
          colorScheme="red"
          onClick={() => {
            audioMenager(false)
            songRef.current.remove()
            disconect()
          }}
        >
          Desconectar
        </Button>
      </Center>
    </Container>
  )
}

export default MonitoringCard
