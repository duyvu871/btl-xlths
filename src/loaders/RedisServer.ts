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

    async deleteSessionKeys(keyPattern: string): Promise<void> {
        try {
            const keys = await this._redis.keys(keyPattern);
            if (keys.length > 0) {
                const deletedCount = await this._redis.eval(
                    "local count = 0; for _, key in ipairs(redis.call('keys', ARGV[1])) do redis.call('del', key); count = count + 1; end; return count;",
                    0,
                    keyPattern
                );
                console.log(`Deleted ${deletedCount} keys.`);
            } else {
                console.log('No keys found.');
            }
        } catch (error) {
            console.error(`Delete keys pattern ${keyPattern} error:`, error);
        }
    }
}

export default RedisServer;