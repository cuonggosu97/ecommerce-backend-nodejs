"use strict";
const amqp = require("amqplib");

const producerOrderedMessage = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queueName = "ordered-queued-message";
    await channel.assertQueue(queueName, {
      durable: true,
    });

    for (let i = 0; i < 10; i++) {
      const message = `ordered-queue-message:: ${i}`;
      console.log(`message: ${message}`);
      channel.sendToQueue(queueName, Buffer.from(message), {
        persistent: true,
      });
    }
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error(error);
  }
};

producerOrderedMessage().catch(console.error);
