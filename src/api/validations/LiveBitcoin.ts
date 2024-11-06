import { body, ValidationChain, query, param } from "express-validator";
import {commonText} from "./common";

const validateInterval = (interval: string) => {
    const intervals = ['1s', '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
    return intervals.includes(interval);
}

const validateTimezone = (timezone: string) => {
    const timezones = ['UTC', 'GMT'];
    return timezones.includes(timezone);
}

const validateLimit = (limit: number) => {
    return limit > 0 && limit <= 2000;
}

export const historicalParams: ValidationChain[] = [
    commonText(query('interval'))
        .custom(validateInterval).withMessage('invalid interval'),
    commonText(query('symbol')),
    commonText(query('limit'))
        .optional()
        .custom(validateLimit).withMessage('invalid limit'),
];
