import JsonWebToken from './middlewares/JsonWebToken';

import { Router, Request, Response } from "express";

import { store, list } from './controllers/TodoController';
import { storeValidation } from './validations/Todo';
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

// apiRouter.use('/sample-platform', JsonWebToken);
// apiRouter.post('/sample-platform/store', storeValidation, store);
// apiRouter.get('/sample-platform/list', list);
apiRouter.get('/get-historical', historicalParams, getHistorical);

pageRouter.get('/', AsyncMiddleware.asyncHandler(async (req: Request, res: Response) => {
    const sessionId = uuidv4();
    res
        .cookie('sessionId', sessionId)
        .sendFile(path.join(process.cwd(), 'statics/index.html'));
}));
export default {
    apiRoutes: apiRouter,
    pageRoutes: pageRouter
};