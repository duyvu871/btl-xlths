import {ValidationChain} from "express-validator";

export function commonText(target: ValidationChain) {
    return target
        .isString().withMessage('must be string')
        .exists().withMessage('is required')
}