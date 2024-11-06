import Success from '../../responses/successful/Success';
import RedisServer from '../../loaders/RedisServer';

import { validator } from '../../utils/validator';
import { Request, Response } from "express";
import * as SocketIO from "socket.io";
import InternalServerError from "../../responses/serverErrors/InternalServerError";
import LiveBitcoinService, {BinanceHistoricalArgs} from "../services/LiveBitcoinService";

export const getHistorical = async (req: Request, res: Response) => {
    try {
        const { interval, symbol, limit } = req.query;
        const socket: SocketIO.Server = req.app.get('socket');
        const redis: RedisServer = req.app.get('redis');
        const liveBitcoinService = new LiveBitcoinService(socket, redis);

        const candleData = await liveBitcoinService.getHistoricalClient({
            symbol: symbol as string,
            interval: interval as BinanceHistoricalArgs["interval"],
            limit: 2000,
        });
        const fourierReadableData = candleData.map((item) => parseFloat(String(item.close)));
        console.log('fourierReadableData', fourierReadableData);
        const fourierTransform = liveBitcoinService.fourierTransform(fourierReadableData);

        const candleVisualData = candleData.map((item) => ({
            data: [item.open, item.high, item.low, item.close],
            time: item.time,
        }));
        const lineVisualData = fourierTransform.map((item, index) => ({
            data: item,
            time: candleVisualData[index].time,
        }));
        const queryResult = {
            candle: candleVisualData.slice(0, Number(limit) || 100),
            line: lineVisualData.slice(0, Number(limit) || 100),
        }
        const successResponse = new Success(queryResult).toJson;
        return res.status(200).json(successResponse);
    } catch (error: any) {
        throw error;
    }
}

