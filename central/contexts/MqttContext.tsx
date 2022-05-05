import { createContext, useContext, ReactNode } from 'react';
import MQTTClient from '../services/mqtt';

const mqttClient = new MQTTClient('mqtt://broker.hivemq.com:8000/mqtt');

const MqttContext = createContext(mqttClient);

const useMqtt = () => useContext(MqttContext);

export function MqttProvider({ children }: { children: ReactNode }) {
  return (
    <MqttContext.Provider value={mqttClient}>{children}</MqttContext.Provider>
  );
}

export { MqttContext, useMqtt };
