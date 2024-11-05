export async function retryWrapper<ResponseType>(
    fn: () => Promise<ResponseType>,
    name: string,
    retryOpt: {
        retryIndex: number;
        MAX_RETRY: number;
        RETRY_WAIT: number;
        condition?: (result: ResponseType) => Promise<boolean>;
        failAction?: () => void;
        fallbackAction?: () => void;
    }
): Promise<ResponseType | null> {
    const { retryIndex, MAX_RETRY, RETRY_WAIT, condition, fallbackAction, failAction } = retryOpt;
    try {
        const result = await fn();
        if (condition && !await condition(result)) {
            throw new Error('Condition not met');
        }
        return result;
    } catch (error) {
        if (retryIndex < MAX_RETRY) {
            failAction && failAction();
            console.log(`[${name}] Attempt ${retryIndex + 1} failed. Retrying in ${(RETRY_WAIT / 1000)} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_WAIT));
            return retryWrapper(fn, name, { ...retryOpt, retryIndex: retryIndex + 1 });
        }
        console.log(`[${name}] Failed after ${MAX_RETRY} attempts:`, error);
        fallbackAction && fallbackAction();
        return null;
    }
}