import config from "../common/config";

import { resolve } from "path";
import * as fs from "fs";
import { Platform } from '../common/constants';

export const getPlatformPublicKey = (platform: Platform): string => {

    const publicKeyObj = {
        [Platform.SAMPLE_PLATFORM]: config.samplePlatformPublicKey
    };

    const publicKeyPath = resolve(publicKeyObj[platform]);
    const publicKey: string = fs.readFileSync(publicKeyPath, "utf-8");
    return publicKey;
}