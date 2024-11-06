const fourierTransform = require('bindings')('fourier-transform-native');
const fs = require("fs");

const start = async () => {
    const fileData = await fs.promises.readFile('./sample_fourier_transform.txt');
    const data = fileData.toString().split('\n').map(Number);
    const start = performance.now();
    const result = fourierTransform.processPrices(data);
    const end = performance.now();
    const max = Math.max(...result);
    const min = Math.min(...result);
    console.log(result);

    console.log(`Max: ${max}`);
    console.log(`Min: ${min}`);
    console.log(`Time taken: ${end - start}ms`);
}

start();