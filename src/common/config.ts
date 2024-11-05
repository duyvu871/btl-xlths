import * as dotenv from "dotenv";
import { resolve } from "path";
import * as process from "process";

// environment file error should crash whole process
const ENV_FILE_PATH = resolve(".env");
const isEnvFound = dotenv.config({ path: ENV_FILE_PATH });
if (isEnvFound.error) {
    throw new Error("Cannot find .env file.");
}

// Assign default value for each environments
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.SERVER_PORT = process.env.SERVER_PORT || "8080";
process.env.REDIS_PORT = process.env.REDIS_PORT || "6379";
process.env.REDIS_HOST = process.env.REDIS_HOST || "redis";
process.env.SAMPLE_PLATFORM_PUBLIC_KEY = process.env.SAMPLE_PLATFORM_PUBLIC_KEY || "123123";

process.env.KRAKEN_API_ENDPOINT = process.env.KRAKEN_API_ENDPOINT || "https://api.kraken.com";

export default {
    // express server port
    serverPort: parseInt(process.env.SERVER_PORT, 10),

    // redis port
    redisPort: parseInt(process.env.REDIS_PORT, 10),
    redisHost: process.env.REDIS_HOST, 

    // json web token audiences
    samplePlatformAudience: process.env.SAMPLE_PLATFORM_AUDIENCE,
    samplePlatformPublicKey: process.env.SAMPLE_PLATFORM_PUBLIC_KEY,

    krakenAPIEndpoint: process.env.KRAKEN_API_ENDPOINT,
    binanceAPIEndpoint: process.env.BINANCE_API_ENDPOINT,

    liveSessionExpiration: parseInt(String(process.env.LIVE_SESSION_EXPIRE || 60 * 60 * 24 * 7)), // 7 days
}