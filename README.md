
# Hệ thống xử lý thời gian thực cho thuật toán làm mượt fourier transform với bitcoin

Dự án này xây dựng một hệ thống xử lý thuật toán cho phép người dùng thực thi các thuật toán khác nhau và nhận kết quả. Hệ thống được xây dựng bằng Node.js, Express.js, Socket.IO và Redis.

## Các chức năng chính

* **Giao diện người dùng (UI):** Cung cấp giao diện web để người dùng tương tác với hệ thống.
* **Kết nối thời gian thực (Real-time communication):** Sử dụng Socket.IO để cập nhật trạng thái xử lý và kết quả cho người dùng.
* **Lưu trữ dữ liệu tạm thời (Caching):** Sử dụng Redis để lưu trữ dữ liệu tạm thời.

## Cấu trúc thư mục

```text
    src/
    ├── @types/              => Các kiểu dữ liệu tùy chỉnh cho TypeScript
    ├── api/                 => API WebSocket với kiến trúc ba lớp
    |   ├── controllers/        => Lớp trình bày, nhận đầu vào và cung cấp đầu ra
    |   ├── middlewares/        => Lọc yêu cầu HTTP trước khi vào controllers
    |   ├── models/             => Lớp dữ liệu: mongoose
    |   ├── services/           => Lớp nghiệp vụ với logic nghiệp vụ
    |   ├── validations/        => Các quy tắc được xác định rõ ràng cho đầu vào được cung cấp
    |   ├── routes.ts           => Định tuyến yêu cầu đến các controllers tương ứng
    ├── common/              => Tài nguyên được chia sẻ giữa các dự án
    |   ├── interfaces/         => Định nghĩa đặc tả của các kiểu hoặc thực thể
    |   ├── config.ts           => Cấu hình môi trường với .env (dotenv)
    |   ├── constants.ts        => Enums (kiểu liệt kê)
    |   ├── types.ts            => Kiểu dữ liệu
    ├── loaders/             => Khởi động với Inversion of Control (Đảo ngược điều khiển)
    |   ├── ExpressServer.ts    => Khởi động cấu hình máy chủ Express
    |   ├── index.js            => Khởi động Express, Redis và Socket.io
    |   ├── RedisServer.ts      => Khởi động cấu hình máy chủ Redis
    |   ├── SocketServer.ts     => Cấu hình máy chủ Socket
    ├── responses/           => Trình xử lý lỗi tùy chỉnh cho phản hồi HTTP
    |   ├── clientErrors/       => Mã lỗi từ 400 đến 499
    |   ├── serverErrors/       => Mã lỗi 500 trở lên
    |   ├── successful/         => Phản hồi thành công
    |   ├── ErrorHandler.ts     => Middleware cho điểm trung tâm xử lý ngoại lệ
    ├── utils/               => Tiện ích cho toàn bộ dự án
    └── server.ts            => Điểm vào của Node để khởi động dự án

    workers/                 => Workers gốc cho các tính toán nặng
    ├── fourier.cpp          => Kịch bản C++ gốc cho phép biến đổi Fourier
    ├── fourier.py           => Kịch bản Python gốc cho phép biến đổi Fourier
    ├── fourier-addon.cc     => Addon gốc cho phép biến đổi Fourier
    └── fourier-transform-native.js

    playground/              => Sân chơi thử nghiệm cho các tính năng mới
    ├── addon-testing.js
    └── sample_fourier_transform.txt 
```

## Công nghệ sử dụng

* **Backend:** Node.js, Express.js, Socket.IO, Redis, C++
* **DataVisualization:** apexcharts

## Cài đặt và chạy dự án

1. **Clone dự án:** `git clone https://github.com/duyvu871/btl-xlths.git`
2. **Cài đặt dependencies:** `npm install`
3. **Cài đặt addon cho xử lí fourier:** `npm run addon:build`
4. **Cấu hình:**
    * Tạo file `.env` trong thư mục `root` của dự án và cấu hình các biến môi trường cần thiết (ví dụ: cổng server, key API, URL Redis...). Tham khảo file `.env.example` để biết danh sách các biến môi trường.
    * ```dotenv
      NODE_ENV=development
      SERVER_PORT=8080 
      REDIS_HOST=redis
      REDIS_PORT=6379

      SAMPLE_PLATFORM_AUDIENCE=1
      SAMPLE_PLATFORM_PUBLIC_KEY=123123

      KRAKEN_API_ENDPOINT=https://api.kraken.com/0/public
      BINANCE_API_ENDPOINT=https://api.binance.com/api/v3

      LIVE_SESSION_EXPIRE=86400 # 1 day
    ```
5. **Chạy server:** `npm start` (trong thư mục `root`)


## Sử dụng

1. Truy cập vào giao diện web tại địa chỉ `http://localhost:8080`.

## Đóng góp

Mọi đóng góp đều được hoan nghênh. Vui lòng tạo một pull request để đóng góp.


## Liên hệ

Nếu có bất kỳ thắc mắc hoặc đề xuất nào, vui lòng liên hệ qua email: [dubuicp123@gmail.com](dubuicp123@gmail.com)


## Giấy phép

