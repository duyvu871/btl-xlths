import RedisServer from "../loaders/RedisServer";
import SocketIO from "socket.io";
import SocketServer from "../loaders/SocketServer";
import * as SocketIo from "socket.io";
import {SocketEvent} from "../common/constants";

export type BinanceHistoricalArgs = {
    symbol: string;
    interval: '1s' | '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M' | string;
    startTime?: number;
    endTime?: number;
    timeZone?: string;
    limit?: number;
}

export type BinanceTicker = {
    symbol: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    lastPrice: string;
    volume: string;
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    firstId: number;
    lastId: number;
    count: number;
}

class LiveBitcoinWebsocket {
    constructor(private socket: SocketServer, private redisServer: RedisServer) { }

    get name() {
        return  this.constructor.name
    }

    private getClientId(socketId: string): string {
        return `${this.constructor.name}:${socketId}`;
    }

    public initialize(): void {
        const liveBitcoinNamespace =  this.socket.instance.of('/socket/live-bitcoin');
        // Add the namespace to the socket server store
        this.socket.addSlaveNamespace(this.name, liveBitcoinNamespace);

        liveBitcoinNamespace.on(SocketEvent.CONNECT, (socket) => {
            const clientId = this.getClientId(socket.id);
            this.socket.setClient(clientId, socket);

            socket.on('join', (data: Pick<BinanceHistoricalArgs, "interval"|"symbol">) => {
                const { symbol, interval } = data;
                const roomName = `${symbol}:${interval}`;
                socket.join(roomName);
                console.log(`Client ${socket.id} joined room ${roomName}`);
            });

            socket.on('leave', (data: Pick<BinanceHistoricalArgs, "interval"|"symbol">) => {
                const { symbol, interval } = data;
                const roomName = `${symbol}:${interval}`;
                socket.leave(roomName);
                console.log(`Client ${socket.id} left room ${roomName}`);
            });

            console.log('Live Bitcoin Websocket Connected');
            socket.on(SocketEvent.DISCONNECT, () => {
                this.socket.destroyClient(clientId);
                console.log('Live Bitcoin Websocket Disconnected');
            });
        });
    }
}

export default LiveBitcoinWebsocket;