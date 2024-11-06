import JsonWebToken from './middlewares/JsonWebToken';

import { Router, Request, Response } from "express";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import * as SocketIO from "socket.io";
import RedisServer from "../loaders/RedisServer";
import AsyncMiddleware from "../utils/asyncHandler";
import LiveSessionService from "./services/LiveSessionService";
import {historicalParams} from "./validations/LiveBitcoin";
import {getHistorical} from "./controllers/LiveBitcoinController";

const apiRouter = Router();
const pageRouter = Router();

apiRouter.get('/get-historical', historicalParams, getHistorical);

pageRouter.get('/', AsyncMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const sessionId = uuidv4();
    res
        .cookie('sessionId', sessionId)
        .sendFile(path.join(process.cwd(), 'views/index.html'));
}));
export default {
    apiRoutes: apiRouter,
    pageRoutes: pageRouter
};