import * as SocketIo from 'socket.io';
import Redis from 'ioredis';
import { Server } from 'http';

import { SocketEvent } from '../common/constants';

class SocketServer {
    private _io: SocketIo.Server;
    private _redis: Redis;
    private _clients: Map<string, SocketIo.Socket> = new Map();

    constructor(server: Server, redis: Redis) {
        this._io = new SocketIo.Server(server, {
            cors: {
                origin: "*",
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            },
            path: '/socket',
        });
        this._redis = redis;
        this.listen();
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

    getClient(socketId: string): SocketIo.Socket | undefined {
        return this._clients.get(socketId);
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

    async joinRoom(socketId: string, room: string): Promise<void> {
        const socket = this.getClient(socketId);
        if (socket) {
            socket.join(room);
        }
    }

    async leaveRoom(socketId: string, room: string): Promise<void> {
        const socket = this.getClient(socketId);
        if (socket) {
            socket.leave(room);
        }
    }
}

export default SocketServer;