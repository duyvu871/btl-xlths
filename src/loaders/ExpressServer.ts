import express from 'express';
import * as bodyParser from "body-parser";
import config from "../common/config";
import cors from 'cors';
import errorHandler from "../responses/ErrorHandler";
import route from '../api/routes';
import routeNotFound from '../api/middlewares/RouteNotFound';

import * as SocketIo from 'socket.io';
import { Server, createServer } from 'http';
import Redis from "ioredis";
import RedisServer from "./RedisServer";


class ExpressServer {
    public static readonly PORT: number = 8080;

    private _app!: express.Express;
    private _server!: Server;
    private _port!: number;

    public constructor() {
        this.listen();
    }

    private listen(): void {

        // initialize express instances 
        this._app = express();

        // only accept content type application/json
        this._app.use(bodyParser.urlencoded({ extended: false }));
        this._app.use(bodyParser.json({ type: "*/*" }));
        this._app.use(cors());
        this._app.use('/api/v1', route.apiRoutes);
        this._app.use('/', route.pageRoutes);
        this._app.use('*', routeNotFound);
        this._app.use(errorHandler);

        // start nodejs server
        this._port = config.serverPort || ExpressServer.PORT;
        this._server = createServer(this._app);
        this._server.listen(this._port, () => {
            console.log('Running Express Server on port %s', this._port);
        })
    }

    public close(): void {
        this._server.close((err) => {
            if (err) throw Error();

            console.info(new Date(), '[ExpressServer]: Stopped');
        });
    }

    public initSocket(socket: SocketIo.Server): void {
        this._app.set('socket', socket);
    }

    public initRedis(redis: RedisServer): void {
        this._app.set('redis', redis);
    }

    get server(): Server { return this._server; }
}

export default ExpressServer; 
