import { Message, Stan } from 'node-nats-streaming';

class GenericListener {
  constructor(private client: Stan, private subject: string, private queueGroupName: string) {}

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      { durableName: this.queueGroupName, ackWait: 5 * 1000 }
    );

    subscription.on('message', (msg: Message) => {
      const data = msg.getData();
      const parsed = typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'));
      console.log(`Received event ${this.subject}:`, parsed);
      msg.ack(); // gửi ack thủ công (khi durable/sub manual ack)
    });
  }
}

// Khởi listener:
new GenericListener(natsWrapper.client, 'order:cancelled', 'order-service').listen();
