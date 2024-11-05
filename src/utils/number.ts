export function separateNumber(number: number, range: number): number[] {
    const result = [];
    const excess = number % range;
    const fullFits = Math.floor(number / range);
    for (let i = 0; i < fullFits; i++) {
        result.push(range);
    }
    if (excess > 0) {
        result.push(excess);
    }

    return result;
}