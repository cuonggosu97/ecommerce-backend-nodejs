"use strict";
const amqp = require("amqplib");

const consumerOrderedMessage = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queueName = "ordered-queued-message";
    await channel.assertQueue(queueName, {
      durable: true,
    });

    // set prefetch to 1 to ensure only one ack at a time
    channel.prefetch(1);

    channel.consume(queueName, (msg) => {
      const message = msg.content.toString();

      setTimeout(() => {
        console.log(`Processed: ${message}`);
        channel.ack(msg);
      }, Math.random() * 1000);
    });
  } catch (error) {
    console.error(error);
  }
};

consumerOrderedMessage().catch(console.error);
