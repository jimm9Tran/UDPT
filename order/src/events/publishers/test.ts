natsWrapper.client.publish(
  'order:created',
  JSON.stringify({ id: '123', price: 50 }),
  () => { console.log('OrderCreated event published'); }
);
