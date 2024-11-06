import * as SocketIo from 'socket.io';

import cron from "node-cron"
import {convertCronString} from "../utils/cron";
import LiveBitcoinService, {BinanceHistoricalArgs} from "../api/services/LiveBitcoinService";
import RedisServer from "./RedisServer";
import LiveSessionService from "../api/services/LiveSessionService";
import {NormalizeHistorical} from "../@types/LiveBitcoin";
import SocketServer from "./SocketServer";

class CronJob {
    private _io: SocketServer;
    private _redis: RedisServer;
    private _cronLabel: BinanceHistoricalArgs["interval"][] = [];
    private _cronUpdateInterval: BinanceHistoricalArgs["interval"];
    private _availableIntervals: BinanceHistoricalArgs["interval"][];
    private _cronJobs: Map<string, cron.ScheduledTask> = new Map();
    constructor(_io: SocketServer, _redis: RedisServer) {
        this._io = _io;
        this._redis = _redis;
        this._cronLabel = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
        this._availableIntervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d'];
        this._cronUpdateInterval = '5s';
    }

    public initialize(): void {
        this.registerLiveBitcoinCron();
        const exitSignals = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;
        exitSignals.forEach(signal => {
            process.on(signal, () => {
                this.stopCronJobs();
                process.exit(); // Ensure the process actually exits
            });
        });
        process.on('exit', () => {
            this.stopCronJobs();
        })
    }

    public async registerLiveBitcoinCron(): Promise<void> {
        await this._redis.deleteSessionKeys('session:*');

        const liveBitcoinService = new LiveBitcoinService(this._io.instance, this._redis);
        const liveSessionService = new LiveSessionService(this._io.instance, this._redis, 'BTCUSDT');
        const liveBitcoinNameSpace = this._io.getSlaveNamespace(LiveBitcoinService.name);

        console.log('Registering Live Bitcoin Cron Jobs');
        const labels = this._cronLabel;

        for (const label of labels) {
            const cronString = convertCronString(label);
            console.log(`Registering cron job for ${label} with cron string: ${cronString}`);
            // add cron job to map
            this._cronJobs.set(
                `getBTCUSDT:${label}`,
                cron.schedule(cronString, async (now) => {
                    try {
                        console.log(`Running a task every ${label}, time: ${now}`);
                        const currentSymbolTicker = await liveBitcoinService.getCurrentBinancePrice('BTCUSDT', label);
                        const normalizedData = liveBitcoinService.normalizeBinanceTicker(currentSymbolTicker);
                        await liveSessionService.updateSessionData(
                            label,
                            'BTCUSDT',
                            String(currentSymbolTicker.openTime),
                            normalizedData);
                        // console.log(currentSymbolTicker);
                    } catch (error) {
                        console.error('Error in Live Bitcoin Cron Job', error);
                    }
                })
            );
        }

        const historicalPromises = [];
        for (const label of labels) {
            historicalPromises.push(
                liveBitcoinService.getBinanceHistorical({symbol: 'BTCUSDT', interval: label, limit: 2000})
            );
        }

        const historicalData = await Promise.all(historicalPromises);

        const savePromises: Promise<void>[] = [];
        for (const [index, data] of historicalData.entries()) {
            const normalizedData = liveBitcoinService.normalizeHistoricalBinanceData(data);
            const noDuplication = new Map<number, NormalizeHistorical[number]>(); // Remove duplication
            normalizedData.forEach((item) => {
                noDuplication.set(item.time, item);
            });
            const historicalDataFlatten = Array.from(noDuplication.values());
            savePromises.push(
                liveSessionService.saveMultipleKeys(labels[index], 'BTCUSDT', historicalDataFlatten)
            );
        }
        // Save all historical data to Redis
        await Promise.all(savePromises);

        this._cronJobs.set(
            `updateBTCUSDT}`,
            cron.schedule(convertCronString(this._cronUpdateInterval), async (now) => {
                try {
                    console.log(`Running a task every ${this._cronUpdateInterval}, time: ${now}`);
                    const fetchingTickers = [];
                    const availableIntervals = this._availableIntervals;
                    for (const label of availableIntervals) {
                        fetchingTickers.push(
                            liveBitcoinService.getCurrentBinancePrice('BTCUSDT', label)
                        );
                    }
                    await Promise.all(fetchingTickers).then(tickers => {
                        tickers.forEach((currentSymbolTicker, index) => {
                            // console.log('currentSymbolTicker', currentSymbolTicker.lastPrice);
                            // console.log('liveBitcoinNameSpace', LiveBitcoinService.name);
                            try {
                                this._io.instance.emit(`liveBitcoin:${labels[index]}`, {
                                    data: [
                                        currentSymbolTicker.openPrice,
                                        currentSymbolTicker.highPrice,
                                        currentSymbolTicker.lowPrice,
                                        currentSymbolTicker.lastPrice
                                    ].map(parseFloat),
                                    time: currentSymbolTicker.openTime,
                                    close: currentSymbolTicker.closeTime,
                                })
                                liveBitcoinNameSpace && liveBitcoinNameSpace.to(`BTCUSDT:${labels[index]}`).emit(`liveBitcoin:${labels[index]}`, {
                                    data: [
                                        currentSymbolTicker.openPrice,
                                        currentSymbolTicker.highPrice,
                                        currentSymbolTicker.lowPrice,
                                        currentSymbolTicker.lastPrice
                                    ].map(parseFloat),
                                    time: currentSymbolTicker.openTime,
                                    close: currentSymbolTicker.closeTime,
                                });
                            } catch (e: any) {
                                console.error('Error in Live Bitcoin Cron Job', e);
                            }
                        });
                    });
                } catch (error) {
                    console.error('Error in Live Bitcoin Cron Job', error);
                }
            })
        );
    }

    stopCronJobs() {
        console.log('Stopping all cron jobs...');
        this._cronJobs.forEach((cron, key) => {
            console.log(`closed cron with key ${key}`);
            cron.stop();
        })
    }
}

export default CronJob;