import { Injectable } from "@nestjs/common";
import { MqttClient, connect } from "mqtt";

@Injectable()
export class MqttService {
  public readonly mqtt: MqttClient;
  public message: string;

  constructor() {
    this.mqtt = connect("mqtt://broker.emqx.io:1883", {
      clientId: "steviaMqttClient",
      clean: true,
      connectTimeout: 5000,
    });

    this.mqtt.on("connect", () => {
      console.info("Connected to MQTT broker");
      this.mqtt.subscribe("stevia-mqtt/hbnu/response/+", (err) => {
        if (err) {
          console.error(`Failed to subscribe: ${err.message}`);
        } else {
          console.info("Subscribed to topic: stevia-mqtt/hbnu/response/+");
        }
      });
    });

    this.mqtt.on("message", (topic, message) => {
      const messageContent = message.toString();
      console.info(`Received message on topic '${topic}': ${messageContent}`);
      this.message = messageContent;
    });

    this.mqtt.on("error", (err) => {
      console.error(`MQTT error: ${err.message}`);
    });

    this.mqtt.on("offline", () => {
      console.info("MQTT client went offline");
    });

    this.mqtt.on("reconnect", () => {
      console.info("Reconnecting to MQTT broker");
    });
  }

  async publish(topic: string, payload: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.mqtt.publish(topic, payload, (err) => {
        if (err) {
          reject(`Failed to publish message: ${err.message}`);
        } else {
          resolve(payload);
        }
      });
    });
  }

  async getMessage(): Promise<string> {
    return this.message;
  }
}
