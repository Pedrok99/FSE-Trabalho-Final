import { MqttClient, connect } from 'mqtt';
import { toast } from 'react-toastify';

class MQTTClient {
  private url: string;

  client: MqttClient | null;

  baseTopicString: string = '/fse2021/180106970';

  private registeredTopics: string[] = [];

  constructor(url: string) {
    this.url = url;
    this.client = null;
  }

  connect() {
    this.client = connect(this.url);
    this.client.on('connect', () => {
      toast.success('Connected to MQTT broker');
    });
    this.client.on('error', (err) => {
      toast.error('Error connecting to MQTT broker');
    });
    this.client.on('close', () => {
      toast.error('Disconnected from MQTT broker');
    });
    this.client.on('offline', () => {
      toast.error('Disconnected from MQTT broker');
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

  unsubscribe(topic: string) {
    if (this.registeredTopics.includes(topic)) {
      this.client?.unsubscribe(topic, () => {
        this.registeredTopics = this.registeredTopics.filter(
          (registeredTopic) => registeredTopic !== topic,
        );
      });
    }
  }

  publish(topic: string, message: string) {
    this.client?.publish(topic, message);
  }
}

export default MQTTClient;
