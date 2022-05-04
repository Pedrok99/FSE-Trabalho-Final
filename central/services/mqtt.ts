import { MqttClient, connect } from 'mqtt';

class MQTTClient {
  url: string;

  client: MqttClient | null;

  baseTopicstring: string = '/fse2020/180106970';

  constructor(url: string) {
    this.url = url;
    this.client = null;
  }

  connect() {
    this.client = connect(this.url);
    this.client.on('connect', () => {
      this.client?.subscribe('/esp/test', () => {
        this.client?.publish('/esp/test', 'Connected');
      });
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

  listen(
    topic: string,
    callback: (targetTopic: string, recievedMessage: string) => void,
  ) {
    this.client?.subscribe(topic, () => {
      this.client?.on('message', (recievedMessage: string, message: string) => {
        callback(recievedMessage, message.toString());
      });
    });
  }
}

export default MQTTClient;
