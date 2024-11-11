import LiveSessionService from '../src/api/services/LiveSessionService';
import RedisServer from '../src/loaders/RedisServer';
import * as SocketIO from 'socket.io';

describe('LiveSessionService', () => {
    let liveSessionService: LiveSessionService;
    let redisServer: RedisServer;
    let mockSocket: SocketIO.Server;

    beforeEach(() => {
        redisServer = new RedisServer();
        mockSocket = {} as SocketIO.Server; // Tạo mock cho SocketIO.Server
        liveSessionService = new LiveSessionService(mockSocket, redisServer, 'BTCUSDT');
    });

    test('should save multiple keys', async () => {
        const data = [
            { time: 1630000000000, open: 100, high: 110, low: 90, close: 105, volume: 1000, count: 1 },
            { time: 1630000060000, open: 105, high: 115, low: 95, close: 110, volume: 1200, count: 1 },
        ];

        await liveSessionService.saveMultipleKeys('1m', 'BTCUSDT', data);

        // Kiểm tra rằng dữ liệu đã được lưu vào Redis
        const savedData = await redisServer.getValueWithKey('session:BTCUSDT:1m:1630000000000');
        expect(savedData).toEqual(data[0]);
    });

    test('should retrieve session data', async () => {
        const data = {
            time: 1630000000000,
            open: 100,
            high: 110,
            low: 90,
            close: 105,
            volume: 1000,
            count: 1,
        };

        await liveSessionService.saveMultipleKeys('1m', 'BTCUSDT', [data]);

        const retrievedData = await liveSessionService.getSessionData('1m', 'BTCUSDT', '1630000000000');
        expect(retrievedData).toEqual(data);
    });

    // Thêm các test case khác tùy theo yêu cầu
});