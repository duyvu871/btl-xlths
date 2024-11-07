import * as SocketIO from "socket.io";
import RedisServer from "../../loaders/RedisServer";
import NotFound from "../../responses/clientErrors/NotFound";
import config from "../../common/config";
import BadRequest from "../../responses/clientErrors/BadRequest";
import { BinanceHistoricalArgs } from "./LiveBitcoinService";
import {NormalizeHistorical} from "../../@types/LiveBitcoin";

class LiveSessionService {
    constructor(private socket: SocketIO.Server, private redisServer: RedisServer, symbol: string) {}

    private getSessionKey(interval: BinanceHistoricalArgs["interval"], symbol: string): string {
        return `session:${symbol}:${interval}`; // Include interval in the key
    }

    public async saveMultipleKeys(
        interval: BinanceHistoricalArgs["interval"],
        symbol: string,
        data: NormalizeHistorical
    ): Promise<void> {
        const pipeline = this.redisServer.instance.pipeline();
        const sessionKey = this.getSessionKey(interval, symbol);

        data.forEach((item) => {
            const key = `${sessionKey}:${item.time}`;
            pipeline.hmset(key, item);
            pipeline.expire(key, config.liveSessionExpiration);
        });
        console.log(`Saving multiple keys ${sessionKey} with data`, data.length);
        try {
            const results = await pipeline.exec();
            // console.log("Results:", results);
            if (!results) {
                throw new BadRequest("400", "Failed to set multiple keys", {
                    message: "Failed to set multiple keys",
                    statusCode: 400
                });
            }
            results?.forEach((result, index) => {
                if (result[0]) {
                    console.error(`Error ${data[index].time}:`, result[0]);
                } else {
                    // console.log(`Đã lưu key ${data[index].time}`);
                }
            });
        } catch (error) {
            console.error("Failed to set multiple keys:", error)
        }
    }

    public async getSessionData(
        interval: BinanceHistoricalArgs["interval"],
        symbol: string,
        key: string
    ): Promise<NormalizeHistorical[number]> {
        const sessionKey = this.getSessionKey(interval, symbol);
        const searchKey = `${sessionKey}:${key}`;
        try {
            const sessionData = await this.redisServer.instance.hgetall(searchKey);
            if (!sessionData || Object.keys(sessionData).length === 0) {
                throw new NotFound("404", 'Session not found', {
                    message: 'Session not found',
                    statusCode: 404
                });
            }
            console.log(`Get hash ${searchKey} with data`, sessionData);
            return sessionData as unknown as NormalizeHistorical[number];

        } catch (error) {
            console.log("Failed to get session data:", error)
            throw error;
        }
    }

    public async getMultipleKeys(
        interval: BinanceHistoricalArgs["interval"],
        symbol: string,
        limit: number
    ): Promise<NormalizeHistorical> {
        const sessionKey = this.getSessionKey(interval, symbol);
        const keys = await this.redisServer.instance.keys(`${sessionKey}:*`);
        if (!keys || keys.length === 0) {
            throw new NotFound("404", "Keys not found", {
                message: "Keys not found",
                statusCode: 404
            });
        }

        try {
            const pipeline = this.redisServer.instance.pipeline();
            keys.forEach((key) => {
                pipeline.hgetall(key);
            });
            const results = await pipeline.exec();
            if (!results) {
                throw new NotFound("404", "Keys not found", {
                    message: "Keys not found",
                    statusCode: 404
                });
            }
            const historical = results.map((result) => result[1]) as unknown as NormalizeHistorical;
            historical.sort((a, b) => a.time - b.time); // Sort by time, ascending
            // console.log(`Get multiple keys ${sessionKey} with data`, historical);
            return historical.slice(0, limit);
        } catch (error) {
            console.error("Failed to get multiple keys:", error);
            throw error;
        }
    }

    public async updateSessionData(
        interval: BinanceHistoricalArgs["interval"],
        symbol: string,
        key: string,
        newData: Partial<NormalizeHistorical[number]>
    ): Promise<void> {
        const sessionKey = this.getSessionKey(interval, symbol);
        const searchKey = `${sessionKey}:${key}`;
        try {
            console.log(`Updating hash ${searchKey} with data`, newData);
            await this.redisServer.instance.hmset(searchKey, newData);
            await this.redisServer.instance.expire(searchKey, config.liveSessionExpiration);
        } catch (error) {
            console.log("Failed to update session data:", error)
        }
    }

    public async deleteSessionData(key: string): Promise<void> {
        try {
            await this.redisServer.instance.del(key);
        }
        catch (error) {
            console.error("Failed to delete session data:", error)
        }
    }
}

export default LiveSessionService;