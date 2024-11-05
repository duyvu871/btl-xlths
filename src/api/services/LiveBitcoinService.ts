import config from '../../common/config';
import RedisServer from '../../loaders/RedisServer';
import * as SocketIO from "socket.io";
import {BinanceKline, Klines, KrakenOHLCResponse, NormalizeHistorical, OHLCData} from "../../@types/LiveBitcoin";
import axios from "axios";
import InternalServerError from "../../responses/serverErrors/InternalServerError";

import * as fourierTransformNative from "fourier-transform-native"
import {separateNumber} from "../../utils/number";
import {retryWrapper} from "../../utils/retry";
import LiveSessionService from "./LiveSessionService";

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

class LiveBitcoinService {

    constructor(private socket: SocketIO.Server, private redisServer: RedisServer) { }

    getHistoricalClient = async (args: BinanceHistoricalArgs): Promise<NormalizeHistorical> => {
        try {
            const liveSessionService = new LiveSessionService(this.socket, this.redisServer, args.symbol);
            return await liveSessionService.getMultipleKeys(args.interval, args.symbol, 2000);
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }

    getCurrentBinancePrice = async (symbol: string, interval: BinanceHistoricalArgs["interval"]): Promise<BinanceTicker> => {
        const apiEndpoint = config.binanceAPIEndpoint;
        const dataType = "ticker";

        const url = new URL(`${apiEndpoint}/${dataType}`);
        url.searchParams.append("symbol", symbol);
        url.searchParams.append("windowSize", interval);
        url.searchParams.append("type", "MINI");

        let requestConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url.toString(),
            headers: {
                'Accept': 'application/json'
            }
        };

        try {
            const response = await axios.request<BinanceTicker>(requestConfig);
            return response.data;
        } catch (e: any) {
            console.log(e);
            throw new InternalServerError("500", e.message, "Internal Server Error");
        }
    }

    getHistorical = async (type: "kraken"|"binance", options?: BinanceHistoricalArgs) => {
        if (type === "kraken") {
            return this.getKrakenHistorical();
        } else {
            return this.getBinanceHistorical({
                symbol: "BTCUSDT",
                interval: "1m",
                limit: 500,
                ...(options || {})
            });
        }
    }

    getKrakenHistorical = async () => {
        const apiEndpoint = config.krakenAPIEndpoint;
        const dataType = "OHLC";
        const pair = "XXBTZUSD";

        const url = new URL(`${apiEndpoint}/${dataType}`);
        url.searchParams.append("pair", pair);

        let requestConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url.toString(),
            headers: {
                'Accept': 'application/json'
            }
        };

        try {
            const response = await axios.request<KrakenOHLCResponse<"XXBTZUSD">>(requestConfig);
            if (response.data.error.length) {
                throw new InternalServerError("500", response.data.error.map((error) => error).join(", "), "Internal Server Error");
            }
            return response.data.result;
        } catch (e: any) {
            console.log(e);
            if (e instanceof InternalServerError) {
                throw e;
            }

            throw new InternalServerError("500", e.message, "Internal Server Error");
        }
    }

    getBinanceHistorical = async (option:BinanceHistoricalArgs) => {
        const apiEndpoint = config.binanceAPIEndpoint;
        const dataType = "klines";
        const symbol = option.symbol || "BTCUSDT";
        const interval = option.interval || "1m";
        const limits = (option?.limit && option?.limit > 500) ? separateNumber(option.limit, 500) : [500];

        const handleRequestStore = [];

        for (let limit of limits) {
            const startTime = option.startTime || Date.now() - (this.intervalToSeconds(interval) * 1000 * limit);
            const endTime = option.endTime || Date.now();
            const timeZone = option.timeZone || "7 (UTC)";

            const searchParams = new URLSearchParams();
            searchParams.append("symbol", symbol);
            searchParams.append("interval", interval);
            searchParams.append("limit", limit.toString());
            searchParams.append("startTime", startTime.toString());
            searchParams.append("endTime", endTime.toString());
            searchParams.append("timeZone", timeZone);

            const url = new URL(`${apiEndpoint}/${dataType}`);
            url.search = searchParams.toString();

            let requestConfig = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url.toString(),
                headers: {
                    'Accept': 'application/json'
                }
            };

            try {
                handleRequestStore.push(
                    retryWrapper(async () => axios.request<BinanceKline>(requestConfig), "binance", {
                        MAX_RETRY: 3,
                        RETRY_WAIT: 1000,
                        retryIndex: 0,
                        condition: async (response) => {
                            return response.data.length > 0;
                        }
                    }).then((response) => response?.data)
                )
            } catch (e: any) {
                console.log(e);
                throw new InternalServerError("500", e.message, "Internal Server Error");
            }

            const parallelHandle = await Promise.all(handleRequestStore);

            return parallelHandle.reduce((acc, curr) => {
                return (acc || []).concat(curr || []);
            }, []);
        }
    }

    normalizeHistoricalKrakenData = (history: OHLCData[] = []): NormalizeHistorical => {
        return history.map((data: OHLCData) => {
            return {
                time: data[0],
                open: parseFloat(data[1]),
                high: parseFloat(data[2]),
                low: parseFloat(data[3]),
                close: parseFloat(data[4]),
                volume: parseFloat(data[6]),
                count: data[7]
            }
        });
    }

    normalizeHistoricalBinanceData = (history: BinanceKline = []): NormalizeHistorical => {
        return history.map((data: Klines) => {
            return {
                time: data[0],
                open: parseFloat(data[1]),
                high: parseFloat(data[2]),
                low: parseFloat(data[3]),
                close: parseFloat(data[4]),
                volume: parseFloat(data[5]),
                count: data[8]
            }
        });
    }

    fourierTransform = (data: number[]): number[] => {
        return fourierTransformNative.processPrices(data);
    }

    intervalToSeconds = (interval: string): number => {
        const unit = interval.slice(-1);
        const value = parseInt(interval.slice(0, -1), 10);

        switch (unit) {
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 60 * 60 * 24;
            case 'w': return value * 60 * 60 * 24 * 7;
            case 'M': return value * 60 * 60 * 24 * 30;
            default: return 60;
        }
    }
}

export default LiveBitcoinService;