export function convertCronString(interval: '1s' | '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M'| string): string {
    const value = parseInt(interval, 10);
    const unit = interval.slice(-1);

    switch (unit) {
        case 's':
            return `*/${value} * * * * *`; // Every value seconds
        case 'm':
            return `${0} */${value} * * *`; // At minute 0 past every value minutes.
        case 'h':
            return `${0} 0 */${value} * *`; // At minute 0 past every value hours.
        case 'd':
            return `0 0 */${value} * *`;   // At 00:00 on every value days.
        case 'w':
            return `0 0 * * ${value}`;    // At 00:00 on value day-of-week (0 - 7) (Sunday=0 or 7) - see below
        case 'M':
            return `0 0 1 */${value} *`;   // At 00:00 on day-of-month 1 in every value month(s)  - also approximate
        default:
            throw new Error(`Invalid interval: ${interval}`);  // Throw error for invalid interval
    }
}