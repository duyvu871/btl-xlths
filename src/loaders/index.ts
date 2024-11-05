import ExpressServer from './ExpressServer';
import RedisServer from './RedisServer';
import SocketServer from './SocketServer';
import CronJob from "./CronJob";

export default async () => {
    // start express
    const expressServer = new ExpressServer();
    const expressInstance = expressServer.server;

    // start redis
    const redisServer = new RedisServer();
    const redisInstance = await redisServer.initialize();
    expressServer.initRedis(redisServer);

    // start socket 
    const socketServer = new SocketServer(expressInstance, redisInstance);
    const socketInstance = socketServer.instance;
    expressServer.initSocket(socketInstance);

    const cronjob = new CronJob(socketInstance, redisServer);
    cronjob.initialize();

    process.on('exit', () => {

        expressServer.close();
        redisServer.close();
        socketServer.close();

    }).on('SIGINT', () => {

        expressServer.close();
        redisServer.close();
        socketServer.close();

    })
}