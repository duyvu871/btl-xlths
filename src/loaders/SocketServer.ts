import * as SocketIo from 'socket.io';
import Redis from 'ioredis';
import { Server } from 'http';

import { SocketEvent } from '../common/constants';
import LiveBitcoinWebsocket from "../websockets/LiveBitcoinWebsocket";
import RedisServer from "./RedisServer";

class SocketServer {
    private _io: SocketIo.Server;
    private _redis: RedisServer;
    private _clients: Map<string, SocketIo.Socket> = new Map();
    private _slaveNamespaces: Map<string, SocketIo.Namespace> = new Map();

    constructor(server: Server, redis: RedisServer) {
        this._io = new SocketIo.Server(server, {
            cors: {
                origin: "*",
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            },
            path: '/socket',
        });
        this._redis = redis;
        this.listen();
        new LiveBitcoinWebsocket(this, this._redis).initialize();
    }

    private listen(): void {
        this._io
            .on(SocketEvent.CONNECT, async (socket) => {
                try {
                    // Store socket client in Map
                    const socketId: string = socket.id;
                    this._clients.set(socketId, socket);

                    // Remove socket ID from Map on disconnect
                    socket.on(SocketEvent.DISCONNECT, async () => {
                        try {
                            this._clients.delete(socketId);
                        } catch (error) {
                            console.error("Error removing key from Redis on disconnect:", error);
                        }
                    });
                } catch (error) {
                    console.error("Error storing socket ID in Redis:", error);
                    socket.disconnect(); // Disconnect if Redis operation fails
                }
            });54

        if (this._io) {
            console.log('Running Socket Server is listening.');
        }
    }


    public async close(): Promise<void> {
        try {
            //  io.close() handles closing connections
            await new Promise<void>((resolve, reject) => {
                this._io.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.info(new Date(), "[SocketServer]: Stopped");
                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error(new Date(), "[SocketServer]: Error stopping:", err);
        }
    }

    get instance(): SocketIo.Server {
        return this._io;
    }

    get clients(): Map<string, SocketIo.Socket> {
        return this._clients;
    }

    setClient(socketId: string, socket: SocketIo.Socket): void {
        this._clients.set(socketId, socket);
    }

    getClient(socketId: string): SocketIo.Socket | undefined {
        return this._clients.get(socketId);
    }

    destroyClient(socketId: string): void {
        this._clients.delete(socketId);
    }

    getManyClients(socketIds: string[]): (SocketIo.Socket | undefined)[] {
        return socketIds.map((id) => this._clients.get(id));
    }

    broadcast(event: string, data: any): void {
        this._io.emit(event, data);
    }

    broadcastToRoom(room: string, event: string, data: any): void {
        this._io.to(room).emit(event, data);
    }

    joinRoom(socketId: string, room: string): void {
        const socket = this.getClient(socketId);
        if (socket) {
            socket.join(room);
        }
    }

    leaveRoom(socketId: string, room: string): void {
        const socket = this.getClient(socketId);
        if (socket) {
            socket.leave(room);
        }
    }

    getSlaveNamespace(serverId: string): SocketIo.Namespace | undefined {
        return this._slaveNamespaces.get(serverId);
    }

    addSlaveNamespace(serverId: string, server: SocketIo.Namespace): void {
        this._slaveNamespaces.set(serverId, server);
    }

    removeSlaveNamespace(serverId: string): void {
        this._slaveNamespaces.delete(serverId);
    }
}

export default SocketServer;