export type LiveBitcoinHistoryArgs = {
    type: "candle-stick" | "line";
    limit: number;
}

export type PairCode = "XXBTZUSD" | "XXBTZEUR" | "XXBTZGBP" | "XXBTZJPY" | "XXBTZCAD" | "XXBTZCHF" | "XXBTZAUD" | "XXBTZSGD" | "XXBTZHKD" | "XXBTZKRW" | "XXBTZPLN" | "XXBTZCZK";

export interface KrakenOHLCResponse<Pair extends PairCode> {
    error: [];
    result: Record<Pair, OHLCData[]> & {
        last: number;
    }
}

export type OHLCData = [
    number, // [0] time (Unix timestamp)
    string, // [1] open
    string, // [2] high
    string, // [3] low
    string, // [4] close
    string, // [5] vwap
    string, // [6] volume
    number  // [7] count
];

export type NormalizeHistorical = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    count: number;
}[];

export type Klines = [
    number,          // [0] Kline open time (timestamp)
    string,          // [1] Open price
    string,          // [2] High price
    string,          // [3] Low price
    string,          // [4] Close price
    string,          // [5] Volume
    number,          // [6] Kline Close time (timestamp)
    string,          // [7] Quote asset volume
    number,          // [8] Number of trades
    string,          // [9] Taker buy base asset volume
    string,          // [10] Taker buy quote asset volume
    string           // [11] Unused field (ignore)
];

export type BinanceKline = Klines[];
