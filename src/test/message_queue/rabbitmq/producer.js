const amqp = require("amqplib");
const messages = "hello! RabbitMQ for PhamCuong";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true,
    });

    // send messages to consumer chanel
    channel.sendToQueue(queueName, Buffer.from(messages));
    console.log(`Producer send message: ${messages}`); 
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch(console.error);
