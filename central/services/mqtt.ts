import { MqttClient, connect } from 'mqtt';

class MQTTClient {
  url: string;

  client: MqttClient | null;

  baseTopicstring: string = '/fse2021/180106970';

  registeredTopics: string[] = [];

  constructor(url: string) {
    this.url = url;
    this.client = null;
  }

  connect() {
    this.client = connect(this.url);
    this.client.on('connect', () => {
      console.log('connected');
    });
    this.client.on('error', (err) => {
      console.log('error', err);
    });
    this.client.on('close', () => {
      console.log('close');
    });
    this.client.on('offline', () => {
      console.log('offline');
    });
  }

  listen(callback: (targetTopic: string, recievedMessage: string) => void) {
    this.client?.on('message', (recievedMessage: string, message: string) => {
      callback(recievedMessage, message.toString());
    });
  }

  subscribe(topic: string) {
    if (!this.registeredTopics.includes(topic)) {
      this.client?.subscribe(topic, () => {
        this.registeredTopics.push(topic);
      });
    }
  }

  publish(topic: string, message: string) {
    this.client?.publish(topic, message);
  }
}

export default MQTTClient;
