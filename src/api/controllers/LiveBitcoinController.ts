import TodoService from '../services/TodoService';
import Success from '../../responses/successful/Success';
import Todo from '../models/Todo';
import RedisServer from '../../loaders/RedisServer';

import { validator } from '../../utils/validator';
import { Request, Response } from "express";
import * as SocketIO from "socket.io";
import InternalServerError from "../../responses/serverErrors/InternalServerError";
import LiveBitcoinService, {BinanceHistoricalArgs} from "../services/LiveBitcoinService";

export const getHistorical = async (req: Request, res: Response) => {
    try {
        const { interval, symbol } = req.query;
        const socket: SocketIO.Server = req.app.get('socket');
        const redis: RedisServer = req.app.get('redis');
        const liveBitcoinService = new LiveBitcoinService(socket, redis);

        const candleData = await liveBitcoinService.getHistoricalClient({
            symbol: symbol as string,
            interval: interval as BinanceHistoricalArgs["interval"]
        });
        const fourierReadableData = candleData.map((item) => item.close);

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
            candle: candleVisualData,
            line: lineVisualData
        }
        const successResponse = new Success(queryResult).toJson;
        return res.status(200).json(successResponse);
    } catch (error: any) {
        throw error;
    }
}

export const list = (req: Request, res: Response) => {

    const socket: SocketIO.Server = req.app.get('socket');
    const redis: RedisServer = req.app.get('redis');
    const todoService = new TodoService(socket, redis);
    const todoLists: Todo[] = todoService.getSampleList();

    const successResponse = new Success(todoLists).toJson;
    return res.status(200).json(successResponse);
}

