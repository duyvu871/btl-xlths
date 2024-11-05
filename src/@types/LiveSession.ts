export type LiveSession = {
    status: "active" | "inactive";
    chartData: ChartData[];
}

export type ChartData = {
    type: "line" | "bar" | "pie" | "candlestick";
    data: {
        x: string | number;
        y: string | number;
    }[];
}