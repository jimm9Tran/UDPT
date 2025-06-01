import nats, { type Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client (): Stan {
    if (this._client == null) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }

  async connect (clusterId: string, clientId: string, url: string): Promise<void> {    this._client = nats.connect(clusterId, clientId, {
      url,
      waitOnFirstConnect: true,
      connectTimeout: 30000, // 30 seconds
      reconnectTimeWait: 2000, // 2 seconds
      maxReconnectAttempts: 5
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('NATS connection timeout after 30 seconds'));
      }, 30000);

      this.client.on('connect', () => {
        clearTimeout(timeout);
        console.log('Connected to NATS');
        resolve();
      });

      this.client.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      this.client.on('disconnect', () => {
        console.log('Disconnected from NATS');
      });

      this.client.on('reconnect', () => {
        console.log('Reconnected to NATS');
      });
    });
  }

  get isConnected (): boolean {
    return this._client !== undefined;
  }
}

export const natsWrapper = new NatsWrapper();
