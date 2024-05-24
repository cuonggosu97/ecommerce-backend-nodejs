const amqp = require("amqplib");
const messages = "a new product";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const notificationExchange = "notificationEx"; // notificationEx direct
    const notiQueue = "notificationQueueProcess"; // assertQueue
    const notificationExchangeDLX = "notificationExDLX"; // notificationExDLX direct
    const notificationRoutingKeyDLX = "notificationRoutingKeyDLX"; // assert
    // 1. create Exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });

    // 2. create Queue
    const queueResult = await channel.assertQueue(notiQueue, {
      exclusive: false, // cho phep cac ket noi truy cap vao cung mot luc hang doi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    });

    // 3. bind Queue
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // 4. send messages to consumer chanel
    channel.sendToQueue(queueResult.queue, Buffer.from(messages), {
      expiration: "10000",
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch(console.error);
