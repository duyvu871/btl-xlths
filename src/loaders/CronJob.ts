import * as SocketIo from 'socket.io';
import Redis from 'ioredis';

import cron from "node-cron"
import {convertCronString} from "../utils/cron";
import LiveBitcoinService, {BinanceHistoricalArgs} from "../api/services/LiveBitcoinService";
import RedisServer from "./RedisServer";

class CronJob {
    private _io: SocketIo.Server;
    private _redis: RedisServer;
    private _cronLabel: BinanceHistoricalArgs["interval"][] = [];
    private _cronUpdateInterval: BinanceHistoricalArgs["interval"];
    constructor(_io: SocketIo.Server, _redis: RedisServer) {
        this._io = _io;
        this._redis = _redis;
        this._cronLabel = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
        this._cronUpdateInterval = '10s';
    }

    public initialize(): void {
        this.registerLiveBitcoinCron();
    }

    public registerLiveBitcoinCron(): void {
        const liveBitcoinService = new LiveBitcoinService(this._io, this._redis);
        this._cronLabel.forEach((label) => {
            cron.schedule(convertCronString(label), async (now) => {
                console.log(`Running a task every ${label}`);
                const currentSymbolTicker = await liveBitcoinService.getCurrentBinancePrice('BTCUSDT', label);
                // const
            });
        });
    }
}

export default CronJob;