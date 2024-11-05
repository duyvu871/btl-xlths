import Redis from 'ioredis';
import config from "../common/config";

class RedisServer {
    private _redis!: Redis;
    private _redisPort: number = config.redisPort;

    public async initialize(): Promise<Redis> {
        if (this._redis) {
            console.info(new Date(), '[Redis]: Already Started');
            return this._redis;
        }

        const redisOptions = {
            host: config.redisHost,
            port: config.redisPort,
        };

        this._redis = new Redis(redisOptions);

        this._redis.on('error', (err) => {
            console.error(new Date(), '[Redis]: Error connecting:', err);
        });

        this._redis.on('connect', () => {
            console.log('Running Redis Server on port %s', this._redisPort);
        });

        return this._redis;
    }

    public async getValueWithKey(key: string): Promise<string | null> {
        try {
            const value = await this._redis.get(key);
            return value;
        } catch (err) {
            console.error(new Date(), '[Redis]: Error getting value:', err);
            return null;
        }
    }

    public async close(): Promise<void> {
        try {
            await this._redis.quit();
            console.info(new Date(), "[RedisServer]: Stopped");
        } catch (err) {
            console.error(new Date(), "[RedisServer]: Error stopping:", err);
        }
    }


    get instance(): Redis {
        if (!this._redis) {
            throw new Error("Redis not initialized. Call 'initialize' first.");
        }
        return this._redis;
    }
}

export default RedisServer;